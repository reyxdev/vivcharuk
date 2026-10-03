import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import type { AppLoadContext, EntryContext } from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';

// React Router's default server entry (@react-router/dev/dist/config/defaults/entry.server.node.tsx), with
// one change for round 24 G039–G040: the page's JavaScript is fetched at low priority.
//
// The page arrives fully rendered (SSR); its scripts only make it interactive (hydration) and, being
// modules, never block the first paint. At the browser's default (high) priority the ~180 KB of scripts
// compete with the stylesheet, the fonts and the first photo on a slow phone connection; at low priority
// those go first and the scripts right after them. React Router gives no option for the attribute of its
// <link rel="modulepreload">, so it is added to the HTML as it streams out.
const MODULEPRELOAD = /<link rel="modulepreload"/g;

function lowPriorityScripts(onEnd: () => void) {
  const decoder = new StringDecoder('utf8');
  let carry = '';
  const rewrite = (text: string, last: boolean) => {
    let s = carry + text;
    carry = '';
    // A tag cut in two by the stream waits for its other half.
    const open = s.lastIndexOf('<');
    if (!last && open !== -1 && s.indexOf('>', open) === -1) { carry = s.slice(open); s = s.slice(0, open); }
    return s.replace(MODULEPRELOAD, '<link rel="modulepreload" fetchpriority="low"');
  };
  return new Transform({
    transform(chunk: Buffer, _enc, done) { done(null, rewrite(decoder.write(chunk), false)); },
    flush(done) { onEnd(); done(null, rewrite(decoder.end(), true)); },
  });
}

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, { status: responseStatusCode, headers: responseHeaders });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');

    // Bots and SPA Mode renders wait for all content to load before responding.
    const readyOption: keyof RenderToPipeableStreamOptions = (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

    // Abort the rendering stream after `streamTimeout`, so it has time to flush down the rejected boundaries.
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeout + 1000);

    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      [readyOption]() {
        shellRendered = true;
        // Clearing the timeout once React has written everything keeps its closure from being retained.
        const body = lowPriorityScripts(() => { clearTimeout(timeoutId); timeoutId = undefined; });
        const stream = createReadableStreamFromReadable(body);
        responseHeaders.set('Content-Type', 'text/html');
        pipe(body);
        resolve(new Response(stream, { headers: responseHeaders, status: responseStatusCode }));
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        // Errors inside the shell are logged here; shell errors are logged by handleDocumentRequest.
        if (shellRendered) console.error(error);
      },
    });
  });
}

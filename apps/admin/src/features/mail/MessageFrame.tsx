import { useEffect, useRef, useState } from 'react';
import { attachmentUrl, type Message } from './api';

// A letter's cleaned HTML in a sandboxed frame: no scripts, links open in a new tab, remote images
// only after «Показати картинки» (round 19 D1 #33). Inline cid: pictures come from the attachments.
export function MessageFrame({ m, onFrame }: { m: Message; onFrame?: (w: Window | null) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [showRemote, setShowRemote] = useState(false);
  const [doc, setDoc] = useState<string | null>(null);
  const hasRemote = !!m.html?.includes('data-remote-src');

  useEffect(() => {
    let live = true;
    (async () => {
      let html = m.html ?? `<pre style="white-space:pre-wrap;font:inherit;margin:0">${(m.textBody ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)}</pre>`;
      for (const a of m.attachments.filter((x) => x.contentId)) {
        const url = await attachmentUrl(a.id).catch(() => '');
        html = html.split(`data-cid="${a.contentId}"`).join(`src="${url}"`);
      }
      if (showRemote) html = html.replace(/data-remote-src="/g, 'src="');
      const csp = `default-src 'none'; img-src blob: data:${showRemote ? ' https: http:' : ''}; style-src 'unsafe-inline'`;
      const out = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank"><style>body{margin:0;font:15px/1.55 system-ui,sans-serif;color:#1f2a22;word-break:break-word}img{max-width:100%;height:auto}table{max-width:100%}blockquote{margin:0 0 0 4px;padding-left:10px;border-left:3px solid #e2d3be;color:#5e594f}</style></head><body>${html}</body></html>`;
      if (live) setDoc(out);
    })();
    return () => { live = false; };
  }, [m, showRemote]);

  const fit = () => {
    const f = ref.current;
    if (!f?.contentDocument) return;
    f.style.height = `${f.contentDocument.documentElement.scrollHeight + 4}px`;
    onFrame?.(f.contentWindow);
  };

  return (
    <div className="flex flex-col gap-2">
      {hasRemote && !showRemote && (
        <button type="button" onClick={() => setShowRemote(true)} className="self-start rounded-md border border-border-control px-3 py-1.5 text-caption text-text-body hover:bg-bg-raised">
          Картинки з інтернету приховано — показати
        </button>
      )}
      {doc && <iframe ref={ref} title={m.subject} srcDoc={doc} onLoad={fit} sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals" className="w-full rounded-md bg-white" style={{ height: 80, border: 0 }} />}
    </div>
  );
}

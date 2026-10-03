import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useParams } from 'react-router';
import type { Route } from './+types/root';
import body400 from '../../../packages/tokens/fonts/web/e-ukraine-400.woff2?url';
import body500 from '../../../packages/tokens/fonts/web/e-ukraine-500.woff2?url';
import body700 from '../../../packages/tokens/fonts/web/e-ukraine-700.woff2?url';
import head500 from '../../../packages/tokens/fonts/web/e-ukraine-head-500.woff2?url';
import './app.css';

// The text faces on the first screen, fetched alongside the CSS instead of after the whole page is parsed.
// Round 24 G036: with the heading face (h1–h3 are e-Ukraine Head 500 on every page). Its 600/700 file is
// not preloaded: only smaller headings below the first screen use it, and an early fetch would compete with
// the first photo. G039: the web/ subsets (packages/tokens/fonts.css).
export const links: Route.LinksFunction = () => [
  ...[body400, body500, body700, head500].map((href) => ({ rel: 'preload', as: 'font', type: 'font/woff2', href, crossOrigin: 'anonymous' as const })),
  { rel: 'manifest', href: '/manifest.webmanifest' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams();
  return (
    <html lang={locale ?? 'uk'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/brand/favicon-64.png" />
        <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }));
  return (
    <QueryClientProvider client={client}>
      <Outlet />
    </QueryClientProvider>
  );
}

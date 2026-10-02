import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useParams } from 'react-router';
import type { Route } from './+types/root';
import body400 from '../../../packages/tokens/fonts/e-ukraine-400.woff2?url';
import body500 from '../../../packages/tokens/fonts/e-ukraine-500.woff2?url';
import body700 from '../../../packages/tokens/fonts/e-ukraine-700.woff2?url';
import './app.css';

// The text faces on the first screen, fetched alongside the CSS instead of after the whole page is parsed.
export const links: Route.LinksFunction = () =>
  [body400, body500, body700].map((href) => ({ rel: 'preload', as: 'font', type: 'font/woff2', href, crossOrigin: 'anonymous' as const }));

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

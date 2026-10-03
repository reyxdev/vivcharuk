import type { ErrorEnvelope, Locale } from '@vivcharyk/schemas';

// SSR data access. Development calls the API over loopback; production mounts the storefront in the
// API process and passes services in the load context (26 §26.3.3) — loaders only see this module.
const BASE = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:3000/api/v1';

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

export async function apiGet<T>(path: string, locale: Locale, params: Record<string, string | undefined> = {}): Promise<{ data: T; fallback: boolean }> {
  const url = new URL(BASE + path);
  url.searchParams.set('locale', locale);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorEnvelope | null;
    throw new ApiError(res.status, body?.error.code ?? 'INTERNAL_ERROR');
  }
  return { data: (await res.json()) as T, fallback: res.headers.get('x-translation-fallback') === 'true' };
}

const memo = new Map<string, { at: number; data: unknown }>();
/** apiGet kept in memory for `ttlMs`: values every page shows and the owner changes rarely (D28). */
export async function apiGetCached<T>(path: string, locale: Locale, ttlMs = 60_000): Promise<T> {
  const key = `${locale}:${path}`;
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  const { data } = await apiGet<T>(path, locale);
  memo.set(key, { at: Date.now(), data });
  return data;
}

/** Before answering 404: a slug changed in the admin leaves a 301 (23 §23.7). */
export async function redirectOr404(request: Request): Promise<never> {
  const path = new URL(request.url).pathname;
  const res = await fetch(`${BASE}/redirects/lookup?path=${encodeURIComponent(path)}`).catch(() => null);
  if (res?.ok) {
    const r = (await res.json()) as { toPath: string; statusCode: number };
    throw new Response(null, { status: r.statusCode, headers: { Location: r.toPath } });
  }
  throw new Response('Not Found', { status: 404 });
}

/** Per-locale URLs of a product or category that really exist in translation (29 §29.3). */
export async function alternatesFor(kind: 'product' | 'category', slug: string, locale: Locale): Promise<Partial<Record<Locale, string>>> {
  const { data } = await apiGet<{ alternates: Partial<Record<Locale, string>> }>('/seo/alternates', locale, { kind, slug }).catch(() => ({ data: { alternates: {} } }));
  return data.alternates;
}

/**
 * A private read on behalf of the visitor (the cart and its checkout quote, round 24 G018): their
 * cookie is passed on, nothing is cached, and a response that would create a new cart (Set-Cookie)
 * counts as «no cart» — the browser then asks for itself.
 */
export async function apiGetAsVisitor<T>(path: string, locale: Locale, cookie: string, params: Record<string, string | undefined> = {}): Promise<T | null> {
  const url = new URL(BASE + path);
  url.searchParams.set('locale', locale);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { cookie } }).catch(() => null);
  if (!res?.ok || res.headers.get('set-cookie')) return null;
  return (await res.json()) as T;
}

import type { ErrorEnvelope } from '@vivcharyk/schemas';

// Access token lives in memory only (24 §24.9); the refresh token is an httpOnly cookie.
let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const hasAccessToken = () => accessToken !== null;

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, readonly body?: ErrorEnvelope) { super(code); }
}

async function raw(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  return fetch(`/api/v1${path}`, { ...init, headers, credentials: 'same-origin' });
}

let refreshing: Promise<boolean> | null = null;
export function tryRefresh() {
  refreshing ??= raw('/auth/staff/refresh', { method: 'POST' })
    .then(async (r) => {
      if (!r.ok) { accessToken = null; return false; }
      accessToken = ((await r.json()) as { accessToken: string }).accessToken;
      return true;
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await raw(path, init);
  if (res.status === 401 && accessToken && !path.startsWith('/auth/staff/')) {
    if (await tryRefresh()) res = await raw(path, init);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => undefined);
  if (!res.ok) throw new ApiError(res.status, (body as ErrorEnvelope | undefined)?.error.code ?? 'INTERNAL_ERROR', body as ErrorEnvelope);
  return body as T;
}

export const post = <T>(path: string, data?: unknown) => api<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) });

/** Saves a file the API sends (an Excel export) under the given name. */
export async function download(path: string, filename: string) {
  let res = await raw(path);
  if (res.status === 401 && accessToken && await tryRefresh()) res = await raw(path);
  if (!res.ok) throw new ApiError(res.status, 'INTERNAL_ERROR');
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A file the API sends, as a Blob (mail attachments: the token cannot ride on a plain link). */
export async function fetchBlob(path: string) {
  let res = await raw(path);
  if (res.status === 401 && accessToken && await tryRefresh()) res = await raw(path);
  if (!res.ok) throw new ApiError(res.status, 'NOT_FOUND');
  return res.blob();
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddCartItemInput, CartResponse, Locale } from '@vivcharyk/schemas';

export const cartKeys = { cart: (locale: Locale) => ['cart', locale] as const };

export class CartError extends Error {
  constructor(readonly code: string, readonly body: unknown) { super(code); }
}

async function call(path: string, locale: Locale, init: RequestInit = {}): Promise<CartResponse> {
  const res = await fetch(`/api/v1${path}?locale=${locale}`, {
    ...init,
    credentials: 'same-origin',
    headers: init.body ? { 'content-type': 'application/json' } : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new CartError(body?.error?.code ?? 'INTERNAL_ERROR', body);
  return body as CartResponse;
}

export function useCart(locale: Locale) {
  return useQuery({ queryKey: cartKeys.cart(locale), queryFn: () => call('/cart', locale), staleTime: 30_000 });
}

// Every mutation returns the complete cart; it replaces the cache as server truth (26 §26.10.3).
export function useAddToCart(locale: Locale) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => call('/cart/items', locale, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (cart) => qc.setQueryData(cartKeys.cart(locale), cart),
  });
}

export function useRemoveFromCart(locale: Locale) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => call(`/cart/items/${itemId}`, locale, { method: 'DELETE' }),
    onSuccess: (cart) => qc.setQueryData(cartKeys.cart(locale), cart),
  });
}

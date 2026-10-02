import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';

export type TabKey = 'quick' | 'new' | 'awaiting_payment' | 'in_production' | 'to_ship' | 'shipped' | 'done' | 'all';

export interface OrderRow {
  id: string; number: string; placedAt: string; status: string; paymentStatus: string; payment: string; paid: boolean; paidMinor: number;
  totalMinor: number | null; customer: string; phone: string; city: string | null; delivery: string | null; carrier: string; trackingNumber: string | null;
  hasCustomSize: boolean; wholesale: boolean; itemsSummary: string; confirmedByCall: boolean; expectedDispatchAt: string | null; caution: string | null;
}
export interface OrdersPage { items: OrderRow[]; page: { number: number; total: number; totalPages: number; hasMore: boolean }; counts: Record<string, number> }

export interface QuickRow {
  id: string; status: string; phone: string; quantity: number; createdAt: string; calledAt: string | null; internalNote: string | null; productId: string; variantId: string | null;
  product: { name: string; sku: string; priceMinor: number; stockQty: number; options: string } | null;
}

export interface Transition { to: string; label: string; blockedBy?: string; needs?: 'call' | 'payment' | 'ttn' }
export interface Address { method: string; lastName?: string; firstName?: string; city?: string | null; warehouseLabel?: string | null; address?: string | null; postalCode?: string | null; patronymic?: string | null; company?: { name: string; edrpou: string } | null }
export interface OrderEvent { id: string; type: string; fromValue: string | null; toValue: string | null; actor: string | null; payload: { text?: string; reason?: string; amountMinor?: number; method?: string; note?: string; trackingNumber?: string; fields?: string[]; manual?: boolean } | null; createdAt: string }
export interface Detail {
  id: string; number: string; status: string; payment: string; paymentStatus: string; placedAt: string; phone: string; email: string | null; emailBouncedAt: string | null;
  customer: string; hasCustomSize: boolean; confirmedByCallAt: string | null; expectedDispatchAt: string | null; trackingNumber: string | null; shippingCarrier: string;
  subtotalMinor: number; discountMinor: number; discountSource: 'VOLUME' | 'PROMO_CODE' | null; couponCode: string | null; shippingMinor: number | null; shippingForwardMinor: number | null;
  totalMinor: number | null; amountDueNowMinor: number | null; prepaymentMinor: number | null; codAmountMinor: number | null; paidMinor: number; refundedMinor: number; customerNote: string | null;
  shippingAddress: Address;
  items: Array<{ id: string; nameSnapshot: string; sku: string; optionsSnapshot: Record<string, { label: string }>; customSpec: { widthCm: number; lengthCm: number } | null; quantityMilli: number; pricingUnitSnapshot: string; unitPriceMinor: number; totalMinor: number; thumb: string | null }>;
  events: OrderEvent[];
  payments: Array<{ id: string; status: string; amountMinor: number; provider: string; createdAt: string }>;
  fiscalReceipts: Array<{ id: string; status: string; amountMinor: number; fiscalCode: string | null; isPrepayment: boolean }>;
  transitions: Transition[];
  customerHistory: { previousOrders: number; previousValueMinor: number };
  caution: { reason: string; at: string | null } | null;
}

export interface ListParams { tab: Exclude<TabKey, 'quick'>; q: string; filters: URLSearchParams; sort: { key: string; dir: 'asc' | 'desc' } }

export function useOrderList(p: ListParams, enabled = true) {
  const qs = new URLSearchParams(p.filters);
  qs.set('tab', p.tab); qs.set('sort', p.sort.key); qs.set('dir', p.sort.dir);
  if (p.q.trim()) qs.set('q', p.q.trim());
  const key = qs.toString();
  // Polled so a new order shows up while the panel is open (round 11 #79).
  return useInfiniteQuery({
    queryKey: ['orders', 'list', key], enabled,
    queryFn: ({ pageParam }) => api<OrdersPage>(`/admin/orders?${key}&page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page.hasMore ? last.page.number + 1 : undefined),
    refetchInterval: 30_000, refetchOnWindowFocus: true,
  });
}

export const useQuickOrders = () =>
  useQuery({ queryKey: ['quick-orders', 'NEW,CALLED'], queryFn: () => api<{ items: QuickRow[]; counts: Record<string, number> }>('/admin/quick-orders?status=NEW,CALLED'), refetchInterval: 30_000 });

export const useOrder = (number: string) => useQuery({ queryKey: ['order', number], queryFn: () => api<Detail>(`/admin/orders/${number}`) });

/** Anything that touches an order can move it between tabs: refresh lists, the detail and the menu counters. */
export function useRefresh() {
  const qc = useQueryClient();
  return (number?: string) => Promise.all([
    qc.invalidateQueries({ queryKey: ['orders'] }),
    qc.invalidateQueries({ queryKey: ['counters'] }),
    qc.invalidateQueries({ queryKey: ['quick-orders'] }),
    qc.invalidateQueries({ queryKey: ['dashboard'] }),
    ...(number ? [qc.invalidateQueries({ queryKey: ['order', number] })] : []),
  ]);
}

export function useOrderAction<T>(number: string, fn: (v: T) => Promise<unknown>) {
  const refresh = useRefresh();
  return useMutation({ mutationFn: fn, onSuccess: () => refresh(number) });
}

export const confirmCall = (number: string) => post(`/admin/orders/${number}/confirm-call`, {});
export const transition = (number: string, body: { to: string; reason?: string; trackingNumber?: string; notify?: boolean }) => post<{ status: string }>(`/admin/orders/${number}/transition`, body);
export const addNote = (number: string, text: string) => post(`/admin/orders/${number}/notes`, { text });
export const recordPayment = (number: string, amountMinor: number) => post<{ full: boolean }>(`/admin/orders/${number}/payment`, { amountMinor });
export const recordRefund = (number: string, b: { amountMinor: number; method: 'CARD' | 'IBAN' | 'CASH'; note?: string }) => post(`/admin/orders/${number}/refund`, b);
// «Обережно» lives on the customer, keyed by phone (customers module).
export const markCaution = (phone: string, reason: string | null) => api(`/admin/customers/${encodeURIComponent(phone)}/caution`, { method: 'PUT', body: JSON.stringify({ reason }) });
export const editContact = (number: string, b: Record<string, string | null>) => api<{ changed: string[] }>(`/admin/orders/${number}/contact`, { method: 'PATCH', body: JSON.stringify(b) });
export const patchQuick = (id: string, b: { status?: string; internalNote?: string }) => api(`/admin/quick-orders/${id}`, { method: 'PATCH', body: JSON.stringify(b) });

/** The server's own Ukrainian reason when it gives one (a blocked step), else a plain message. */
export function errText(e: unknown) {
  if (!(e instanceof ApiError)) return messageFor('');
  const m = e.body?.error.message;
  if (m && /[а-яіїєґ]/i.test(m)) return m;
  const f = e.body?.error.fieldErrors?.[0]?.path;
  if (f === 'reason') return 'Вкажіть причину';
  if (f) return `Перевірте поле: ${FIELD[f] ?? f}`;
  if (m === 'CONCURRENT_UPDATE') return 'Хтось щойно змінив це замовлення. Оновіть сторінку.';
  if (m === 'TRANSITION_NOT_ALLOWED') return 'Цей крок зараз недоступний. Оновіть сторінку.';
  return messageFor(e.code);
}
const FIELD: Record<string, string> = { fullName: "прізвище та ім'я", phone: 'телефон', email: 'email', trackingNumber: 'ТТН', amountMinor: 'сума' };

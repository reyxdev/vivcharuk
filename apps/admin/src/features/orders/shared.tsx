import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Hammer, Package, PhoneCall, CircleCheck, Truck, type LucideIcon } from 'lucide-react';
import { useConfirm, useToast, Sheet } from '@/components/ui';
import { STATUS_LABEL, PAYMENT_LABEL, uah } from '@/lib/format';
import { confirmCall, errText, transition, useRefresh, type OrderRow } from './api';

export const DELIVERY_LABEL: Record<string, string> = { NP_BRANCH: 'Нова пошта, відділення', NP_COURIER: "Нова пошта, кур'єр", UKRPOSHTA: 'Укрпошта', PICKUP: 'Самовивіз, Яворів' };
export const DELIVERY_SHORT: Record<string, string> = { NP_BRANCH: 'НП', NP_COURIER: "НП кур'єр", UKRPOSHTA: 'Укрпошта', PICKUP: 'Самовивіз' };

// #211: why an order is cancelled; «Інше» asks for a few words.
export const CANCEL_REASONS = ['Покупець передумав', 'Не відповідає на дзвінки', 'Немає в наявності', 'Не оплатив', 'Дубль замовлення', 'Підозріле замовлення', 'Інше'];

const digits = (phone: string) => phone.replace(/\D/g, '');
export const isAnon = (phone: string) => phone.startsWith('anon-');
/** Call, Viber, Telegram (#109, #264). */
export const contactLinks = (phone: string) => ({
  tel: `tel:+${digits(phone)}`,
  viber: `viber://chat?number=%2B${digits(phone)}`,
  telegram: `https://t.me/+${digits(phone)}`,
});

/** «+380 67 123 45 67» — easier to read aloud on the phone. */
export const prettyPhone = (phone: string) => {
  const d = digits(phone);
  return d.length === 12 && d.startsWith('380') ? `+380 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}` : phone;
};

/** The one next step of #209, from the status alone (lists and bulk); the order page uses the server's list. */
export type StepKey = 'confirm' | 'production' | 'pack' | 'ship' | 'pickup' | 'deliver';
export const STEP: Record<StepKey, { label: string; icon: LucideIcon; to: string }> = {
  confirm: { label: 'Подзвонив, підтверджую', icon: PhoneCall, to: 'CONFIRMED' },
  production: { label: 'Виготовляти', icon: Hammer, to: 'IN_PRODUCTION' },
  pack: { label: 'Пакувати', icon: Package, to: 'PACKING' },
  ship: { label: 'Відправлено', icon: Truck, to: 'SHIPPED' },
  pickup: { label: 'Покупець забрав', icon: CircleCheck, to: 'DELIVERED' },
  deliver: { label: 'Отримано', icon: CircleCheck, to: 'DELIVERED' },
};
export function stepFor(o: { status: string; hasCustomSize: boolean; carrier?: string }): StepKey | null {
  switch (o.status) {
    case 'PENDING': return 'confirm';
    case 'CONFIRMED': return o.hasCustomSize ? 'production' : 'pack';
    case 'IN_PRODUCTION': return 'pack';
    case 'PACKING': return o.carrier === 'PICKUP' ? 'pickup' : 'ship';
    case 'SHIPPED': return 'deliver';
    default: return null;
  }
}
export const stepLabel = (k: StepKey, status: string) => (k === 'pack' && status === 'IN_PRODUCTION' ? 'Готово, пакувати' : STEP[k].label);

/** Runs one step. «Подзвонив, підтверджую» records the call, then confirms if the money allows. */
export async function runStep(number: string, k: StepKey, confirmedByCall: boolean): Promise<'done' | 'waiting_payment'> {
  if (k === 'confirm') {
    if (!confirmedByCall) await confirmCall(number);
    try { await transition(number, { to: 'CONFIRMED' }); } catch (e) {
      if (errText(e) === 'Оплата ще не надійшла') return 'waiting_payment';
      throw e;
    }
    return 'done';
  }
  await transition(number, { to: STEP[k].to });
  return 'done';
}

/**
 * «Змінити статус» for one row or for several ticked ones (#71–72, #88, #221). Each possible step is a
 * button with how many orders it applies to; «Відправлено» needs a TTN, so it is done on the order page.
 */
export function StatusSheet({ rows, onClose, onDone }: { rows: OrderRow[]; onClose: () => void; onDone?: () => void }) {
  const confirm = useConfirm();
  const toast = useToast();
  const refresh = useRefresh();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const groups = new Map<StepKey, OrderRow[]>();
  for (const r of rows) { const k = stepFor(r); if (k) groups.set(k, [...(groups.get(k) ?? []), r]); }
  const ship = groups.get('ship') ?? [];
  groups.delete('ship');
  const skipped = rows.filter((r) => !stepFor(r));

  const run = async (k: StepKey, list: OrderRow[]) => {
    const one = list.length === 1;
    const label = one ? stepLabel(k, list[0]!.status) : STEP[k].label;
    if (!(await confirm({ title: 'Ви впевнені?', text: one ? `${list[0]!.number}: «${label}».` : `«${label}» для ${list.length} замовлень.`, ok: label }))) return;
    setBusy(true);
    let ok = 0; let waiting = 0; const failed: string[] = [];
    for (const r of list) {
      try { (await runStep(r.number, k, r.confirmedByCall)) === 'waiting_payment' ? waiting++ : ok++; } catch (e) { failed.push(one ? errText(e) : r.number); }
    }
    setBusy(false);
    void refresh();
    if (failed.length) toast(one ? failed[0]! : `Не вдалося: ${failed.join(', ')}`, 'error');
    else if (waiting) toast(one ? 'Дзвінок записано. Підтвердите, коли надійде оплата.' : `Готово: ${ok}. Чекають оплату: ${waiting}.`);
    else toast(one ? 'Готово' : `Готово: ${ok}`);
    onDone?.();
    onClose();
  };

  return (
    <Sheet title={rows.length === 1 ? `Статус ${rows[0]!.number}` : `Змінити статус · ${rows.length}`} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {[...groups.entries()].map(([k, list]) => {
          const Icon = STEP[k].icon;
          return (
            <button key={k} type="button" disabled={busy} onClick={() => void run(k, list)}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border-control px-4 text-left text-body hover:bg-bg-alt disabled:opacity-50">
              <Icon size={18} strokeWidth={1.75} className="text-accent-text" />
              <span className="flex-1 text-text-primary">{list.length === 1 ? stepLabel(k, list[0]!.status) : STEP[k].label}</span>
              {rows.length > 1 && <span className="tabular text-body-sm text-text-muted">{list.length}</span>}
            </button>
          );
        })}
        {ship.length === 1 && rows.length === 1 && (
          <button type="button" onClick={() => { onClose(); nav(`/orders/${ship[0]!.number}?ship=1`); }}
            className="flex min-h-12 items-center gap-3 rounded-xl border border-border-control px-4 text-left text-body hover:bg-bg-alt">
            <Truck size={18} strokeWidth={1.75} className="text-accent-text" /><span className="flex-1 text-text-primary">Відправлено — ввести ТТН</span>
          </button>
        )}
        {ship.length > 0 && rows.length > 1 && <p className="text-body-sm text-text-muted">Відправити ({ship.length}) — по одному, на сторінці замовлення: там вводиться ТТН.</p>}
        {skipped.length > 0 && <p className="text-body-sm text-text-muted">{rows.length === 1 ? 'Це замовлення вже завершене.' : `Завершені пропущено: ${skipped.length}.`}</p>}
        {!groups.size && !ship.length && !skipped.length && <p className="text-body-sm text-text-muted">Немає доступних кроків.</p>}
      </div>
    </Sheet>
  );
}

/** «Поділитися текстом» (#289): plain text for Viber or a note; the phone's share sheet, else the clipboard. */
export async function shareOrder(o: { number: string; status: string; customer: string; phone: string; payment: string; totalMinor: number | null; paid: boolean; address: string; ttn: string | null; items: string[] }) {
  const text = [
    `Замовлення ${o.number} · ${STATUS_LABEL[o.status] ?? o.status}`,
    [o.customer, isAnon(o.phone) ? null : prettyPhone(o.phone)].filter(Boolean).join(', '),
    ...o.items,
    `Разом ${uah(o.totalMinor)} · ${PAYMENT_LABEL[o.payment] ?? o.payment}${o.paid ? ' · оплачено' : ''}`,
    o.address,
    o.ttn ? `ТТН ${o.ttn}` : null,
  ].filter(Boolean).join('\n');
  const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
  if (nav.share) { try { await nav.share({ text }); return 'shared'; } catch { /* closed by the person */ return 'cancelled'; } }
  await navigator.clipboard.writeText(text);
  return 'copied';
}

import { useEffect, useRef, useState } from 'react';
import { useSwipeClose } from '@/lib/motion';
import { useBusiness } from '@/lib/business';

/**
 * «Купити в 1 клік» (round 9 §P4.1; round 11 #40: a small centred dialog, a bottom sheet on
 * phones). The buyer leaves a phone number; we call back and create the order.
 */
export function QuickOrder({ variantId, label }: { variantId: string; label: string }) {
  const biz = useBusiness();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('+380');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  const ref = useRef<HTMLDialogElement>(null);
  const swipe = useSwipeClose<HTMLDialogElement>('down', () => ref.current?.close());

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!/^380\d{9}$/.test(digits)) { setErr('Вкажіть номер у форматі +380 XX XXX XX XX.'); return; }
    setState('sending'); setErr('');
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch('/api/v1/quick-orders', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ variantId, quantity: 1, phone: `+${digits}`, sourcePath: location.pathname, website: f.get('website') || undefined }),
    }).catch(() => null);
    if (res?.status === 202) setState('sent');
    else { setState('error'); setErr(res?.status === 429 ? 'Забагато спроб. Зателефонуйте нам, будь ласка.' : res?.status === 422 ? 'Цей варіант уже закінчився.' : 'Не вдалося надіслати. Спробуйте ще раз.'); }
  };

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setState('idle'); }} className="min-h-12 rounded-md border-2 border-text-primary px-6 text-body font-semibold text-text-primary">
        Купити в 1 клік
      </button>
      <dialog ref={(el) => { ref.current = el; swipe.current = el; }} onClose={() => setOpen(false)} aria-labelledby="qo-title"
        className="vk-dialog m-0 mt-auto w-full max-w-none rounded-t-xl bg-bg-page p-0 backdrop:bg-bg-inverted/50 sm:m-auto sm:max-w-md sm:rounded-xl">
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            {/* Round 24 G087: the dialog's title, not a heading of the product page. */}
            <p id="qo-title" className="text-h3 font-semibold text-text-primary">Купити в 1 клік</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрити" className="text-h3 leading-none text-text-muted">×</button>
          </div>
          {state === 'sent' ? (
            <p role="status" className="text-body-lg text-text-body">Дякуємо! Ми зателефонуємо, щоб уточнити доставку й оплату.</p>
          ) : (
            <>
              <p className="text-body text-text-body">{label}. Залиште номер — ми передзвонимо, уточнимо доставку й оплату та оформимо замовлення.</p>
              <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">Телефон
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" autoFocus
                  className="rounded-lg border border-border-control bg-bg-input px-3 py-3 text-body-lg text-text-primary" />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
              <button type="submit" disabled={state === 'sending'} aria-busy={state === 'sending'} className={`min-h-12 rounded-md bg-bg-inverted px-6 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${state === 'sending' ? 'vk-busy disabled:opacity-100' : ''}`}>
                {state === 'sending' ? 'Зачекайте…' : 'Чекаю дзвінка'}
              </button>
              <p className="text-caption text-text-muted">Лише номери України. Номер використаємо тільки для цього замовлення. Або зателефонуйте самі: {biz.phones[0]}.</p>
            </>
          )}
        </form>
      </dialog>
    </>
  );
}

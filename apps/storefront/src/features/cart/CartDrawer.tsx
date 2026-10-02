import { useEffect, useRef, useState } from 'react';
import { MascotScene } from '@/features/mascot/MascotScene';
import { Link } from 'react-router';
import type { CartLine, Locale } from '@vivcharyk/schemas';
import { formatUah } from '@/lib/money';
import { path } from '@/lib/segments';
import { useCartUiStore } from '@/stores/cartUiStore';
import { useAddToCart, useCart, useRemoveFromCart } from './api';
import { useSwipeClose } from '@/lib/motion';

// Round 10 part 5: photo, size and colour, remove, total; no − / +, no cross-sell; «Оформити» +
// «Продовжити покупки»; sold-out lines greyed and excluded from the sum.
function lineMeta(l: CartLine) {
  const parts = Object.entries(l.options).filter(([k]) => !(l.customSpec && k === 'size')).map(([, o]) => o.label);
  if (l.customSpec) parts.unshift(`свій розмір ${l.customSpec.widthCm}×${l.customSpec.lengthCm} см`);
  const q = l.pricingUnit === 'PIECE' ? `${l.quantityMilli / 1000} шт.` : l.pricingUnit === 'KILOGRAM' ? `${(l.quantityMilli / 1000).toLocaleString('uk-UA')} кг` : l.pricingUnit === 'SKEIN' ? `${l.quantityMilli / 1000} мот.` : `${(l.quantityMilli / 1000).toLocaleString('uk-UA')} м`;
  return [...parts, q].join(' · ');
}

export function CartDrawer({ locale }: { locale: Locale }) {
  const { open, setOpen } = useCartUiStore();
  const { data: cart } = useCart(locale);
  const remove = useRemoveFromCart(locale);
  const readd = useAddToCart(locale);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useSwipeClose<HTMLElement>('right', () => setOpen(false));
  // Round 11 #38 / A19: the row collapses, and «Повернути» stays for 5 s.
  const [collapsing, setCollapsing] = useState<string | null>(null);
  const [gone, setGone] = useState<CartLine | null>(null);
  useEffect(() => { if (!gone) return; const h = setTimeout(() => setGone(null), 5000); return () => clearTimeout(h); }, [gone]);
  const onRemove = (l: CartLine) => {
    setCollapsing(l.id);
    setTimeout(() => remove.mutate(l.id, { onSuccess: () => setGone(l), onSettled: () => setCollapsing(null) }), 220);
  };
  const undo = () => {
    if (!gone) return;
    readd.mutate({ variantId: gone.variantId, quantityMilli: gone.quantityMilli, ...(gone.customSpec ? { customSpec: gone.customSpec } : {}) });
    setGone(null);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, setOpen]);

  if (!open) return null;
  const items = cart?.items ?? [];

  return (
    <div className="fixed inset-0 z-(--z-modal)" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" aria-label="Закрити кошик" tabIndex={-1} className="vk-fade-in absolute inset-0 bg-bg-inverted/50" onClick={() => setOpen(false)} />
      <aside ref={swipe} className="vk-slide-right absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-bg-page shadow-xl">
        <div className="flex items-center justify-between border-b border-border-hairline px-5 py-4">
          <h2 id="cart-title" className="text-h3 text-text-primary">Кошик</h2>
          <button ref={closeRef} type="button" aria-label="Закрити кошик" className="grid size-11 place-items-center text-h3 text-text-primary" onClick={() => setOpen(false)}>×</button>
        </div>

        {gone && (
          <p role="status" className="vk-rise flex items-center justify-between gap-3 border-b border-border-hairline bg-bg-surface px-5 py-3 text-body-sm text-text-body">
            <span className="min-w-0 truncate">Прибрано «{gone.name}»</span>
            <button type="button" onClick={undo} className="shrink-0 font-semibold text-text-primary underline">Повернути</button>
          </p>
        )}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <MascotScene kind="cart" className="w-64 max-w-full" />
            <p className="text-body text-text-body">У кошику поки порожньо.</p>
            <button type="button" className="rounded-md border border-border-control px-5 py-3 text-body font-semibold text-text-primary" onClick={() => setOpen(false)}>Продовжити покупки</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-hairline overflow-y-auto px-5">
              {items.map((l) => (
                <li key={l.id} className={`flex gap-3 py-4 ${l.available ? '' : 'opacity-50'} ${collapsing === l.id ? 'vk-collapse' : ''}`}>
                  <div className="size-20 shrink-0 rounded-sm bg-bg-alt" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link to={path.product(locale, l.productSlug)} className="text-body font-medium text-text-primary hover:underline" onClick={() => setOpen(false)}>{l.name}</Link>
                    <span className="text-caption text-text-muted">{l.available ? lineMeta(l) : 'Вже продано — не входить у суму'}</span>
                    {l.available && <span className="text-body font-semibold text-text-primary">{formatUah(l.totalMinor, locale)}</span>}
                    {l.madeToOrderDays && l.available && <span className="text-caption text-text-muted">Виготовимо за {l.madeToOrderDays} днів</span>}
                  </div>
                  <button type="button" aria-label="Видалити з кошика" className="grid size-11 shrink-0 place-items-center text-text-muted hover:text-text-primary" disabled={remove.isPending || !!collapsing} onClick={() => onRemove(l)}>
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-border-hairline px-5 py-4">
              {cart?.discount && (
                <div className="flex justify-between text-body text-success">
                  <span>Оптова знижка{cart.discount.percent ? ` −${cart.discount.percent}%` : ''}</span><span>−{formatUah(cart.discount.amountMinor, locale)}</span>
                </div>
              )}
              {cart?.nextVolumeTier && <span className="text-caption text-text-muted">Ще {cart.nextVolumeTier.remaining} шт. «{cart.nextVolumeTier.name}» — і знижка на цей товар стане {cart.nextVolumeTier.percent}%</span>}
              <div className="flex justify-between text-h4 text-text-primary"><span>Разом</span><span>{formatUah(cart?.totalMinor ?? 0, locale)}</span></div>
              <span className="text-caption text-text-muted">Доставка рахується під час оформлення</span>
              {cart?.hasCustomSize && <span className="text-caption text-text-muted">У кошику виріб на ваш розмір: усе замовлення надішлемо разом, коли його виготовимо, оплата — повна, карткою.</span>}
              <Link to={path.seg(locale, 'checkout')} onClick={() => setOpen(false)} className="mt-2 rounded-md bg-bg-inverted px-5 py-3.5 text-center text-body font-semibold text-text-on-inverted">Оформити замовлення</Link>
              <button type="button" className="rounded-md border border-border-control px-5 py-3 text-body font-semibold text-text-primary" onClick={() => setOpen(false)}>Продовжити покупки</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

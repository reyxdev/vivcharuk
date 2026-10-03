import { useEffect, useRef, useState } from 'react';
import { LazyMascotScene as MascotScene } from '@/features/mascot/LazyMascotScene';
import { Link } from 'react-router';
import type { CartLine, Locale } from '@vivcharyk/schemas';
import { formatUah } from '@/lib/money';
import { path } from '@/lib/segments';
import { useCartUiStore } from '@/stores/cartUiStore';
import { useAddToCart, useCart, useRemoveFromCart } from './api';
import { useSwipeClose } from '@/lib/motion';
import { t } from '@/lib/i18n';

// Round 10 part 5: photo, size and colour, remove, total; no − / +, no cross-sell; «Оформити» +
// «Продовжити покупки»; sold-out lines greyed and excluded from the sum.
function lineMeta(l: CartLine, locale: Locale) {
  const parts = Object.entries(l.options).filter(([k]) => !(l.customSpec && k === 'size')).map(([, o]) => o.label);
  if (l.customSpec) parts.unshift(t(locale, 'cart.customSpec', { w: l.customSpec.widthCm, l: l.customSpec.lengthCm }));
  const n = l.quantityMilli / 1000, num = n.toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA');
  const q = l.pricingUnit === 'PIECE' ? `${n} ${t(locale, 'unit.pcs')}` : l.pricingUnit === 'KILOGRAM' ? `${num} ${t(locale, 'unit.kg')}` : l.pricingUnit === 'SKEIN' ? `${n} ${t(locale, 'unit.skein', { n })}` : `${num} ${t(locale, 'unit.m')}`;
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
      <button type="button" aria-label={t(locale, 'cart.close')} tabIndex={-1} className="vk-fade-in absolute inset-0 bg-bg-inverted/50" onClick={() => setOpen(false)} />
      <aside ref={swipe} className="vk-slide-right absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-bg-page shadow-xl">
        <div className="flex items-center justify-between border-b border-border-hairline px-5 py-4">
          <h2 id="cart-title" className="text-h3 text-text-primary">{t(locale, 'cart.title')}</h2>
          <button ref={closeRef} type="button" aria-label={t(locale, 'cart.close')} className="grid size-11 place-items-center text-h3 text-text-primary" onClick={() => setOpen(false)}>×</button>
        </div>

        {gone && (
          <p role="status" className="vk-rise flex items-center justify-between gap-3 border-b border-border-hairline bg-bg-surface px-5 py-3 text-body-sm text-text-body">
            <span className="min-w-0 truncate">{t(locale, 'cart.removed', { name: gone.name })}</span>
            <button type="button" onClick={undo} className="shrink-0 font-semibold text-text-primary underline">{t(locale, 'cart.undo')}</button>
          </p>
        )}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <MascotScene kind="cart" className="w-64 max-w-full" />
            <p className="text-body text-text-body">{t(locale, 'cart.empty')}</p>
            <button type="button" className="rounded-md border border-border-control px-5 py-3 text-body font-semibold text-text-primary" onClick={() => setOpen(false)}>{t(locale, 'cart.continue')}</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-hairline overflow-y-auto px-5">
              {items.map((l) => (
                <li key={l.id} className={`flex gap-3 py-4 ${l.available ? '' : 'opacity-50'} ${collapsing === l.id ? 'vk-collapse' : ''}`}>
                  <div className="size-20 shrink-0 rounded-sm bg-bg-alt" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link to={path.product(locale, l.productSlug)} className="text-body font-medium text-text-primary hover:underline" onClick={() => setOpen(false)}>{l.name}</Link>
                    <span className="text-caption text-text-muted">{l.available ? lineMeta(l, locale) : t(locale, 'cart.soldOut')}</span>
                    {l.available && <span className="text-body font-semibold text-text-primary">{formatUah(l.totalMinor, locale)}</span>}
                    {l.madeToOrderDays && l.available && <span className="text-caption text-text-muted">{t(locale, 'cart.madeIn', { n: l.madeToOrderDays })}</span>}
                  </div>
                  <button type="button" aria-label={t(locale, 'cart.remove')} className="grid size-11 shrink-0 place-items-center text-text-muted hover:text-text-primary" disabled={remove.isPending || !!collapsing} onClick={() => onRemove(l)}>
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-border-hairline px-5 py-4">
              {cart?.discount && (
                <div className="flex justify-between text-body text-success">
                  <span>{t(locale, 'cart.volumeDiscount')}{cart.discount.percent ? ` −${cart.discount.percent}${locale === 'en' ? '' : ' '}%` : ''}</span><span>−{formatUah(cart.discount.amountMinor, locale)}</span>
                </div>
              )}
              {cart?.nextVolumeTier && <span className="text-caption text-text-muted">{t(locale, 'cart.nextTier', { n: cart.nextVolumeTier.remaining, name: cart.nextVolumeTier.name, percent: cart.nextVolumeTier.percent })}</span>}
              <div className="flex justify-between text-h4 text-text-primary"><span>{t(locale, 'cart.total')}</span><span>{formatUah(cart?.totalMinor ?? 0, locale)}</span></div>
              <span className="text-caption text-text-muted">{t(locale, 'cart.shippingLater')}</span>
              {cart?.hasCustomSize && <span className="text-caption text-text-muted">{t(locale, 'cart.customNote')}</span>}
              <Link to={path.seg(locale, 'checkout')} onClick={() => setOpen(false)} className="mt-2 rounded-md bg-bg-inverted px-5 py-3.5 text-center text-body font-semibold text-text-on-inverted">{t(locale, 'cart.checkout')}</Link>
              <button type="button" className="rounded-md border border-border-control px-5 py-3 text-body font-semibold text-text-primary" onClick={() => setOpen(false)}>{t(locale, 'cart.continue')}</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

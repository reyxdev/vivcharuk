import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { contactLinks } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { path } from '@/lib/segments';
import { useCart } from '@/features/cart/api';
import { Messengers } from '@/components/contact/Messengers';
import { useCartUiStore } from '@/stores/cartUiStore';
import { useUi } from '@/stores/uiStore';
import { useWishlist } from '@/stores/wishlistStore';
import { useBump } from '@/lib/motion';

const icon = 'size-6';
const svg = (d: string) => <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={d} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Badge = ({ n, bump = false }: { n: number; bump?: boolean }) => (n > 0 ? <span className={`${bump ? 'vk-bounce ' : ''}absolute -right-2.5 -top-1 min-w-5 rounded-full bg-bg-inverted px-1.5 text-center text-caption font-semibold leading-5 text-text-on-inverted`}>{n}</span> : null);

function People() {
  const biz = useBusiness();
  return (
    <div className="flex flex-col gap-2">
      {biz.contactPeople.map((p) => {
        const l = contactLinks(p.phone);
        return (
          <p key={p.name} className="flex flex-wrap items-center gap-3 text-body">
            <span className="w-14 text-text-muted">{p.name}</span>
            {l ? <a href={l.tel} className="font-semibold text-text-primary">{p.phone}</a> : <span className="text-text-muted">{p.phone}</span>}
          </p>
        );
      })}
    </div>
  );
}

/** Round 10 part 1 #9: phones get a bottom bar — Каталог, Кошик, Обране, Зв'язок. */
function BottomBar({ locale }: { locale: Locale }) {
  const { data: cart } = useCart(locale);
  const cartBump = useBump(cart?.itemCount ?? 0);
  const openCart = useCartUiStore((s) => s.setOpen);
  const setMenu = useUi((s) => s.setMenu);
  const setContact = useUi((s) => s.setContact);
  const wish = useWishlist((s) => s.slugs.length);
  const buyBar = useUi((s) => s.buyBar);
  if (buyBar) return null;
  const item = 'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-caption text-text-primary';
  return (
    <nav aria-label="Швидкий доступ" className="fixed inset-x-0 bottom-0 z-(--z-sticky) flex border-t border-border-hairline bg-bg-page/[.97] pb-[env(safe-area-inset-bottom)] md:hidden">
      <button type="button" onClick={() => setMenu(true)} className={item}>{svg('M4 7h16M4 12h16M4 17h16')}Каталог</button>
      <button type="button" onClick={() => openCart(true)} className={item}><span className="relative">{svg('M2 10h20M4 10l1.7 8.4A2 2 0 007.7 20h8.6a2 2 0 002-1.6L20 10M6.5 10l3.5-6M17.5 10L14 4M9 13.5v3M12 13.5v3M15 13.5v3')}<Badge n={cart?.itemCount ?? 0} bump={cartBump} /></span>Кошик</button>
      <Link to={path.seg(locale, 'wishlist')} className={item}><span className="relative">{svg('M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z')}<Badge n={wish} /></span>Обране</Link>
      <button type="button" onClick={() => setContact(true)} className={item}>{svg('M4 5h16v11H8l-4 4z')}Зв'язок</button>
    </nav>
  );
}

function ContactSheet({ locale }: { locale: Locale }) {
  const biz = useBusiness();
  const open = useUi((s) => s.contactOpen);
  const setContact = useUi((s) => s.setContact);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-end bg-bg-inverted/50 md:hidden" onClick={() => setContact(false)}>
      <div role="dialog" aria-modal="true" aria-label="Зв'язок" onClick={(e) => e.stopPropagation()} className="flex w-full flex-col gap-4 rounded-t-xl bg-bg-page p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between"><h2 className="text-h3 text-text-primary">Зв'язок</h2><button type="button" onClick={() => setContact(false)} aria-label="Закрити" className="text-h3 text-text-muted">×</button></div>
        <People />
        <div className="text-text-primary"><Messengers /></div>
        <p className="text-body-sm text-text-muted">{biz.hoursText} <Link to={path.seg(locale, 'contacts')} onClick={() => setContact(false)} className="underline">Контакти</Link></p>
      </div>
    </div>
  );
}

/** Round 10 part 1 #13: desktop only; phones use «Зв'язок» in the bottom bar. */
function MessengerFab() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-(--z-sticky) flex flex-col items-end gap-3 max-md:hidden">
      {open && (
        <div role="dialog" aria-label="Написати нам" className="flex w-72 flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4 shadow-lg">
          <People />
          <div className="text-text-primary"><Messengers compact /></div>
        </div>
      )}
      <button type="button" aria-expanded={open} aria-label="Написати нам" onClick={() => setOpen(!open)} className="grid size-14 place-items-center rounded-full bg-bg-inverted text-text-on-inverted shadow-lg">
        {open ? <span className="text-h3 leading-none">×</span> : svg('M4 5h16v11H8l-4 4z')}
      </button>
    </div>
  );
}

/** Round 10 part 1 #23: bottom-left on desktop, above the bottom bar on phones. */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 2); // round 11 #66: after two screens
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (!show) return null;
  return (
    <button type="button" aria-label="Нагору" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="vk-fade-in fixed bottom-6 left-6 z-(--z-sticky) grid size-12 place-items-center rounded-full border border-border-control bg-bg-surface text-text-primary shadow-md max-md:bottom-20 max-md:left-auto max-md:right-4">
      {svg('M12 19V5M5 12l7-7 7 7')}
    </button>
  );
}

export function FloatingUi({ locale }: { locale: Locale }) {
  // The wishlist is rehydrated from localStorage after mount, so the server and first client render agree.
  useEffect(() => { void useWishlist.persist.rehydrate(); }, []);
  return (
    <>
      <BottomBar locale={locale} />
      <ContactSheet locale={locale} />
      <MessengerFab />
      <BackToTop />
    </>
  );
}

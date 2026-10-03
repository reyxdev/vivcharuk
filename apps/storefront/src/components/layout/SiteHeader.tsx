import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useMatches } from 'react-router';
import type { CategoryNode, Locale } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { t } from '@/lib/i18n';
import { PARTNERS_SLUG, path } from '@/lib/segments';
import { HeaderSearch } from '@/features/search/HeaderSearch';
import { MegaMenu } from './MegaMenu';
import { useUi } from '@/stores/uiStore';
import { useWishlist } from '@/stores/wishlistStore';
import { staticAlternates, TRANSLATED_LOCALES, type SeoData } from './SeoHead';
import { useBump, useIdle, useScrolled, useSwipeClose } from '@/lib/motion';
import { useCart } from '@/features/cart/api';
import { useCartUiStore } from '@/stores/cartUiStore';

// The language code stays `uk` in URLs and hreflang (ISO 639-1 for Ukrainian); people read «UK» as the
// United Kingdom, so the switcher shows the country-style label instead (client, 2026-10-03).
const SHORT_LABEL: Partial<Record<string, string>> = { uk: 'UA', en: 'EN', pl: 'PL', de: 'DE' };

const icon = 'size-6';
const IconSearch = () => <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>;
const IconPhone = () => <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></svg>;
const IconHeart = () => <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg>;
// A woven basket — «кошик». The old bag outline read as a rubbish bin.
const IconBag = () => <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 10h20M4 10l1.7 8.4A2 2 0 007.7 20h8.6a2 2 0 002-1.6L20 10M6.5 10l3.5-6M17.5 10L14 4M9 13.5v3M12 13.5v3M15 13.5v3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconChevron = () => <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;


/** ☰ that morphs into × (round 11 #69): the bars rotate after mount, so the change is seen. */
function MenuIcon({ open }: { open: boolean }) {
  const [x, setX] = useState(false);
  useEffect(() => { if (!open) return; const r = requestAnimationFrame(() => setX(true)); return () => cancelAnimationFrame(r); }, [open]);
  const bar = 'absolute left-0 h-0.5 w-6 rounded-full bg-current transition-[rotate,translate,opacity] duration-(--dur-base) ease-(--ease-out)';
  return (
    <span className="relative block size-6" aria-hidden="true">
      <span className={`${bar} top-1.5 ${x ? 'translate-y-[5px] rotate-45' : ''}`} />
      <span className={`${bar} top-[11px] ${x ? 'opacity-0' : ''}`} />
      <span className={`${bar} top-4 ${x ? '-translate-y-[5px] -rotate-45' : ''}`} />
    </span>
  );
}

/** Round 24 G005: a category without products stays off the menu until it has one (its page is noindex). */
const stocked = (nodes: CategoryNode[]): CategoryNode[] => nodes.filter((n) => n.productCount !== 0).map((n) => ({ ...n, children: stocked(n.children) }));

/** G093: the language switch leads to the same page in the other language, the home page when it has none. */
function useLanguageLinks() {
  const matches = useMatches();
  const { pathname } = useLocation();
  const seo = (matches.at(-1)?.data as { seo?: SeoData } | undefined)?.seo;
  const alt = seo?.alternates ?? staticAlternates(pathname) ?? {};
  return TRANSLATED_LOCALES.map((l) => ({ l, to: alt[l] ?? path.home(l) }));
}
const LANGUAGE_NAMES: Record<Locale, string> = { uk: 'Українська', en: 'English', pl: 'Polski', de: 'Deutsch' };

export function SiteHeader({ locale, categories: all, partners }: { locale: Locale; categories: CategoryNode[]; partners: boolean }) {
  const categories = useMemo(() => stocked(all), [all]);
  const biz = useBusiness();
  const phoneHref = `tel:${biz.phones[0].replace(/[^+\d]/g, '')}`;
  const drawerOpen = useUi((s) => s.menuOpen);
  const setDrawerOpen = useUi((s) => s.setMenu);
  const wish = useWishlist((s) => s.slugs.length);
  const { data: cart } = useCart(locale);
  const openCart = useCartUiStore((s) => s.setOpen);
  const count = cart?.itemCount ?? 0;
  const bump = useBump(count);
  const swipeMenu = useSwipeClose<HTMLDivElement>('left', () => setDrawerOpen(false));
  const scrolled = useScrolled();
  // The drawer is mounted hidden once the page is idle, so opening it is only a visibility change; a swipe that
  // closed it left its offset on the element, which is cleared before it shows again.
  const ready = useIdle();
  const languages = useLanguageLinks();
  useLayoutEffect(() => { const el = swipeMenu.current; if (drawerOpen && el) { el.style.translate = ''; el.style.transition = ''; } }, [drawerOpen, swipeMenu]);
  const links = [
    { to: path.seg(locale, 'wholesale'), label: t(locale, 'nav.wholesale') },
    { to: path.seg(locale, 'about'), label: t(locale, 'nav.about') },
    { to: path.seg(locale, 'reviews'), label: t(locale, 'nav.reviews') },
    { to: path.seg(locale, 'contacts'), label: t(locale, 'nav.contacts') },
  ];
  const navLink = 'rounded-sm px-1 py-2 text-body font-medium text-text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <header className={`sticky top-0 z-(--z-header) has-[[role=region]:not([hidden])]:z-(--z-overlay) border-b border-border-hairline bg-bg-page transition-shadow duration-(--dur-base) ${scrolled ? 'shadow-md' : ''}`}>
      <div className="mx-auto grid h-16 max-w-(--container-wide) grid-cols-[1fr_auto_1fr] grid-rows-[4rem] items-center px-4 lg:px-12">
        <nav aria-label={t(locale, 'nav.catalog')} className="flex items-center gap-6 max-lg:hidden">
          <MegaMenu locale={locale} categories={categories} partners={partners} label={t(locale, 'nav.catalog')} className={navLink} chevron={<IconChevron />} />
          {links.map((l) => <NavLink key={l.to} to={l.to} className={navLink}>{l.label}</NavLink>)}
        </nav>
        <button type="button" className="lg:hidden text-text-primary" aria-label={t(locale, 'nav.menu')} aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><MenuIcon open={false} /></button>

        {/* The logo hangs a little below the bar so it reads at a glance (round 17 B1). */}
        <Link to={path.home(locale)} className="relative z-(--z-overlay) h-16 self-start pt-1.5" aria-label={biz.brand}>
          <img src="/brand/logo-192.webp" srcSet="/brand/logo-96.webp 96w, /brand/logo-192.webp 192w, /brand/logo-240.webp 240w" sizes="(min-width: 1024px) 107px, (min-width: 640px) 88px, 73px" alt={biz.brand} width={192} height={158} className="h-15 w-auto drop-shadow-sm sm:h-[4.5rem] lg:h-[5.5rem]" />
        </Link>

        <div className="flex items-center justify-end gap-5 text-text-primary max-sm:gap-3">
          <HeaderSearch locale={locale} icon={<IconSearch />} label={t(locale, 'header.search')} />
          <a href={phoneHref} aria-label={t(locale, 'header.call')} className="max-sm:hidden"><IconPhone /></a>
          {/* Only languages that are really translated are offered (00-client-decisions-17: en/pl/de
              postponed until after launch); with Ukrainian alone there is nothing to switch to. */}
          {TRANSLATED_LOCALES.length > 1 && (
          <details className="relative max-md:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-border-hairline px-2.5 py-1.5 text-body-sm uppercase" aria-label={t(locale, 'header.language')}>{SHORT_LABEL[locale] ?? locale}</summary>
            <ul className="absolute right-0 top-full mt-1 rounded-md border border-border-hairline bg-bg-surface p-1 shadow-lg">
              {languages.map(({ l, to }) => <li key={l}><Link to={to} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined} className="block px-3 py-1.5 text-body-sm hover:bg-bg-alt">{LANGUAGE_NAMES[l]}</Link></li>)}
            </ul>
          </details>
          )}
          <Link to={path.seg(locale, 'wishlist')} aria-label={wish ? `${t(locale, 'header.wishlist')}, ${wish}` : t(locale, 'header.wishlist')} className="relative max-md:hidden">
            <IconHeart />
            {wish > 0 && <span className="absolute -right-2 -top-1.5 min-w-5 rounded-full bg-bg-inverted px-1.5 text-center text-caption font-semibold leading-5 text-text-on-inverted">{wish}</span>}
          </Link>
          <button type="button" aria-label={count ? `${t(locale, 'header.cart')}, ${count}` : t(locale, 'header.cart')} className={`relative ${bump ? 'vk-bounce' : ''}`} onClick={() => openCart(true)} data-cart-target>
            <IconBag />
            {count > 0 && <span className="absolute -right-2 -top-1.5 min-w-5 rounded-full bg-bg-inverted px-1.5 text-center text-caption font-semibold leading-5 text-text-on-inverted">{count}</span>}
          </button>
        </div>
      </div>

      {(drawerOpen || ready) && (
        <div ref={swipeMenu} hidden={!drawerOpen} className="vk-slide-left fixed inset-0 z-(--z-modal) bg-bg-page p-4 lg:hidden" role="dialog" aria-modal="true" aria-label={t(locale, 'nav.menu')}>
          {/* Round 11 #68–69: slides in from the left, the ☰ turns into ×, items appear in sequence. */}
          <button type="button" className="mb-4 flex h-8 items-center text-text-primary" aria-label={t(locale, 'nav.close')} onClick={() => setDrawerOpen(false)}><MenuIcon open /></button>
          <nav className="vk-seq flex flex-col gap-1">
            {categories.map((c) => <Link key={c.id} to={path.category(locale, c.slug)} className="py-2 text-h4 text-text-primary" onClick={() => setDrawerOpen(false)}>{c.name}</Link>)}
            {partners && <Link to={path.category(locale, PARTNERS_SLUG)} className="py-2 text-h4 text-text-primary" onClick={() => setDrawerOpen(false)}>{t(locale, 'product.partner')}</Link>}
            <hr className="my-3 border-border-hairline" />
            {links.map((l) => <Link key={l.to} to={l.to} className="py-2 text-body text-text-primary" onClick={() => setDrawerOpen(false)}>{l.label}</Link>)}
            {languages.length > 1 && (
              <div className="flex gap-4 py-2" aria-label={t(locale, 'header.language')} role="group">
                {languages.map(({ l, to }) => <Link key={l} to={to} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined} className={`text-body ${l === locale ? 'font-semibold text-text-primary' : 'text-text-muted underline'}`} onClick={() => setDrawerOpen(false)}>{LANGUAGE_NAMES[l]}</Link>)}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

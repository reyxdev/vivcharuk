import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronsLeft, ChevronsRight, CircleHelp, ExternalLink, KeyRound, LogOut, Moon, Search, Sun, Type, Volume2, VolumeX } from 'lucide-react';
import { api } from '@/lib/api';
import { chime, setSoundOn, soundOn } from '@/lib/newOrderSound';
import { useMe, useSignOut } from '@/features/auth/useSession';
import { MAIN, MORE_LINK, PHONE_TABS, sectionFor, type Section } from './sections';
import { GlobalSearch } from './GlobalSearch';
import { IconCircle, OfflineBanner, useStored } from './ui';
import { InstallHint } from '@/features/help/InstallHint';
import { TelegramPrompt } from '@/features/account/TelegramPrompt';

type Counters = { orders: number; quick: number; mail: number; reviews: number };

// Round 20 frame: forest menu on the left, wide with labels and collapsible to icons, remembered
// (#51, #101–102); the logo leads home (#58); search field, «?», «Відкрити сайт» and the name menu in
// the header (#38–39, #105, #180). On the phone: section name · magnifier · initials, hiding on scroll
// (#254–255), and an icon-only bottom bar (#239, #256).
export function Shell() {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const can = (perm?: string) => !perm || !!me?.permissions.includes(perm);
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useStored('menu.collapsed', false);
  const [userOpen, setUserOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const { data: counters } = useQuery({ queryKey: ['counters'], enabled: !!me, queryFn: () => api<Counters>('/admin/counters'), refetchInterval: 30_000 });
  const prevOrders = useRef<number | null>(null);
  useEffect(() => {
    if (!counters) return;
    const n = counters.orders + counters.quick;
    if (prevOrders.current !== null && n > prevOrders.current) chime();
    prevOrders.current = n;
    // Installed app icon badge (#291), where the phone allows it.
    const nav2 = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (n) void nav2.setAppBadge?.(n).catch(() => undefined); else void nav2.clearAppBadge?.().catch(() => undefined);
  }, [counters]);

  useEffect(() => { setUserOpen(false); setPhoneSearch(false); setHidden(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; if (Math.abs(y - lastY.current) > 8) { setHidden(y > lastY.current && y > 60); lastY.current = y; } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = (s: Section) => (!counters || !s.counter ? 0 : s.counter === 'orders' ? counters.orders + counters.quick : counters[s.counter]);
  const current = sectionFor(pathname);
  const initials = `${me?.firstName?.[0] ?? ''}${me?.lastName?.[0] ?? ''}`;
  const help = `/help${current && current.to !== '/' ? `#${current.to.slice(1)}` : ''}`;

  return (
    <div className="flex min-h-dvh bg-bg-page text-text-body">
      <aside className={`sticky top-0 flex h-dvh shrink-0 flex-col bg-menu text-menu-text transition-[width] duration-150 max-md:hidden ${collapsed ? 'w-[4.5rem]' : 'w-56'}`}>
        <Link to="/" className="flex items-center gap-2.5 px-4 py-4" aria-label="Головна">
          <img src="/admin/logo-96.webp" alt="" width={36} height={36} className="size-9 rounded-full bg-[#F2EDE3] p-0.5" />
          {!collapsed && <span className="text-h4 font-semibold tracking-tight text-white">Вівчарик</span>}
        </Link>
        <nav aria-label="Розділи" className="flex flex-1 flex-col gap-0.5 px-2">
          {MAIN.filter((s) => can(s.perm)).map((s) => <MenuItem key={s.to} s={s} n={count(s)} collapsed={collapsed} />)}
          <div className="mt-auto" />
          <MenuItem s={MORE_LINK} n={0} collapsed={collapsed} />
        </nav>
        <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
          className="m-2 flex items-center gap-2 rounded-lg px-3 py-2 text-caption text-menu-text/70 hover:bg-menu-active hover:text-white">
          {collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={18} /> Згорнути</>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-hairline bg-bg-page/95 px-4 backdrop-blur transition-transform duration-150 md:px-6 ${hidden ? 'max-md:-translate-y-full' : ''}`}>
          <span className="flex-1 truncate text-h4 font-semibold text-text-primary md:hidden">{current?.label ?? 'Вівчарик'}</span>
          <div className="flex-1 max-md:hidden"><GlobalSearch /></div>
          <button type="button" onClick={() => setPhoneSearch(true)} aria-label="Пошук" className="rounded-full p-2 text-text-primary hover:bg-bg-alt md:hidden"><Search size={20} /></button>
          <Link to={help} aria-label="Довідка про цей розділ" title="Довідка" className="rounded-full p-2 text-text-muted hover:bg-bg-alt max-md:hidden"><CircleHelp size={20} /></Link>
          <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-body-sm text-text-muted hover:bg-bg-alt max-md:hidden"><ExternalLink size={16} /> Відкрити сайт</a>
          <div className="relative">
            <button type="button" onClick={() => setUserOpen(!userOpen)} aria-expanded={userOpen} aria-label="Меню профілю"
              className="flex items-center gap-2 rounded-full p-0.5 pr-1 hover:bg-bg-alt md:pr-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-bg-inverted text-caption font-semibold text-text-on-inverted">{initials}</span>
              <span className="text-body-sm text-text-primary max-md:hidden">{me?.firstName}</span>
            </button>
            {userOpen && <UserMenu onClose={() => setUserOpen(false)} onSignOut={signOut} helpTo={help} name={`${me?.firstName ?? ''} ${me?.lastName ?? ''}`} email={me?.email ?? ''} />}
          </div>
        </header>
        {phoneSearch && (
          <div className="fixed inset-0 z-50 bg-bg-page p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:hidden">
            <GlobalSearch phone onClose={() => setPhoneSearch(false)} />
          </div>
        )}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-10">
          <Outlet />
        </main>
        <InstallHint />
        <TelegramPrompt />
      </div>

      <nav aria-label="Розділи" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-hairline bg-bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {PHONE_TABS.filter((s) => can(s.perm)).map((s) => {
          const n = count(s);
          return (
            <NavLink key={s.to} to={s.to} end={s.to === '/'} aria-label={s.label + (n ? `, ${n} нових` : '')}
              className={({ isActive }) => `relative flex flex-1 items-center justify-center py-2.5 ${isActive ? '' : 'opacity-75'}`}>
              {({ isActive }) => (
                <>
                  <span className={`rounded-full p-0.5 ${isActive ? 'ring-2 ring-offset-2 ring-offset-bg-surface' : ''}`} style={{ ['--tw-ring-color' as string]: s.color }}>
                    <IconCircle icon={s.icon} color={s.color} ink={s.ink} size={30} />
                  </span>
                  {!!n && <span className="tabular absolute left-[calc(50%+0.55rem)] top-0.5 min-w-5 rounded-full bg-danger px-1 text-center text-[0.7rem] font-semibold leading-5 text-white">{n}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function MenuItem({ s, n, collapsed }: { s: Section; n: number; collapsed: boolean }) {
  return (
    <NavLink to={s.to} end={s.to === '/'} title={collapsed ? s.label : undefined}
      className={({ isActive }) => `relative flex items-center gap-3 rounded-lg px-2 py-1.5 text-body-sm ${isActive ? 'bg-menu-active font-semibold text-white' : 'text-menu-text hover:bg-menu-active/60'}`}>
      <IconCircle icon={s.icon} color={s.color} ink={s.ink} size={30} />
      {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
      {!!n && (collapsed
        ? <span className="tabular absolute left-7 top-0.5 min-w-4 rounded-full bg-danger px-1 text-center text-[0.65rem] font-semibold leading-4 text-white">{n}</span>
        : <span className="tabular rounded-full bg-white/15 px-2 text-caption font-semibold text-white">{n}</span>)}
    </NavLink>
  );
}

function UserMenu({ onClose, onSignOut, name, email, helpTo }: { onClose: () => void; onSignOut: () => void; name: string; email: string; helpTo: string }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [font, setFont] = useState(() => document.documentElement.dataset.font ?? 'medium');
  const [sound, setSound] = useState(soundOn());
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [onClose]);
  const applyTheme = (t: string) => { setTheme(t); document.documentElement.dataset.theme = t; try { localStorage.setItem('vk.theme', t); } catch { /* */ } };
  const applyFont = (f: string) => { setFont(f); if (f === 'medium') delete document.documentElement.dataset.font; else document.documentElement.dataset.font = f; try { if (f === 'medium') localStorage.removeItem('vk.font'); else localStorage.setItem('vk.font', f); } catch { /* */ } };
  const seg = (on: boolean) => `flex-1 rounded-md px-2 py-1.5 text-caption ${on ? 'bg-bg-surface font-semibold text-text-primary shadow-sm' : 'text-text-muted'}`;
  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-body-sm text-text-primary hover:bg-bg-alt';
  return (
    <div ref={ref} role="menu" className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-border-hairline bg-bg-surface p-2 shadow-xl">
      <p className="px-3 pb-2 pt-1 text-body-sm font-semibold text-text-primary">{name}<span className="block truncate text-caption font-normal text-text-muted">{email}</span></p>
      <div className="flex flex-col gap-2 border-y border-border-hairline px-1 py-2">
        <div className="flex items-center gap-2 px-2"><span className="w-20 text-caption text-text-muted">Тема</span>
          <div className="flex flex-1 gap-1 rounded-lg bg-bg-alt p-0.5">
            <button type="button" className={seg(theme === 'light')} onClick={() => applyTheme('light')}><Sun size={14} className="mr-1 inline" />Світла</button>
            <button type="button" className={seg(theme === 'dark')} onClick={() => applyTheme('dark')}><Moon size={14} className="mr-1 inline" />Темна</button>
          </div></div>
        <div className="flex items-center gap-2 px-2"><span className="w-20 text-caption text-text-muted"><Type size={14} className="mr-1 inline" />Текст</span>
          <div className="flex flex-1 gap-1 rounded-lg bg-bg-alt p-0.5">
            <button type="button" className={seg(font === 'normal')} onClick={() => applyFont('normal')}>A</button>
            <button type="button" className={`${seg(font === 'medium')} text-body-sm`} onClick={() => applyFont('medium')}>A</button>
            <button type="button" className={`${seg(font === 'large')} text-body`} onClick={() => applyFont('large')}>A</button>
          </div></div>
        <button type="button" className={item} onClick={() => { const v = !sound; setSound(v); setSoundOn(v); if (v) chime(); }}>
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />} Звук нових замовлень: {sound ? 'увімкнено' : 'вимкнено'}
        </button>
      </div>
      <Link to="/account" className={item} onClick={onClose}><KeyRound size={16} /> Пароль і вхід</Link>
      <Link to={helpTo} className={`${item} md:hidden`} onClick={onClose}><CircleHelp size={16} /> Довідка</Link>
      <a href="/" target="_blank" rel="noopener" className={`${item} md:hidden`}><ExternalLink size={16} /> Відкрити сайт</a>
      <button type="button" className={`${item} text-danger`} onClick={onSignOut}><LogOut size={16} /> Вийти</button>
    </div>
  );
}

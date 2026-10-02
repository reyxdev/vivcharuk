import { TelegramLink } from '@/features/account/TelegramLink';
import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, ExternalLink, Globe, Mail, Package, Plus, Store, Trash2, Truck, Wallet, type LucideIcon } from 'lucide-react';
import { api, post } from '@/lib/api';
import { uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { chime, setSoundOn, soundOn } from '@/lib/newOrderSound';
import { GhostButton, Hint, IconCircle, PageHeader, PrimaryButton, SkeletonRows, useToast, useUnsavedGuard } from '@/components/ui';
import { BannersEditor } from './BannersEditor';
import { ShopForm, TickerEditor } from './SiteContent';
import { hoursShort, type SiteContact, type TickerItem } from '@vivcharyk/schemas';
import { errorText, inputCls, labelCls, Panel, Row, Switch, toLocal, fromLocal } from './parts';

interface Settings {
  values: {
    'admin.announcement': string | null; 'payments.card_enabled': boolean;
    'payments.prepayment.min_minor': number; 'payments.cod.max_minor': number; 'pricing.volume_tiers': Array<{ minUnits: number; percent: number }>;
    'site.contact': SiteContact; 'site.ticker': TickerItem[];
  };
  telegramBotConfigured: boolean; paymentsStub: boolean; novaPoshtaConfigured: boolean;
  business: { address: string; legalEntityName: string };
}
type Key = keyof Settings['values'];
type TileKey = 'shop' | 'delivery' | 'payment' | 'wholesale' | 'mail' | 'notify' | 'site';

const ERR = { SITE_PATH: 'Посилання — адреса сторінки нашого сайту, наприклад /uk/pro-nas.', BEFORE_START: 'Кінець має бути пізніше за початок.' };

function useSave() {
  const qc = useQueryClient();
  const toast = useToast();
  return async (key: Key, value: unknown) => {
    try { await api(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }); toast('Збережено'); await qc.invalidateQueries({ queryKey: ['settings'] }); return true; }
    catch (e) { toast(errorText(e), 'error'); return false; }
  };
}

// Round 20 #173–174: settings as tiles; each opens its own short form with «Зберегти».
export function SettingsPage() {
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: s } = useQuery({ queryKey: ['settings'], queryFn: () => api<Settings>('/admin/settings') });
  // The open tile lives in the address (?t=…), so the phone's back gesture returns to the tiles.
  const [params, setParams] = useSearchParams();
  const open = params.get('t') as TileKey | null;
  const setOpen = (k: TileKey) => setParams({ t: k });
  if (!s) return <><PageHeader title="Налаштування" /><SkeletonRows rows={4} /></>;
  const v = s.values;
  const tiers = v['pricing.volume_tiers'];
  const tiles: Array<{ key: TileKey; title: string; icon: LucideIcon; color: string; sum: string; hidden?: boolean }> = [
    { key: 'shop', title: 'Магазин', icon: Store, color: '#B08D4F', sum: `${hoursShort(v['site.contact'].week)} · ${v['site.contact'].phone}` },
    { key: 'delivery', title: 'Доставка', icon: Truck, color: '#5A8AAF', sum: s.novaPoshtaConfigured ? 'Нова пошта підключена' : 'Нова пошта: ще без ключа' },
    { key: 'payment', title: 'Оплата', icon: Wallet, color: '#2E7355', sum: `Накладений платіж до ${uah(v['payments.cod.max_minor'])} · картка ${v['payments.card_enabled'] ? 'увімкнена' : 'вимкнена'}` },
    { key: 'wholesale', title: 'Опт', icon: Package, color: '#C77D58', sum: tiers.length ? tiers.map((t) => `від ${t.minUnits} шт. −${t.percent}%`).join(' · ') : 'Без оптових знижок' },
    { key: 'mail', title: 'Пошта', icon: Mail, color: '#5A8AAF', sum: 'Шаблони, мітки, автовідповідь', hidden: !can('mail.read') },
    { key: 'notify', title: 'Сповіщення', icon: Bell, color: '#E0B33A', sum: `Telegram особисто кожному · звук ${soundOn() ? 'увімкнений' : 'вимкнений'}` },
    { key: 'site', title: 'Сайт', icon: Globe, color: '#8E76A8', sum: 'Стрічка вгорі й банери на головній', hidden: !can('promotions.read') },
  ];
  const tile = tiles.find((t) => t.key === open && !t.hidden && t.key !== 'mail');

  if (tile) return (
    <div className="flex max-w-2xl flex-col gap-4">
      <PageHeader title={tile.title} back="/settings" />
      {open === 'shop' && <ShopForm contact={v['site.contact']} business={s.business} canEdit={can('settings.update')} />}
      {open === 'delivery' && <DeliveryInfo s={s} />}
      {open === 'payment' && <PaymentForm s={s} canEdit={can('settings.update')} canCard={can('settings.manage_integrations')} />}
      {open === 'wholesale' && <WholesaleForm s={s} canEdit={can('settings.update')} />}
      {open === 'notify' && <NotifyForm s={s} canEdit={can('settings.manage_integrations')} canAnnounce={can('settings.update')} />}
      {open === 'site' && <SiteForm canEdit={can('promotions.manage_banners')} ticker={v['site.ticker']} />}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Налаштування" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.filter((t) => !t.hidden).map((t) => (
          t.key === 'mail'
            ? <Link key={t.key} to="/mail" className="flex items-center gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4 hover:bg-bg-alt"><TileBody t={t} /></Link>
            : <button key={t.key} type="button" onClick={() => setOpen(t.key)} className="flex items-center gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4 text-left hover:bg-bg-alt"><TileBody t={t} /></button>
        ))}
      </div>
    </div>
  );
}

function TileBody({ t: { title, icon, color, sum, key: k } }: { t: { title: string; icon: LucideIcon; color: string; sum: string; key: string } }) {
  return (
    <>
      <IconCircle icon={icon} color={color} ink={color === '#E0B33A' ? '#1C1B18' : '#fff'} size={40} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-body font-semibold text-text-primary">{title}{k === 'mail' && <ExternalLink size={14} className="text-text-faint" />}</span>
        <span className="block truncate text-body-sm text-text-muted">{sum}</span>
      </span>
    </>
  );
}

function DeliveryInfo({ s }: { s: Settings }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <Row label="Нова пошта">{s.novaPoshtaConfigured ? 'Підключена: міста, відділення й вартість рахуються самі.' : 'Ще не підключена. Коли з\'явиться ключ API Нової пошти, сайт сам рахуватиме вартість доставки, а ТТН можна буде створювати з панелі.'}</Row>
      <Row label="Самовивіз">Безкоштовно, у Яворові.</Row>
      <p className="text-body-sm text-text-muted">Доставка за кордон закрита на всіх мовах сайту.</p>
    </div>
  );
}

function PaymentForm({ s, canEdit, canCard }: { s: Settings; canEdit: boolean; canCard: boolean }) {
  const save = useSave();
  const v = s.values;
  const [codMax, setCodMax] = useState(String(v['payments.cod.max_minor'] / 100));
  const [floor, setFloor] = useState(String(v['payments.prepayment.min_minor'] / 100));
  const dirty = codMax !== String(v['payments.cod.max_minor'] / 100) || floor !== String(v['payments.prepayment.min_minor'] / 100);
  useUnsavedGuard(dirty);
  const submit = async () => {
    if (codMax !== String(v['payments.cod.max_minor'] / 100)) await save('payments.cod.max_minor', Math.round(Number(codMax) * 100));
    if (floor !== String(v['payments.prepayment.min_minor'] / 100)) await save('payments.prepayment.min_minor', Math.round(Number(floor) * 100));
  };
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <label className={labelCls}>
        <span className="flex items-center gap-1.5">Накладений платіж — лише для замовлень до, ₴ <Hint text="Дорожчі замовлення покупець оплачує карткою або за рахунком." /></span>
        <input value={codMax} onChange={(e) => setCodMax(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" disabled={!canEdit} className={`${inputCls} max-w-48 tabular`} />
      </label>
      <label className={labelCls}>
        <span className="flex items-center gap-1.5">Найменша передоплата, ₴ <Hint text="Передоплата — 10 % від товарів, але не менше цієї суми." /></span>
        <input value={floor} onChange={(e) => setFloor(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" disabled={!canEdit} className={`${inputCls} max-w-48 tabular`} />
      </label>
      {canEdit && <PrimaryButton disabled={!dirty || !codMax || !floor} onClick={() => void submit()} className="self-start">Зберегти</PrimaryButton>}
      <div className="flex flex-col gap-1 border-t border-border-hairline pt-4">
        <Switch on={v['payments.card_enabled']} disabled={!canCard} label="Оплата карткою на сайті" onChange={(on) => void save('payments.card_enabled', on)} />
        <p className="text-body-sm text-text-muted">Вмикайте лише після реєстрації каси WayForPay (ПРРО). Без неї покупцям недоступні картка, накладений платіж з оглядом і передоплата.{s.paymentsStub ? ' Зараз працює тестова оплата.' : ''}</p>
      </div>
    </div>
  );
}

function WholesaleForm({ s, canEdit }: { s: Settings; canEdit: boolean }) {
  const save = useSave();
  const initial = s.values['pricing.volume_tiers'].map((t) => ({ minUnits: String(t.minUnits), percent: String(t.percent) }));
  const [tiers, setTiers] = useState(initial);
  const dirty = JSON.stringify(tiers) !== JSON.stringify(initial);
  useUnsavedGuard(dirty);
  const set = (i: number, k: 'minUnits' | 'percent', val: string) => setTiers(tiers.map((x, n) => (n === i ? { ...x, [k]: val.replace(/\D/g, '') } : x)));
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <p className="text-body-sm text-text-muted">Рахується в кошику сама, для кожного товару окремо (його розміри й кольори разом). З промокодом не додається — покупець отримує більшу з двох знижок.</p>
      {tiers.map((t, i) => (
        <div key={i} className="flex items-center gap-2 text-body text-text-primary">
          від <input value={t.minUnits} onChange={(e) => set(i, 'minUnits', e.target.value)} aria-label={`Рівень ${i + 1}: від скількох штук`} inputMode="numeric" disabled={!canEdit} className={`${inputCls} w-20 tabular`} /> шт. —
          <input value={t.percent} onChange={(e) => set(i, 'percent', e.target.value)} aria-label={`Рівень ${i + 1}: знижка, %`} inputMode="numeric" disabled={!canEdit} className={`${inputCls} w-20 tabular`} /> %
          {canEdit && <button type="button" onClick={() => setTiers(tiers.filter((_, n) => n !== i))} aria-label="Прибрати рівень" className="rounded-full p-2 text-text-muted hover:bg-bg-alt"><Trash2 size={16} /></button>}
        </div>
      ))}
      {canEdit && tiers.length < 5 && <GhostButton icon={Plus} onClick={() => setTiers([...tiers, { minUnits: '', percent: '' }])} className="self-start">Рівень</GhostButton>}
      {canEdit && <PrimaryButton disabled={!dirty} className="self-start" onClick={() => void save('pricing.volume_tiers', tiers.map((t) => ({ minUnits: Number(t.minUnits), percent: Number(t.percent) })).filter((t) => t.minUnits && t.percent))}>Зберегти</PrimaryButton>}
    </div>
  );
}

function NotifyForm({ s, canEdit, canAnnounce }: { s: Settings; canEdit: boolean; canAnnounce: boolean }) {
  const save = useSave();
  const toast = useToast();
  const v = s.values;
  const [announcement, setAnnouncement] = useState(v['admin.announcement'] ?? '');
  const [sound, setSound] = useState(soundOn);
  return (
    <div className="flex flex-col gap-4">
      <Panel title="Telegram" sub="Кожен підключає свій особистий Telegram. Хто може отримувати сповіщення — вирішує власник у «Співробітниках».">
        <BotHealth />
        <TelegramLink />
      </Panel>
      <Panel title="Звук нових замовлень" sub="Касове «дзинь», коли приходить нове замовлення. Окремо на кожному комп'ютері чи телефоні.">
        <div className="flex flex-wrap items-center gap-3">
          <Switch on={sound} label="Увімкнено на цьому пристрої" onChange={(on) => { setSound(on); setSoundOn(on); }} />
          <GhostButton onClick={chime} disabled={!sound}>Прослухати</GhostButton>
        </div>
      </Panel>
      <Panel title="Оголошення для працівників" sub="Видно всім у панелі на головній сторінці.">
        <textarea aria-label="Оголошення для працівників" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={2} maxLength={500} disabled={!canAnnounce} className={inputCls} />
        {canAnnounce && <PrimaryButton disabled={announcement.trim() === (v['admin.announcement'] ?? '')} className="self-start" onClick={() => void save('admin.announcement', announcement.trim() || null)}>Зберегти</PrimaryButton>}
      </Panel>
    </div>
  );
}

interface Announcement { text: string; linkUrl: string | null; startsAt: string | null; endsAt: string | null; isActive: boolean }

// The strip at the top of the site: the owner's phrases (D29) plus one seasonal message that leads while active.
function SiteForm({ canEdit, ticker }: { canEdit: boolean; ticker: TickerItem[] }) {
  const toast = useToast();
  const { data, refetch, isPending } = useQuery({ queryKey: ['announcement'], queryFn: () => api<Announcement | null>('/admin/announcement') });
  const [f, setF] = useState<{ text: string; linkUrl: string; startsAt: string; endsAt: string; isActive: boolean } | null>(null);
  const cur = f ?? (data ? { text: data.text, linkUrl: data.linkUrl ?? '', startsAt: toLocal(data.startsAt), endsAt: toLocal(data.endsAt), isActive: data.isActive } : { text: '', linkUrl: '', startsAt: '', endsAt: '', isActive: true });
  useUnsavedGuard(!!f);
  const save = async () => {
    try {
      await api('/admin/announcement', { method: 'PUT', body: JSON.stringify({ text: cur.text, linkUrl: cur.linkUrl, startsAt: fromLocal(cur.startsAt), endsAt: fromLocal(cur.endsAt), isActive: cur.isActive }) });
      await refetch(); setF(null); toast('Збережено. На сайті — протягом хвилини.');
    } catch (e) { toast(errorText(e, ERR), 'error'); }
  };
  if (isPending) return <SkeletonRows rows={3} />;
  return (
    <div className="flex flex-col gap-4">
      <TickerEditor items={ticker} canEdit={canEdit} />
      <Panel title="Сезонне повідомлення" sub="Стає першим у стрічці, доки діє.">
        <label className={labelCls}>Сезонне повідомлення
          <input value={cur.text} onChange={(e) => setF({ ...cur, text: e.target.value })} maxLength={120} placeholder="Новорічні подарунки — відправимо до 20 грудня" disabled={!canEdit} className={inputCls} />
        </label>
        <label className={labelCls}>Посилання на сторінку сайту (необов'язково)
          <input value={cur.linkUrl} onChange={(e) => setF({ ...cur, linkUrl: e.target.value.trim() })} placeholder="/uk/kolektsii/na-podarunok" disabled={!canEdit} className={`${inputCls} font-mono`} />
        </label>
        <div className="grid grid-cols-2 gap-2 [&_input]:min-w-0">
          <label className={labelCls}>Показувати з<input type="datetime-local" value={cur.startsAt} onChange={(e) => setF({ ...cur, startsAt: e.target.value })} disabled={!canEdit} className={inputCls} /></label>
          <label className={labelCls}>до<input type="datetime-local" value={cur.endsAt} onChange={(e) => setF({ ...cur, endsAt: e.target.value })} disabled={!canEdit} className={inputCls} /></label>
        </div>
        <Switch on={cur.isActive} disabled={!canEdit} label="Показувати" onChange={(on) => setF({ ...cur, isActive: on })} />
        {canEdit && <PrimaryButton disabled={!f || cur.text.trim().length < 3} onClick={() => void save()} className="self-start">Зберегти</PrimaryButton>}
      </Panel>
      <BannersEditor canEdit={canEdit} />
    </div>
  );
}

/** T47: is the bot alive. */
function BotHealth() {
  const { data } = useQuery({ queryKey: ['telegram-health'], queryFn: () => api<{ configured: boolean; username: string | null; error: string | null }>('/admin/telegram/health'), refetchInterval: 30_000 });
  if (!data) return null;
  if (!data.configured) return <p className="text-body-sm text-warning">Бот не підключений: на сервері немає токена.</p>;
  if (data.error) return <p className="text-body-sm text-warning">Бот не відповідає: {data.error}</p>;
  return <p className="text-ok text-body-sm">Бот {data.username ? `@${data.username}` : ''} працює</p>;
}

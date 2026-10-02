import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { hoursShort, siteContactSchema, tickerSchema, type DayHours, type SiteContact, type TickerItem } from '@vivcharyk/schemas';
import { api } from '@/lib/api';
import { GhostButton, PrimaryButton, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import { errorText, inputCls, labelCls, Panel, Row, Switch, useDragOrder } from './parts';

const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя'];
const ERR = { STAFF_LOGIN: 'Це адреса для входу в панель — на сайті її показувати не можна. Вкажіть пошту для покупців.' };

function useSaveSetting() {
  const qc = useQueryClient();
  const toast = useToast();
  return async (key: string, value: unknown, known: Record<string, string> = {}) => {
    try {
      await api(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
      toast('Збережено. На сайті — протягом хвилини-двох.');
      await qc.invalidateQueries({ queryKey: ['settings'] });
      return true;
    } catch (e) { toast(errorText(e, known), 'error'); return false; }
  };
}

/** The first message of each field from a failed check, keyed by the field's top-level name. */
function fieldErrors(issues: Array<{ path: Array<string | number>; message: string }>) {
  const out: Record<string, string> = {};
  for (const i of issues) { const k = i.path.length > 1 && i.path[0] === 'week' ? `week.${i.path[1]}` : String(i.path[0] ?? ''); out[k] ??= i.message; }
  return out;
}

/**
 * Round 20 #173, D28: Іван edits the hours, the shop phone (calls, Viber, Telegram, WhatsApp) and the
 * public e-mail. The site, its structured data and the letters read them from here; seller details stay
 * in code.
 */
export function ShopForm({ contact, business, canEdit }: { contact: SiteContact; business: { address: string; legalEntityName: string }; canEdit: boolean }) {
  const save = useSaveSetting();
  const [f, setF] = useState<SiteContact | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const cur = f ?? contact;
  useUnsavedGuard(!!f);
  const set = (patch: Partial<SiteContact>) => { setF({ ...cur, ...patch }); setErrs({}); };
  const setDay = (i: number, patch: Partial<DayHours>) => set({ week: cur.week.map((d, n) => (n === i ? { ...d, ...patch } : d)) });
  // The sentence is free text: a time from the schedule it does not mention is pointed out, not blocked.
  const times = [...new Set(cur.week.filter((d) => d.open).flatMap((d) => [d.opens, d.closes]))];
  const unmentioned = times.filter((t) => !cur.hoursText.replace(/(\d{1,2})[.:](\d\d)/g, (_, h: string, m: string) => `${h.padStart(2, '0')}:${m}`).includes(t));
  const submit = async () => {
    const r = siteContactSchema.safeParse(cur);
    if (!r.success) { setErrs(fieldErrors(r.error.issues)); return; }
    if (await save('site.contact', r.data, ERR)) setF(null);
  };
  const err = (k: string) => errs[k] && <span role="alert" className="text-body-sm text-danger">{errs[k]}</span>;

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Години роботи" sub="Так їх бачать покупці: на сайті, у листах і в Google (структуровані дані).">
        <ul className="flex flex-col divide-y divide-border-hairline">
          {cur.week.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <span className="w-24 text-body text-text-primary">{DAYS[i]}</span>
              <Switch on={d.open} disabled={!canEdit} label={d.open ? 'працюємо' : 'вихідний'} onChange={(open) => setDay(i, { open })} />
              {d.open && (
                <span className="ml-auto flex items-center gap-1.5 text-body text-text-muted">
                  <input type="time" value={d.opens} disabled={!canEdit} aria-label={`${DAYS[i]}: початок`} onChange={(e) => setDay(i, { opens: e.target.value })} className={`${inputCls} w-28 tabular`} />
                  –
                  <input type="time" value={d.closes} disabled={!canEdit} aria-label={`${DAYS[i]}: кінець`} onChange={(e) => setDay(i, { closes: e.target.value })} className={`${inputCls} w-28 tabular`} />
                </span>
              )}
              {err(`week.${i}`)}
            </li>
          ))}
        </ul>
        {err('week')}
        <p className="text-body-sm text-text-muted">Коротко: {hoursShort(cur.week) || '—'}</p>
        <label className={labelCls}>Речення на сайті й у листах
          <input value={cur.hoursText} maxLength={200} disabled={!canEdit} onChange={(e) => set({ hoursText: e.target.value })} className={inputCls} />
        </label>
        {err('hoursText')}
        {unmentioned.length > 0 && !errs.hoursText && <p className="text-body-sm text-warning">У реченні немає {unmentioned.join(', ')} — перевірте, чи воно збігається з розкладом.</p>}
      </Panel>
      <Panel title="Телефон і пошта">
        <label className={labelCls}>Телефон магазину — дзвінки, Viber, Telegram, WhatsApp
          <input value={cur.phone} inputMode="tel" autoComplete="off" disabled={!canEdit} onChange={(e) => set({ phone: e.target.value })} className={`${inputCls} max-w-64 tabular`} />
        </label>
        {err('phone')}
        <label className={labelCls}>Пошта для покупців
          <input value={cur.publicEmail} type="email" disabled={!canEdit} onChange={(e) => set({ publicEmail: e.target.value })} className={`${inputCls} max-w-80`} />
        </label>
        {err('publicEmail')}
      </Panel>
      {canEdit && <PrimaryButton disabled={!f} onClick={() => void submit()} className="self-start">Зберегти</PrimaryButton>}
      <div className="rounded-xl border border-border-hairline bg-bg-surface p-4">
        <Row label="Адреса">{business.address}</Row>
        <Row label="Продавець">{business.legalEntityName}</Row>
        <p className="mt-2 text-body-sm text-text-muted">Адресу й дані продавця змінює розробник.</p>
      </div>
    </div>
  );
}

type Draft = TickerItem & { key: string };

/** Round 20 #229, D29: the top-strip phrases — a list with switches and drag order. */
export function TickerEditor({ items, canEdit }: { items: TickerItem[]; canEdit: boolean }) {
  const save = useSaveSetting();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft[] | null>(null);
  const [error, setError] = useState('');
  const list = draft ?? items.map((t, i) => ({ ...t, key: `t${i}` }));
  useUnsavedGuard(!!draft);
  const drag = useDragOrder(list.map((t) => t.key), 'ticker', (ids) => setDraft(ids.map((id) => list.find((t) => t.key === id)!)));
  const set = (key: string, patch: Partial<Draft>) => { setDraft(list.map((t) => (t.key === key ? { ...t, ...patch } : t))); setError(''); };
  const shown = drag.order.map((k) => list.find((t) => t.key === k)!).filter(Boolean);
  const submit = async () => {
    const r = tickerSchema.safeParse(list.map(({ key: _k, ...t }) => t));
    if (!r.success) { setError(r.error.issues[0]?.message ?? 'Перевірте фрази'); return; }
    if (await save('site.ticker', r.data)) setDraft(null);
  };

  return (
    <Panel title="Стрічка вгорі сайту" sub="Фрази біжать по черзі. Порядок — перетягуванням; вимкнена фраза зберігається, але не показується.">
      <ul className="flex flex-col gap-2">
        {shown.map((t) => (
          <li key={t.key} {...drag.item(t.key)} className={`flex flex-wrap items-center gap-2 rounded-lg border border-border-hairline p-2 ${drag.dragging === t.key ? 'bg-bg-alt opacity-80' : ''}`}>
            {canEdit && drag.handle(t.key, t.text || 'фраза')}
            <input value={t.text} maxLength={120} disabled={!canEdit} aria-label="Фраза" onChange={(e) => set(t.key, { text: e.target.value })} className={`${inputCls} min-w-0 flex-[2_1_14rem]`} />
            <input value={t.linkUrl ?? ''} disabled={!canEdit} aria-label="Посилання (необов'язково)" placeholder="/uk/… (необов'язково)" onChange={(e) => set(t.key, { linkUrl: e.target.value.trim() || null })} className={`${inputCls} min-w-0 flex-[1_1_10rem] font-mono`} />
            <Switch on={t.isActive} disabled={!canEdit} label="Показувати" hideLabel onChange={(on) => set(t.key, { isActive: on })} />
            {canEdit && (
              <button type="button" aria-label="Видалити фразу" className="rounded-full p-2 text-text-muted hover:bg-bg-alt hover:text-danger"
                onClick={async () => { if (await confirm({ title: 'Видалити фразу?', text: 'Вона зникне зі стрічки після «Зберегти».', ok: 'Видалити', danger: true })) setDraft(list.filter((x) => x.key !== t.key)); }}>
                <Trash2 size={17} />
              </button>
            )}
            {t.cardOnly && <p className="basis-full pl-9 text-caption text-text-muted">Показується лише тоді, коли на сайті увімкнена оплата карткою.</p>}
          </li>
        ))}
        {!shown.length && <li className="text-body-sm text-text-muted">Фраз немає — стрічка покаже лише сезонне повідомлення, якщо воно діє.</li>}
      </ul>
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          {list.length < 12 && <GhostButton icon={Plus} onClick={() => setDraft([...list, { key: `n${Date.now()}`, text: '', linkUrl: null, isActive: true, cardOnly: false }])}>Фраза</GhostButton>}
          <PrimaryButton disabled={!draft} onClick={() => void submit()}>Зберегти стрічку</PrimaryButton>
        </div>
      )}
    </Panel>
  );
}

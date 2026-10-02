import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown, ScrollText, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { STATUS_LABEL, dateTime } from '@/lib/format';
import { FilterButton, FilterChips, type FilterGroup, type FilterState } from '@/components/Filters';
import { DotsMenu, EmptyState, GhostButton, PageHeader, SkeletonRows, useStored, useToast } from '@/components/ui';

interface Row {
  seq: string; createdAt: string; actorEmail: string; actorName: string | null; action: string; resourceType: string;
  resourceId: string | null; resourceLabel: string | null; before: unknown; after: unknown; ipAddress: string | null;
}
interface Page { items: Row[]; nextBefore: string | null; resourceTypes: string[]; people: Array<{ id: string; name: string }> }

// Round 20 #234: the log in plain words — «Любов змінила ціну …». Verbs are written in the masculine
// past tense; for a woman's name the first word takes the feminine ending (змінив → змінила).
const DID: Record<string, string> = {
  'order.status_changed': 'змінив статус замовлення', 'order.confirmed_by_call': 'підтвердив дзвінком замовлення', 'order.created_by_staff': 'створив замовлення',
  'order.contact_edited': 'виправив контакти в замовленні', 'order.payment_recorded': 'відмітив оплату замовлення', 'order.refund_recorded': 'записав повернення коштів за замовлення',
  'product.deleted': 'видалив товар', 'product.photo_removed': 'прибрав фото товару', 'product.photos_reordered': 'змінив порядок фото товару',
  'product.quick_edit': 'змінив у списку ціну чи залишок товару', 'product.sku_changed': 'змінив артикул товару',
  'product.photo_added': 'додав фото товару', 'product.photo_replaced': 'замінив фото товару',
  'product.bulk.move_category': 'переніс товари в іншу категорію', 'product.bulk.set_category': 'змінив категорію кільком товарам', 'product.bulk.delete': 'видалив кілька товарів',
  'mail.sender_block_on': 'заблокував відправника', 'mail.sender_block_off': 'розблокував відправника',
  'quick_order.status_changed': 'опрацював заявку «Купити в 1 клік»',
  'product.created': 'створив товар', 'product.published': 'опублікував товар', 'product.draft_discarded': 'скасував чернетку товару', 'product.reverted': 'повернув попередню версію товару',
  'product.archived': 'прибрав в архів товар', 'product.unarchived': 'повернув з архіву товар', 'product.import': 'завантажив товари з Excel', 'product.import_variants': 'завантажив розміри з Excel',
  'product.bulk.price_adjust': 'змінив ціни кільком товарам', 'product.bulk.add_category': 'додав товари до категорії', 'product.bulk.remove_category': 'прибрав товари з категорії',
  'product.bulk.archive': 'прибрав в архів кілька товарів', 'product.bulk.restore': 'повернув з архіву кілька товарів', 'product.bulk.set_handmade': 'позначив «ручна робота» кільком товарам', 'product.bulk.revert': 'скасував масову зміну',
  'review.status_changed': 'перевірив відгук', 'review.replied': 'відповів на відгук', 'review.imported': 'переніс відгуки з Prom', 'review.templates_changed': 'змінив готові відповіді на відгуки',
  'setting.updated': 'змінив налаштування', 'announcement.updated': 'змінив повідомлення у стрічці сайту', 'banners.updated': 'змінив банери на головній',
  'category.created': 'створив категорію', 'category.updated': 'змінив категорію', 'category.reordered': 'змінив порядок категорій', 'category.deleted': 'видалив категорію',
  'collection.updated': 'змінив колекцію', 'collection.reordered': 'змінив порядок товарів у колекції', 'collection.product_removed': 'прибрав товар з колекції',
  'library.value_created': 'додав колір чи розмір', 'library.value_updated': 'змінив колір чи розмір', 'library.value_deleted': 'видалив колір чи розмір',
  'library.material_created': 'додав матеріал', 'library.material_updated': 'змінив матеріал', 'template.updated': 'змінив шаблон товару', 'attribute.created': 'додав характеристику',
  'staff.telegram_linked': 'підключив Telegram-сповіщення', 'staff.telegram_unlinked': 'відключив Telegram-сповіщення', 'staff.telegram_allowed': 'дозволив Telegram-сповіщення',
  'stock.shop_sale': 'продав у магазині', 'stock.shop_sale_cancelled': 'скасував продаж у магазині',
  'promotion.created': 'створив промокод', 'promotion.updated': 'змінив промокод', 'promotion.deleted': 'видалив промокод', 'promotion.enabled': 'увімкнув промокод', 'promotion.disabled': 'вимкнув промокод',
  'post.created': 'почав статтю', 'post.updated': 'змінив статтю', 'post.draft_opened': 'почав правити статтю', 'post.draft_discarded': 'скасував зміни в статті',
  'post.published': 'опублікував статтю', 'post.changes_published': 'опублікував зміни в статті', 'post.scheduled': 'запланував статтю', 'post.unpublished': 'зняв з сайту статтю', 'post.archived': 'прибрав в архів статтю',
  'customer.anonymized': 'знеособив дані клієнта', 'customer.corrected': 'виправив дані клієнта',
  'mail.replied': 'відповів на лист', 'mail.forwarded': 'переслав лист', 'mail.deleted': 'видалив лист', 'mail.status_changed': 'змінив стан листа', 'mail.settings_changed': 'змінив налаштування пошти',
  'mail.sender_vip_on': 'позначив відправника як важливого', 'mail.sender_vip_off': 'зняв позначку важливого відправника',
  'subscriber.added': 'додав підписника', 'subscriber.exported': 'вивантажив список підписників',
  'employee.invited': 'запросив співробітника', 'employee.invite_resent': 'надіслав нове запрошення', 'employee.invite_accepted': 'прийняв запрошення й увійшов уперше',
  'employee.suspended': 'призупинив доступ для', 'employee.unsuspended': 'відновив доступ для', 'employee.blocked': 'заблокував', 'employee.unblocked': 'розблокував',
  'employee.deactivated': 'закрив обліковий запис', 'employee.mfa_reset': 'скинув код входу для', 'role.assigned': 'змінив ролі для',
  'employee.2fa_enabled': 'підключив Google Authenticator', 'employee.recovery_code_used': 'увійшов резервним кодом', 'auth.password_changed': 'змінив свій пароль',
  'employee.passkey_added': 'додав вхід за обличчям чи відбитком', 'employee.passkey_removed': 'прибрав вхід за обличчям чи відбитком', 'employee.passkey_login': 'увійшов за обличчям чи відбитком',
};
// Events with nobody acting on purpose: written without a person.
const HAPPENED: Record<string, string> = {
  'employee.auto_blocked': 'Вхід заблоковано автоматично після багатьох невдалих спроб', 'employee.2fa_challenge_failed': 'Невірний код з Authenticator',
  'employee.passkey_failed': 'Невдала спроба входу за обличчям чи відбитком', 'session.reuse_detected': 'Підозріла спроба входу — усі сесії завершено',
};
// Unknown keys (a new action somewhere) still read as a sentence; the key itself is in the details.
const FALLBACK: Record<string, string> = {
  product: 'змінив товар', order: 'змінив замовлення', quick_order: 'опрацював заявку «Купити в 1 клік»', mail: 'змінив щось у пошті', post: 'змінив статтю',
  employee: 'змінив дані співробітника', role: 'змінив ролі', customer: 'змінив дані клієнта', review: 'змінив відгук', promotion: 'змінив промокод',
  category: 'змінив категорію', collection: 'змінив колекцію', library: 'змінив кольори, розміри чи матеріали', stock: 'змінив залишки', setting: 'змінив налаштування',
  subscriber: 'змінив список розсилки', template: 'змінив шаблон товару', banners: 'змінив банери', announcement: 'змінив стрічку сайту',
};
const SETTING: Record<string, string> = {
  'payments.cod.max_minor': 'ліміт накладеного платежу', 'payments.prepayment.min_minor': 'найменша передоплата', 'payments.card_enabled': 'оплата карткою',
  'pricing.volume_tiers': 'оптові знижки', 'admin.announcement': 'оголошення для працівників',
};
const TYPE: Record<string, string> = {
  Product: 'Товари', Order: 'Замовлення', Review: 'Відгуки', Setting: 'Налаштування', Category: 'Категорії', Collection: 'Колекції', OptionValue: 'Кольори й розміри', Material: 'Матеріали',
  StaffUser: 'Співробітники', StaffSession: 'Входи', QuickOrderRequest: 'Купити в 1 клік', Promotion: 'Промокоди', Post: 'Блог', Banner: 'Сайт', ShopSale: 'Продаж у магазині',
  Customer: 'Клієнти', MailThread: 'Пошта', MailSenderRule: 'Пошта', ProductTemplate: 'Шаблони', AttributeDefinition: 'Характеристики', Subscriber: 'Розсилка',
};

const feminine = (name: string) => /[ая]$/i.test(name) || /^любов$/i.test(name);
const IRREGULAR: Record<string, string> = { 'увійшов': 'увійшла', 'переніс': 'перенесла' };
const verb = (phrase: string, fem: boolean) => {
  if (!fem) return phrase;
  const [w = '', ...rest] = phrase.split(' ');
  return [IRREGULAR[w] ?? w.replace(/в$/, 'ла'), ...rest].join(' ');
};
const statusOf = (x: unknown) => (x && typeof x === 'object' && 'status' in x ? STATUS_LABEL[String((x as { status: unknown }).status)] : undefined);

function sentence(r: Row) {
  if (HAPPENED[r.action]) return { who: null, text: `${HAPPENED[r.action]}${r.resourceLabel ? ` · ${r.resourceLabel}` : ''}` };
  const who = r.actorName ?? r.actorEmail;
  const base = DID[r.action] ?? (r.action.startsWith('product.bulk.') ? 'змінив кілька товарів' : FALLBACK[r.action.split('.')[0] ?? ''] ?? 'вніс зміну');
  let obj = r.resourceLabel ? `«${r.resourceLabel}»` : '';
  if (r.action === 'stock.shop_sale' && r.resourceLabel) obj = `: ${r.resourceLabel}`;
  if (r.action === 'setting.updated') obj = `«${SETTING[r.resourceId ?? ''] ?? r.resourceId ?? ''}»`;
  if (r.action === 'order.status_changed') { const to = statusOf(r.after); obj = `${r.resourceLabel ?? ''}${to ? ` на «${to}»` : ''}`; }
  return { who, text: `${verb(base, feminine(who.split(' ')[0] ?? ''))}${obj.startsWith(':') ? '' : ' '}${obj}`.trim() };
}

function Values({ v }: { v: unknown }) {
  if (v === null || v === undefined) return <span className="text-text-faint">—</span>;
  if (typeof v !== 'object') return <span>{String(v)}</span>;
  return <pre className="whitespace-pre-wrap break-all font-sans">{JSON.stringify(v, null, 1).replace(/^[{[]\n?|\n?[}\]]$/g, '').replace(/"/g, '')}</pre>;
}

export function AuditPage() {
  const toast = useToast();
  const [filters, setFilters] = useStored<FilterState>('audit.filters', {});
  const [open, setOpen] = useState<string | null>(null);
  const person = (filters.person as string[] | undefined)?.[0];
  const when = filters.date as { from?: string; to?: string } | undefined;
  const area = (filters.area as string[] | undefined)?.[0];
  const q = useInfiniteQuery({
    queryKey: ['audit', person, when, area], initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams();
      if (person) qs.set('actorId', person);
      if (area) qs.set('resourceType', area);
      if (when?.from) qs.set('from', when.from);
      if (when?.to) qs.set('to', when.to);
      if (pageParam) qs.set('before', pageParam);
      return api<Page>(`/admin/audit?${qs}`);
    },
    getNextPageParam: (last) => last.nextBefore ?? undefined,
  });
  const first = q.data?.pages[0];
  const rows = q.data?.pages.flatMap((p) => p.items);
  const groups: FilterGroup[] = [
    { key: 'person', label: 'Хто', kind: 'options', single: true, options: (first?.people ?? []).map((p) => ({ value: p.id, label: p.name })) },
    { key: 'date', label: 'Коли', kind: 'date' },
    { key: 'area', label: 'Розділ', kind: 'options', single: true, options: (first?.resourceTypes ?? []).map((t) => ({ value: t, label: TYPE[t] ?? t })) },
  ];
  const verify = async () => {
    const r = await api<{ rows: number; intact: boolean; firstBrokenSeq: string | null }>('/admin/audit/verify');
    toast(r.intact ? `Журнал цілий: ${r.rows} записів, жоден не змінено й не видалено.` : `Увага: запис №${r.firstBrokenSeq} змінено або видалено.`, r.intact ? 'ok' : 'error');
  };

  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <PageHeader title="Журнал дій" sub="Хто що зробив у панелі" actions={<><FilterButton groups={groups} value={filters} onApply={setFilters} /><DotsMenu items={[{ label: 'Перевірити цілісність', icon: ShieldCheck, onClick: () => void verify() }]} /></>} />
      <FilterChips groups={groups} value={filters} onChange={setFilters} />
      {!rows ? <SkeletonRows /> : !rows.length ? <EmptyState icon={ScrollText} text="За цей час записів немає." /> : (
        <ul className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-hairline bg-bg-surface">
          {rows.map((r) => {
            const s = sentence(r);
            const isOpen = open === r.seq;
            return (
              <li key={r.seq}>
                <button type="button" onClick={() => setOpen(isOpen ? null : r.seq)} aria-expanded={isOpen} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-bg-page">
                  <span className="min-w-0 flex-1 text-body text-text-body">{s.who && <span className="font-semibold text-text-primary">{s.who} </span>}{s.text}</span>
                  <span className="shrink-0 text-body-sm text-text-muted tabular">{dateTime(r.createdAt)}</span>
                  <ChevronDown size={16} className={`mt-1 shrink-0 text-text-faint transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="grid gap-3 bg-bg-page px-4 py-3 text-body-sm md:grid-cols-2">
                    <div><p className="text-caption text-text-muted">Було</p><Values v={r.before} /></div>
                    <div><p className="text-caption text-text-muted">Стало</p><Values v={r.after} /></div>
                    <p className="text-caption text-text-muted md:col-span-2">{TYPE[r.resourceType] ?? r.resourceType} · {r.action} · {r.actorEmail}{r.ipAddress ? ` · ${r.ipAddress}` : ''} · запис №{r.seq}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {q.hasNextPage && <GhostButton className="self-start" disabled={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()}>Показати ще</GhostButton>}
    </div>
  );
}

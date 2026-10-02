import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Copy, Eye, EyeOff, Gem, Hand, Handshake, RotateCcw, Tag, Trash2, Undo2 } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { dateTime, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { Switch } from '@/features/settings/parts';
import { DotsMenu, GhostButton, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import {
  type Libraries, type Photo, PRODUCT_STATUS, type ProductDetail, type ProductDoc, type Readiness, STAGE_LABEL, type Template,
  UNIT_LABEL, useLibraries, useProduct, useRefreshProducts, useTemplates, type VariantDoc,
} from './api';
import { AXIS_LABEL, axisValues, buildMatrix, fromUah, int, pickedFrom } from './model';
import { CategoryPicker } from './CategoryPicker';
import { AddValue, CHIP_ON, CompositionEditor, inputCls, labelCls, ProductPreview, ReadinessLine, useProductActions, ValuePicker } from './parts';
import { PhotoGrid, usePhotoUploads } from './photos';
import { NumCell, VariantGrid } from './VariantGrid';

// Round 20 #125: an existing product on one page with sections; a mini contents on the left (computer);
// changes save to the draft by themselves (round 22 K33), «Опублікувати» at the bottom (K35); plain words (#45).
// Everything of 37 §37.4–37.5 stays: template axes, the size × colour table, composition, attributes,
// photos, custom size, description, Google texts, «Історія виробу», versions, publish, discard, hide.

const SECTIONS = [
  ['main', 'Основне'], ['photos', 'Фото'], ['variants', 'Розміри й кольори'], ['composition', 'Склад'],
  ['price', 'Ціна й свій розмір'], ['description', 'Опис'],
] as const; // «Історія змін» lives in the ⋯ menu (round 22 K37).
/** «Збережено 14:05» today, with the date otherwise. */
const time = (iso: string) => (new Date(iso).toDateString() === new Date().toDateString() ? new Date(iso).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : dateTime(iso));
const box = 'flex scroll-mt-20 flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-4 sm:p-5';
const chip = (on: boolean) => `min-h-9 rounded-full border px-3 text-body-sm max-md:min-h-11 ${on ? CHIP_ON : 'border-border-control text-text-body'}`;

function Editor({ p, t, libs }: { p: ProductDetail; t: Template; libs: Libraries }) {
  const nav = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const refresh = useRefreshProducts();
  const actions = useProductActions();
  const [params, setParams] = useSearchParams();
  const { data: me } = useMe();
  const can = (k: string) => !!me?.permissions.includes(k);
  const editable = can('products.update');
  const [doc, setDoc] = useState<ProductDoc>(p.document);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(p.document));
  const [savedAt, setSavedAt] = useState(p.draftUpdatedAt);
  const [readiness, setReadiness] = useState<Readiness>(p.readiness);
  const [hasDraft, setHasDraft] = useState(p.hasDraft);
  const [photos, setPhotos] = useState<Photo[]>(p.photos);
  const uploads = usePhotoUploads(p.id, setPhotos);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulk, setBulk] = useState({ price: '', stock: '' });
  const [extended, setExtended] = useState(false);
  const [picked, setPicked] = useState(() => pickedFrom(p.document, t, libs));
  const dirty = JSON.stringify(doc) !== savedJson;
  useUnsavedGuard(dirty || uploads.pending > 0);

  const byId = useMemo(() => new Map([...libs.colors, ...libs.patterns, ...(libs.sizes[t.key] ?? [])].map((v) => [v.id, v])), [libs, t.key]);
  const sizeIds = useMemo(() => new Set((libs.sizes[t.key] ?? []).map((v) => v.id)), [libs, t.key]);
  const patch = (next: Partial<ProductDoc>) => setDoc((d) => ({ ...d, ...next }));
  const patchVariant = (i: number, next: Partial<VariantDoc>) => setDoc((d) => ({ ...d, variants: d.variants.map((v, n) => (n === i ? { ...v, ...next } : v)) }));
  const toggle = (axis: string, id: string) => {
    const cur = picked[axis] ?? [];
    const next = { ...picked, [axis]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    setPicked(next); setSelected(new Set());
    setDoc((d) => ({ ...d, variants: buildMatrix(d, p.sku, t, libs, next) }));
  };

  const fail = (e: unknown) => {
    const prm = e instanceof ApiError ? (e.body?.error.params as { missing?: string[]; permissions?: string[] } | undefined) : undefined;
    const field = e instanceof ApiError ? e.body?.error.fieldErrors?.[0] : undefined;
    toast(prm?.missing ? `Бракує: ${prm.missing.join(', ')}` : prm?.permissions ? 'Недостатньо прав для цієї зміни' : field?.code === 'SKU_TAKEN' ? `Артикул ${String(field.params?.sku)} вже зайнятий` : messageFor(e instanceof ApiError ? e.code : ''), 'error');
  };
  // Saves run one after another and always send the latest document; nothing is sent when nothing changed.
  const docRef = useRef(doc);
  docRef.current = doc;
  const savedRef = useRef(savedJson);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState<string | null>(null); // the document that failed to save
  const save = () => {
    const next = queue.current.catch(() => undefined).then(async () => {
      const json = JSON.stringify(docRef.current);
      if (json === savedRef.current) return;
      setSaving(true);
      try {
        const r = await api<{ savedAt: string; readiness: Readiness }>(`/admin/products/${p.id}/draft`, { method: 'PUT', body: json });
        savedRef.current = json;
        setSavedJson(json); setSavedAt(r.savedAt); setReadiness(r.readiness); setHasDraft(true); setSaveFailed(null);
        void refresh();
      } finally { setSaving(false); }
    });
    queue.current = next;
    return next;
  };
  /** Lets a save already on its way land first (before a discard or a revert replaces the draft). */
  const settled = () => queue.current.catch(() => undefined);
  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true);
    try { await fn(); if (ok) toast(ok); } catch (e) { fail(e); } finally { setBusy(false); }
  };
  // Round 22 K33: the draft saves itself 1.5 s after the last change; one notice per failure run.
  const json = JSON.stringify(doc);
  useEffect(() => {
    if (!editable || !dirty || saving || busy || uploads.pending || json === saveFailed) return;
    const h = window.setTimeout(() => {
      save().catch((e: unknown) => { if (saveFailed === null) fail(e); setSaveFailed(json); });
    }, 1500);
    return () => window.clearTimeout(h);
  }, [json, dirty, saving, busy, uploads.pending, editable, saveFailed]); // eslint-disable-line react-hooks/exhaustive-deps
  const publish = () => run(async () => {
    await save();
    await post(`/admin/products/${p.id}/publish`);
    await refresh(p.id);
  }, p.publishedAt ? 'Зміни на сайті' : 'Товар на сайті');
  const back = async () => {
    if (uploads.pending && !(await confirm({ title: 'Фото ще надсилаються', text: 'Якщо вийти зараз, ті, що не встигли, пропадуть.', ok: 'Вийти', danger: true }))) return;
    try { await save(); } catch {
      if (!(await confirm({ title: 'Останні зміни не збереглися', text: 'Вийти без них?', ok: 'Вийти', danger: true }))) return;
    }
    nav('/products');
  };
  const [history, setHistory] = useState(false);

  const shown = { ...readiness, items: readiness.items.map((i) => (i.key === 'photo' ? { ...i, ok: photos.length > 0 } : i)) };
  const blocked = shown.items.some((i) => i.blocking && !i.ok);
  const canPublish = can('products.publish') && (hasDraft || dirty) && !blocked && !uploads.pending;
  const unitHint = doc.pricingUnit === 'KILOGRAM' ? ' за кг' : doc.pricingUnit === 'SKEIN' ? ' за моток' : '';
  const view = { id: p.id, slug: p.slug, status: p.status };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<span className="flex min-w-0 items-center gap-1"><button type="button" onClick={() => void back()} aria-label="Назад" className="-ml-2 shrink-0 rounded-full p-2 text-text-muted hover:bg-bg-alt"><ArrowLeft size={20} /></button><span className="truncate">{doc.name || 'Без назви'}</span></span>}
        sub={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{p.sku}</span><span className="rounded-full bg-bg-alt px-2 py-0.5 text-caption">{PRODUCT_STATUS[p.status]}</span>{hasDraft && p.publishedAt && <span className="rounded-full bg-warning/10 px-2 py-0.5 text-caption text-warning">є неопубліковані зміни</span>}</span>}
        actions={<DotsMenu items={[
          { label: 'Створити схожий', icon: Copy, onClick: () => void actions.similar(p.id), hidden: !can('products.create') },
          { label: p.slug && p.status === 'ACTIVE' ? 'Подивитись на сайті' : 'Подивитись, як на сайті', icon: Eye, onClick: () => (p.slug && p.status === 'ACTIVE' && !dirty ? actions.view(view) : setParams({ preview: '1' })) },
          { label: 'Цінник', icon: Tag, onClick: () => actions.priceTag(p.id) },
          { label: 'Історія змін', icon: RotateCcw, onClick: () => setHistory(true) },
          { label: 'Скасувати неопубліковані зміни', icon: Undo2, hidden: !(hasDraft && p.publishedAt && editable), onClick: () => void (async () => {
            if (!(await confirm({ title: 'Скасувати неопубліковані зміни?', text: 'Залишиться те, що зараз на сайті.', ok: 'Скасувати зміни', danger: true }))) return;
            await run(async () => { await settled(); await api(`/admin/products/${p.id}/draft`, { method: 'DELETE' }); await refresh(p.id); }, 'Зміни скасовано');
          })() },
          { label: 'Сховати з сайту', icon: EyeOff, hidden: p.status === 'ARCHIVED' || !can('products.archive'), onClick: () => void actions.setHidden(p.id, true) },
          { label: 'Показати на сайті', icon: Eye, hidden: p.status !== 'ARCHIVED' || !can('products.publish'), onClick: () => void actions.setHidden(p.id, false) },
          { label: 'Видалити', icon: Trash2, danger: true, hidden: !can('products.delete'), onClick: () => void actions.remove(p.id, doc.name).then((ok) => ok && nav('/products')) },
        ]} />}
      />
      <ReadinessLine r={shown} />

      {/* Round 22 K38: on a wide computer screen the live «як на сайті» sits beside the editor. */}
      <div className="grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] min-[90rem]:grid-cols-[10rem_minmax(0,1fr)_22rem]">
        <nav aria-label="Розділи товару" className="hidden lg:block">
          <ul className="sticky top-20 flex flex-col gap-0.5 text-body-sm">
            {SECTIONS.map(([id, label]) => <li key={id}><a href={`#${id}`} className="block rounded-md px-2 py-1.5 text-text-body hover:bg-bg-alt">{label}</a></li>)}
          </ul>
        </nav>

        <fieldset disabled={!editable} className="flex min-w-0 flex-col gap-4">
          <section id="main" className={box}>
            <h2 className="text-h4 font-semibold text-text-primary">Основне</h2>
            <label className={labelCls}>Назва<input value={doc.name} onChange={(e) => patch({ name: e.target.value })} className={inputCls} maxLength={160} /></label>
            {p.slug && <p className="-mt-2 text-caption text-text-muted">Адреса на сайті: /uk/tovar/{p.slug} — не змінюється</p>}
            <CategoryPicker categories={libs.categories} value={doc.categoryIds} onChange={(categoryIds) => patch({ categoryIds })} />
            {/* Round 22 K29: the three product marks as switches in their own block. */}
            <div className="flex flex-col gap-2.5 rounded-lg border border-border-hairline p-3">
              {([
                [Handshake, 'Від партнерів', doc.origin === 'PARTNER_MANUFACTURE', (v: boolean) => patch({ origin: v ? 'PARTNER_MANUFACTURE' : 'OWN_MANUFACTURE', isHandmade: v ? false : doc.isHandmade }), !can('products.manage_origin'), false],
                [Hand, 'Ручна робота', doc.isHandmade, (v: boolean) => patch({ isHandmade: v }), false, doc.origin !== 'OWN_MANUFACTURE'],
                [Gem, 'Єдиний екземпляр', doc.isUniquePiece, (v: boolean) => patch({ isUniquePiece: v }), false, false],
              ] as const).filter((x) => !x[5]).map(([Icon, label, on, set, off]) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={18} strokeWidth={1.75} className={on ? 'text-accent-text' : 'text-text-muted'} aria-hidden="true" />
                  <Switch on={on} onChange={set} label={label} disabled={off || !editable} />
                </div>
              ))}
            </div>
            {doc.origin === 'PARTNER_MANUFACTURE' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelCls}>Назва партнера (на сайті не показується)<input value={doc.partnerName ?? ''} onChange={(e) => patch({ partnerName: e.target.value || null })} className={inputCls} disabled={!can('products.manage_origin')} /></label>
                <label className={labelCls}>Регіон<input value={doc.partnerRegion ?? ''} onChange={(e) => patch({ partnerRegion: e.target.value || null })} className={inputCls} placeholder="Косівщина" disabled={!can('products.manage_origin')} /></label>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {t.pricingUnits.length > 1 && (
                <label className={labelCls}>Як продається
                  <select value={doc.pricingUnit} onChange={(e) => patch({ pricingUnit: e.target.value as ProductDoc['pricingUnit'] })} className={inputCls}>{t.pricingUnits.map((u) => <option key={u} value={u}>{UNIT_LABEL[u] ?? u}</option>)}</select>
                </label>
              )}
              <label className={labelCls}>Інші назви для пошуку (через кому)
                <input defaultValue={doc.searchSynonyms.join(', ')} onBlur={(e) => patch({ searchSynonyms: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) })} className={inputCls} placeholder="коц, покривало" />
              </label>
            </div>
            {/* Round 22 K28: «Колекції» folded under «Додатково». */}
            {libs.collections.length > 0 && (
              <details className="rounded-lg border border-border-hairline px-3 py-2">
                <summary className="cursor-pointer text-body-sm font-medium text-text-primary">Додатково{doc.collectionIds.length ? ` · колекцій: ${doc.collectionIds.length}` : ''}</summary>
                <div className="mt-3 flex flex-col gap-2">
                  <span className="text-body-sm text-text-muted">Колекції</span>
                  <div className="flex flex-wrap gap-1.5">
                    {libs.collections.map((c) => { const on = doc.collectionIds.includes(c.id); return <button key={c.id} type="button" aria-pressed={on} onClick={() => patch({ collectionIds: on ? doc.collectionIds.filter((x) => x !== c.id) : [...doc.collectionIds, c.id] })} className={chip(on)}>{c.name}</button>; })}
                  </div>
                </div>
              </details>
            )}
          </section>

          <section id="photos" className={box}>
            <h2 className="text-h4 font-semibold text-text-primary">Фото</h2>
            <PhotoGrid productId={p.id} photos={photos} onPhotos={setPhotos} uploads={uploads} canEdit={can('products.manage_media')} />
            <p className="text-caption text-text-muted">Фото з'являються на сайті одразу, без «Опублікувати».</p>
          </section>

          <section id="variants" className={box}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex-1 text-h4 font-semibold text-text-primary">Розміри й кольори</h2>
              {doc.variants.length > 0 && <label className="flex items-center gap-2 text-body-sm text-text-muted"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={extended} onChange={(e) => setExtended(e.target.checked)} />Артикули, стара ціна, упаковка</label>}
            </div>
            {t.axes.map((a) => (
              <div key={a} className="flex flex-col gap-2">
                <span className="text-body-sm text-text-muted">{AXIS_LABEL[a] ?? a}</span>
                <ValuePicker values={axisValues(a, t, libs)} picked={picked[a] ?? []} onToggle={(id) => toggle(a, id)} round={a === 'color'} disabled={!editable} />
                {editable && can('libraries.manage') && <AddValue kind={a as 'size' | 'color' | 'pattern'} templateKey={a === 'size' ? t.key : undefined} onAdded={(id) => toggle(a, id)} />}
              </div>
            ))}
            {t.axes.length > 0 && !doc.variants.length && <p className="text-body-sm text-text-muted">Позначте розміри й кольори — таблиця цін складеться сама.</p>}
            {doc.variants.length > 1 && editable && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-bg-alt p-2.5 text-body-sm">
                <span className="text-text-body">Позначено: {selected.size}</span>
                <input value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} placeholder={`Ціна, ₴${unitHint}`} inputMode="decimal" aria-label="Ціна для позначених" disabled={!can('products.manage_price')} className="w-28 rounded-md border border-border-control bg-bg-input px-2 py-1.5" />
                <GhostButton disabled={!selected.size || !bulk.price} onClick={() => { const v = fromUah(bulk.price); setDoc((d) => ({ ...d, variants: d.variants.map((x, n) => (selected.has(n) ? { ...x, priceMinor: v } : x)) })); }}>Задати ціну</GhostButton>
                <input value={bulk.stock} onChange={(e) => setBulk({ ...bulk, stock: e.target.value })} placeholder="Залишок" inputMode="numeric" aria-label="Залишок для позначених" disabled={!can('products.manage_stock')} className="w-24 rounded-md border border-border-control bg-bg-input px-2 py-1.5" />
                <GhostButton disabled={!selected.size || bulk.stock === ''} onClick={() => { const v = int(bulk.stock) ?? 0; setDoc((d) => ({ ...d, variants: d.variants.map((x, n) => (selected.has(n) ? { ...x, stockQty: v } : x)) })); }}>Задати залишок</GhostButton>
              </div>
            )}
            <VariantGrid variants={doc.variants} byId={byId} sizeIds={sizeIds} unitHint={unitHint} canPrice={editable && can('products.manage_price')} canStock={editable && can('products.manage_stock')}
              extended={extended} showDays onPatch={patchVariant} selected={doc.variants.length > 1 ? selected : undefined} onSelect={doc.variants.length > 1 ? setSelected : undefined} />
            <p className="text-caption text-text-muted">Рядок без ціни — червоний і не дає опублікувати. «Під замовлення, днів»: товар можна замовити й без залишку, виготовимо за стільки днів (лише повна оплата).</p>
          </section>

          <section id="composition" className={box}>
            <h2 className="text-h4 font-semibold text-text-primary">Склад і характеристики</h2>
            <CompositionEditor value={doc.composition} onChange={(composition) => patch({ composition })} libs={libs} disabled={!editable} />
            {t.attributes.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {t.attributes.map((a) => {
                  const cur = doc.attributes.find((x) => x.definitionId === a.id)?.value ?? '';
                  const set = (value: string) => patch({ attributes: [...doc.attributes.filter((x) => x.definitionId !== a.id), ...(value ? [{ definitionId: a.id, value }] : [])] });
                  return (
                    <label key={a.id} className={labelCls}>{a.name}{a.unit ? `, ${a.unit}` : ''}{a.isRequired ? ' *' : ''}
                      {a.options ? (
                        <select value={cur} onChange={(e) => set(e.target.value)} className={inputCls}><option value="">—</option>{a.options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
                      ) : <input value={cur} onChange={(e) => set(e.target.value)} inputMode={a.dataType === 'NUMBER' ? 'decimal' : undefined} className={inputCls} />}
                    </label>
                  );
                })}
              </div>
            )}
            {doc.origin === 'OWN_MANUFACTURE' && <label className={labelCls}>Походження вовни<input value={doc.woolOrigin ?? ''} onChange={(e) => patch({ woolOrigin: e.target.value || null })} className={inputCls} /></label>}
          </section>

          <section id="price" className={box}>
            <h2 className="text-h4 font-semibold text-text-primary">Ціна й свій розмір</h2>
            {doc.pricingUnit === 'KILOGRAM' && doc.variants[0]?.priceMinor ? <p className="text-body-sm text-text-body">На сайті: {uah(doc.variants[0].priceMinor)} за кг · {uah(Math.round(doc.variants[0].priceMinor / 10))} за 100 г</p> : null}
            <p className="text-caption text-text-muted">Знижка: увімкніть «Артикули, стара ціна, упаковка» в розділі «Розміри й кольори» і вкажіть стару ціну — на сайті вона буде закреслена.</p>
            {t.axes.includes('size') && (
              <>
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={doc.allowsCustomSize} disabled={!can('products.manage_custom_size')} onChange={(e) => {
                    // Round 18: width 100–200 cm (the loom is 200 cm wide), length 100–400 cm.
                    const c = doc.customSize;
                    patch({ allowsCustomSize: e.target.checked, ...(e.target.checked ? { customSize: { ...c, minWidthCm: c.minWidthCm ?? 100, maxWidthCm: c.maxWidthCm ?? 200, minLengthCm: c.minLengthCm ?? 100, maxLengthCm: c.maxLengthCm ?? 400 } } : {}) });
                  }} />
                  «Свій розмір» — виготовлення під замовлення, лише повна оплата карткою
                </label>
                {doc.allowsCustomSize && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([
                      ['ratePerSqmMinor', 'Ціна за м², ₴', true], ['minPriceMinor', 'Мінімальна ціна, ₴', true], ['madeToOrderDays', 'Виготовлення, днів', false], ['minWidthCm', 'Ширина від, см', false],
                      ['maxWidthCm', 'Ширина до, см', false], ['minLengthCm', 'Довжина від, см', false], ['maxLengthCm', 'Довжина до, см', false],
                    ] as const).map(([k, label, money]) => (
                      <label key={k} className={labelCls}>{label}
                        <NumCell money={money} value={doc.customSize[k]} disabled={!can('products.manage_custom_size')} onValue={(v) => patch({ customSize: { ...doc.customSize, [k]: v || null } })} className="w-full !py-2 !text-body" />
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <section id="description" className={box}>
            <h2 className="text-h4 font-semibold text-text-primary">Опис</h2>
            <label className={labelCls}>Опис для покупця — перше речення стане коротким описом
              <textarea value={doc.description} onChange={(e) => patch({ description: e.target.value })} rows={9} className={inputCls} />
            </label>
            {doc.origin === 'OWN_MANUFACTURE' && t.storyStages.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-body-sm text-text-muted">«Історія виробу» — етапи на сторінці товару</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {t.storyStages.map((s) => (
                    <label key={s} className="flex items-center gap-2 text-body-sm text-text-primary">
                      <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={!doc.storyStagesOff.includes(s)} onChange={(e) => patch({ storyStagesOff: e.target.checked ? doc.storyStagesOff.filter((x) => x !== s) : [...doc.storyStagesOff, s] })} />
                      {STAGE_LABEL[s] ?? s}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <details className="rounded-lg border border-border-hairline px-3 py-2">
              <summary className="cursor-pointer text-body-sm font-medium text-text-primary">Для Google</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={labelCls}>Заголовок (порожньо — складеться сам)<input value={doc.metaTitle ?? ''} onChange={(e) => patch({ metaTitle: e.target.value || null })} placeholder={`${doc.name} | Вівчарик`} className={inputCls} maxLength={160} /></label>
                <label className={labelCls}>Опис (порожньо — перше речення)<input value={doc.metaDescription ?? ''} onChange={(e) => patch({ metaDescription: e.target.value || null })} className={inputCls} maxLength={320} /></label>
              </div>
            </details>
          </section>
        </fieldset>

        <aside aria-label="Як на сайті" className="hidden min-[90rem]:block">
          <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-3 overflow-y-auto rounded-xl border border-border-hairline bg-bg-surface p-4">
            <span className="text-caption font-semibold uppercase tracking-wide text-text-muted">Як на сайті</span>
            <ProductPreview doc={doc} photos={photos} libs={libs} t={t} />
          </div>
        </aside>
      </div>

      {editable && (
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border-hairline bg-bg-surface/95 px-4 py-2.5 backdrop-blur md:bottom-3 md:mx-0 md:rounded-xl md:border md:shadow-lg">
          <span className="min-w-0 flex-1 truncate text-body-sm text-text-muted" aria-live="polite">
            {uploads.pending ? 'Надсилаю фото…' : saveFailed !== null && json === saveFailed ? 'Не вдалося зберегти' : dirty || saving ? 'Зберігаю…' : savedAt ? `Збережено ${time(savedAt)}` : ''}
          </span>
          {saveFailed !== null && json === saveFailed && <GhostButton disabled={busy || saving} onClick={() => void save().catch(fail)}>Повторити</GhostButton>}
          {can('products.publish') && <PrimaryButton disabled={!canPublish || busy} onClick={() => void publish()}>{p.publishedAt ? 'Опублікувати зміни' : 'Опублікувати'}</PrimaryButton>}
        </div>
      )}
      {!can('products.publish') && editable && <p className="text-caption text-text-muted">Зміни зберігаються в чернетку самі; на сайт її публікує Іван або адміністратор.</p>}

      {history && (
        <Sheet title="Історія змін" onClose={() => setHistory(false)}>
          {p.revisions.length === 0 && <p className="text-body-sm text-text-muted">Товар ще не публікувався.</p>}
          <ul className="flex flex-col gap-1.5">
            {p.revisions.map((r, n) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 text-body-sm">
                <span className="text-text-body">{dateTime(r.publishedAt ?? r.createdAt)}{n === 0 ? ' · зараз на сайті' : ''}</span>
                {n > 0 && editable && (
                  <button type="button" disabled={busy} className="rounded-md border border-border-control px-2.5 py-1 text-caption hover:bg-bg-alt" onClick={() => void (async () => {
                    if (!(await confirm({ title: 'Повернути цю версію?', text: 'Вона стане чернеткою замість поточної. На сайті нічого не зміниться, доки не опублікуєте.', ok: 'Повернути' }))) return;
                    await run(async () => { await settled(); await post(`/admin/products/${p.id}/revisions/${r.id}/revert`); await refresh(p.id); }, 'Стару версію повернуто в чернетку');
                  })()}>Повернути</button>
                )}
              </li>
            ))}
          </ul>
        </Sheet>
      )}

      {params.get('preview') && (
        <Sheet title="Як це виглядатиме на сайті" wide onClose={() => setParams({}, { replace: true })}>
          <ProductPreview doc={doc} photos={photos} libs={libs} t={t} />
        </Sheet>
      )}
    </div>
  );
}

export function ProductEditorPage() {
  const { id = '' } = useParams();
  const { data: p, isPending, isError } = useProduct(id);
  const { data: templates } = useTemplates();
  const { data: libs } = useLibraries();
  if (isError) return <p className="text-body text-text-muted">Товар не знайдено.</p>;
  if (isPending || !templates || !libs) return <SkeletonRows />;
  const t = templates.find((x) => x.key === p.templateKey);
  if (!t) return <p className="text-body">Шаблон товару не знайдено.</p>;
  // Keyed by the last save so a publish, revert or discard reloads the document cleanly.
  return <Editor key={`${p.id}:${p.draftUpdatedAt ?? ''}:${p.publishedAt ?? ''}`} p={p} t={t} libs={libs} />;
}

import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { GhostButton, PageHeader, PrimaryButton, SkeletonRows, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import {
  type Libraries, type LibCategory, type Photo, type ProductDetail, type ProductDoc, type Readiness, STAGE_LABEL, type Template, TEMPLATE_LABEL,
  UNIT_LABEL, useLibraries, useProduct, useRefreshProducts, useTemplates,
} from './api';
import { areaM2, axisValues, blankVariant, buildMatrix, fillDescription, fillName, pickedFrom, priceFromRate } from './model';
import { AddValue, CompositionEditor, inputCls, labelCls, ProductPreview, ReadinessLine, ValuePicker } from './parts';
import { PhotoGrid, UploadProgress, usePhotoUploads } from './photos';
import { NumCell, VariantGrid } from './VariantGrid';

// Round 20 #124, #151–164, #271–273: a new product in six steps. Category first (it brings sizes,
// composition, the description draft and the name pattern from the product template); every «Далі»
// saves the draft; photos upload in the background; publishing needs photo, name, price, category, size.

const STEPS = ['Категорія', 'Фото', 'Назва й ціна', 'Розміри й кольори', 'Опис', 'Перегляд'] as const;

const blankDoc = (): ProductDoc => ({
  name: '', description: '', metaTitle: null, metaDescription: null, searchSynonyms: [], categoryIds: [], collectionIds: [], origin: 'OWN_MANUFACTURE',
  partnerName: null, partnerRegion: null, pricingUnit: 'PIECE', isHandmade: true, isUniquePiece: false, woolOrigin: null, storyStagesOff: [], allowsCustomSize: false,
  customSize: { ratePerSqmMinor: null, minPriceMinor: null, minWidthCm: null, maxWidthCm: null, minLengthCm: null, maxLengthCm: null, madeToOrderDays: 14 },
  composition: [], attributes: [], variants: [],
});

/** Category tiles (#154–155): each top category with the templates whose default category it is. */
function tilesOf(templates: Template[], libs: Libraries) {
  const visible = templates.filter((t) => !t.isHidden);
  const topOf = (id: string | null) => { const c = libs.categories.find((x) => x.id === id); return c?.parentId ?? c?.id ?? null; };
  const tiles = libs.categories.filter((c) => !c.parentId && c.isActive).map((c) => ({ category: c as LibCategory | null, templates: visible.filter((t) => topOf(t.defaultCategoryId) === c.id), key: c.id, name: c.name }))
    .filter((x) => x.templates.length > 0);
  for (const t of visible) if (!tiles.some((x) => x.templates.includes(t))) tiles.push({ category: null, templates: [t], key: `t:${t.key}`, name: TEMPLATE_LABEL[t.key] ?? t.key });
  return tiles;
}

function Steps({ step, max, onGo }: { step: number; max: number; onGo: (n: number) => void }) {
  return (
    <ol className="flex items-start gap-1 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Кроки">
      {STEPS.map((label, i) => {
        const done = i < step, here = i === step, open = i <= max && !here;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-start">
            <button type="button" disabled={!open} onClick={() => onGo(i)} aria-current={here ? 'step' : undefined} className="flex min-w-0 flex-1 flex-col items-center gap-1 disabled:cursor-default">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-body-sm font-semibold ${here ? 'bg-accent text-white' : done ? 'bg-accent/15 text-accent-text' : 'border border-border-control text-text-muted'}`}>
                {done ? <Check size={16} strokeWidth={2.5} /> : i + 1}
              </span>
              <span className={`text-center text-caption leading-tight ${here ? 'font-semibold text-text-primary' : 'text-text-muted'} ${here ? '' : 'max-sm:hidden'}`}>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`mt-4 h-px w-3 shrink-0 sm:w-6 ${i < step ? 'bg-accent' : 'bg-border-control'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function NewProductWizard() {
  const [params] = useSearchParams();
  const [startId] = useState(() => params.get('id'));
  const { data: templates } = useTemplates();
  const { data: libs } = useLibraries();
  const existing = useProduct(startId);
  if (existing.isError) return <p className="text-body text-text-muted">Чернетку не знайдено.</p>;
  if (!templates || !libs || (startId && !existing.data)) return <SkeletonRows />;
  return <Wizard templates={templates} libs={libs} existing={existing.data ?? null} />;
}

function Wizard({ templates, libs, existing }: { templates: Template[]; libs: Libraries; existing: ProductDetail | null }) {
  const nav = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const refresh = useRefreshProducts();
  const { data: me } = useMe();
  const can = (k: string) => !!me?.permissions.includes(k);
  const canPrice = can('products.manage_price'), canStock = can('products.manage_stock');
  const [params, setParams] = useSearchParams();
  const [productId, setProductId] = useState(existing?.id ?? null);
  const step = productId ? Math.min(STEPS.length - 1, Math.max(0, Number(params.get('step') ?? 0) || 0)) : 0;
  const [sku, setSku] = useState(existing?.sku ?? '');
  const [skuText, setSkuText] = useState(existing?.sku ?? '');
  const [doc, setDoc] = useState<ProductDoc>(existing?.document ?? blankDoc());
  const saved = useRef(existing ? JSON.stringify(existing.document) : '');
  const [readiness, setReadiness] = useState<Readiness | null>(existing?.readiness ?? null);
  const [photos, setPhotos] = useState<Photo[]>(existing?.photos ?? []);
  const uploads = usePhotoUploads(productId, setPhotos);
  const [max, setMax] = useState(existing ? STEPS.length - 1 : 0);
  const [busy, setBusy] = useState(false);

  const firstTemplate = existing ? templates.find((t) => t.key === existing.templateKey) ?? null : null;
  const topOf = (id?: string) => { const c = libs.categories.find((x) => x.id === id); return c?.parentId ?? c?.id ?? null; };
  const [tKey, setTKey] = useState<string | null>(firstTemplate?.key ?? null);
  const [tile, setTile] = useState<string | null>(existing ? (topOf(existing.document.categoryIds[0]) ?? `t:${existing.templateKey}`) : null);
  const t = templates.find((x) => x.key === tKey) ?? null;
  const [picked, setPicked] = useState<Record<string, string[]>>(() => (firstTemplate ? pickedFrom(existing!.document, firstTemplate, libs) : {}));
  const [nameTouched, setNameTouched] = useState(!!existing);
  const [basePrice, setBasePrice] = useState(existing?.document.variants[0]?.priceMinor ?? 0);
  const tiles = useMemo(() => tilesOf(templates, libs), [templates, libs]);
  const tileNow = tiles.find((x) => x.key === tile);
  const [rate, setRate] = useState<number | null>(() => (firstTemplate?.draft.ratePerSqmMinor ?? libs.categories.find((c) => c.id === topOf(existing?.document.categoryIds[0]))?.ratePerSqmMinor ?? null));
  const mtoDays = doc.variants.find((v) => v.madeToOrderDays)?.madeToOrderDays ?? null;

  const dirty = productId !== null && JSON.stringify(doc) !== saved.current;
  useUnsavedGuard(dirty || uploads.pending > 0);

  const byId = useMemo(() => new Map([...libs.colors, ...libs.patterns, ...(t ? libs.sizes[t.key] ?? [] : [])].map((v) => [v.id, v])), [libs, t]);
  const sizeIds = useMemo(() => new Set(t ? (libs.sizes[t.key] ?? []).map((v) => v.id) : []), [libs, t]);
  const patch = (next: Partial<ProductDoc>) => setDoc((d) => ({ ...d, ...next }));
  const fail = (e: unknown) => {
    const params = e instanceof ApiError ? (e.body?.error.params as { permissions?: string[]; missing?: string[] } | undefined) : undefined;
    const field = e instanceof ApiError ? e.body?.error.fieldErrors?.[0] : undefined;
    toast(params?.missing ? `Бракує: ${params.missing.join(', ')}` : field?.code === 'SKU_TAKEN' ? `Артикул ${String(field.params?.sku)} вже зайнятий` : messageFor(e instanceof ApiError ? e.code : ''), 'error');
  };

  const save = async (next: ProductDoc = doc, id = productId) => {
    const r = await api<{ savedAt: string; readiness: Readiness }>(`/admin/products/${id}/draft`, { method: 'PUT', body: JSON.stringify(next) });
    saved.current = JSON.stringify(next);
    setReadiness(r.readiness);
  };
  const go = (n: number, id = productId) => { setMax((m) => Math.max(m, n)); setParams(id ? { id, step: String(n) } : { step: String(n) }); window.scrollTo({ top: 0 }); };

  /** The size × colour rows after a tick: new rows get the price (from m² when known), stock 1 (#161). */
  const rebuild = (nextPicked: Record<string, string[]>, d: ProductDoc = doc, p = basePrice) => {
    if (!t) return d.variants;
    const before = new Set(d.variants.map((v) => v.optionValueIds.slice().sort().join('|')));
    return buildMatrix(d, sku, t, libs, nextPicked, { priceMinor: canPrice ? p : 0, stockQty: canStock ? 1 : 0, madeToOrderDays: mtoDays }).map((v) => {
      if (before.has(v.optionValueIds.slice().sort().join('|')) || !rate || !canPrice || v.priceMinor) return v;
      const size = v.optionValueIds.map((id) => byId.get(id)).find((x) => x && sizeIds.has(x.id));
      const area = size ? areaM2(size) : null;
      return area ? { ...v, priceMinor: priceFromRate(area, rate) } : v;
    });
  };
  const autoName = (nextPicked: Record<string, string[]>, d: ProductDoc) => (nameTouched || !t ? d.name : fillName(t.draft.namePattern, t, libs, nextPicked, d.name));

  const toggle = (axis: string, id: string) => {
    const cur = picked[axis] ?? [];
    const next = { ...picked, [axis]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    setPicked(next);
    setDoc((d) => ({ ...d, variants: rebuild(next, d), name: autoName(next, d) }));
  };

  /* ---------- «Далі» for each step ---------- */
  const next = async () => {
    setBusy(true);
    try {
      if (step === 0) {
        if (!t || !tileNow) return;
        const categoryId = doc.categoryIds.find((id) => topOf(id) === tileNow.category?.id) ?? tileNow.category?.id ?? t.defaultCategoryId;
        const own = doc.origin === 'OWN_MANUFACTURE';
        if (!productId) {
          const name = fillName(t.draft.namePattern, t, libs, {}, tileNow.name);
          const r = await post<{ id: string; sku: string }>('/admin/products', { templateKey: t.key, name, origin: doc.origin, ...(categoryId ? { categoryId } : {}) });
          const catRate = libs.categories.find((c) => c.id === tileNow.category?.id)?.ratePerSqmMinor ?? null;
          setRate(t.draft.ratePerSqmMinor ?? catRate);
          const d: ProductDoc = {
            ...doc, name, categoryIds: categoryId ? [categoryId] : [], pricingUnit: (t.pricingUnits[0] ?? 'PIECE') as ProductDoc['pricingUnit'], isHandmade: own,
            composition: t.draft.composition, variants: t.axes.length ? [] : [blankVariant(r.sku, { stockQty: canStock ? 1 : 0 })],
            partnerName: own ? null : doc.partnerName,
          };
          setDoc(d); setSku(r.sku); setSkuText(r.sku); setProductId(r.id);
          await save(d, r.id);
          await refresh();
          go(1, r.id);
        } else {
          const d = { ...doc, categoryIds: categoryId ? [categoryId, ...doc.categoryIds.filter((x) => x !== categoryId && topOf(x) !== tileNow.category?.id)] : doc.categoryIds };
          setDoc(d); await save(d); go(1);
        }
        return;
      }
      if (step === 2) {
        let variants = doc.variants;
        if (skuText.trim().toUpperCase() !== sku) {
          const r = await api<{ sku: string }>(`/admin/products/${productId}/sku`, { method: 'PATCH', body: JSON.stringify({ sku: skuText }) });
          variants = variants.map((v) => (v.sku.startsWith(sku) ? { ...v, sku: `${r.sku}${v.sku.slice(sku.length)}` } : v));
          setSku(r.sku); setSkuText(r.sku);
        }
        const d = { ...doc, variants: variants.map((v) => (canPrice && !v.priceMinor ? { ...v, priceMinor: basePrice } : v)) };
        setDoc(d); await save(d); go(3);
        return;
      }
      if (step === 3) {
        const d = { ...doc, description: doc.description.trim() ? doc.description : t ? fillDescription(t.draft, doc, t, libs) : '' };
        setDoc(d); await save(d); go(4);
        return;
      }
      await save(); go(step + 1);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const jump = async (n: number) => {
    if (!productId) return;
    try { if (dirty) await save(); go(n); } catch (e) { fail(e); }
  };
  const finish = async (publish: boolean) => {
    setBusy(true);
    try {
      await save();
      if (publish) { await post(`/admin/products/${productId}/publish`); toast('Товар на сайті'); }
      else toast('Збережено як чернетку');
      await refresh(productId ?? undefined);
      nav(publish ? `/products/${productId}` : '/products');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const leave = async () => {
    if ((dirty || uploads.pending) && !(await confirm({ title: 'Вийти без збереження?', text: uploads.pending ? 'Ще надсилаються фото — вони можуть не дійти.' : 'Зміни на цьому кроці не збережено.', ok: 'Вийти', danger: true }))) return;
    nav('/products');
  };

  const shownReadiness = readiness ? { ...readiness, items: readiness.items.map((i) => (i.key === 'photo' ? { ...i, ok: photos.length > 0 } : i)) } : null;
  const blocking = shownReadiness?.items.filter((i) => i.blocking && !i.ok) ?? [];
  const sizedRows = t?.axes.includes('size') ? doc.variants.filter((v) => v.optionValueIds.some((o) => sizeIds.has(o))) : [];
  const anyArea = sizedRows.some((v) => { const s = v.optionValueIds.map((id) => byId.get(id)).find((x) => x && sizeIds.has(x.id)); return s && areaM2(s); });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageHeader title="Новий товар" sub={productId ? `Чернетка ${sku}` : undefined} actions={<GhostButton onClick={() => void leave()}>Закрити</GhostButton>} />
      <Steps step={step} max={productId ? max : 0} onGo={(n) => void jump(n)} />
      {step !== 1 && <UploadProgress u={uploads} />}

      <section className="flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-4 sm:p-5">
        {step === 0 && (
          <>
            <h2 className="text-h3 text-text-primary">Що додаємо?</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tiles.map((x) => {
                const on = x.key === tile;
                const locked = !!existing || (!!productId && !x.templates.some((tt) => tt.key === tKey));
                return (
                  <button key={x.key} type="button" disabled={locked && !on} aria-pressed={on}
                    onClick={() => { setTile(x.key); if (!x.templates.some((tt) => tt.key === tKey)) setTKey(x.templates[0]!.key); }}
                    className={`group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border text-left disabled:opacity-40 ${on ? 'border-accent ring-2 ring-accent' : 'border-border-hairline'}`}>
                    {x.category?.image ? <img src={x.category.image} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="absolute inset-0 grid place-items-center bg-bg-alt"><Package size={32} className="text-text-faint" /></span>}
                    <span className="relative bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-body-sm font-semibold text-white">{x.name}</span>
                    {on && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-accent text-white"><Check size={15} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
            {tileNow && tileNow.templates.length > 1 && (
              <div className="flex flex-col gap-2">
                <span className="text-body-sm text-text-muted">Що саме?</span>
                <div className="flex flex-wrap gap-2">
                  {tileNow.templates.map((tt) => (
                    <button key={tt.key} type="button" disabled={!!productId && tt.key !== tKey} aria-pressed={tt.key === tKey} onClick={() => setTKey(tt.key)}
                      className={`min-h-10 rounded-full border px-3 text-body-sm disabled:opacity-40 ${tt.key === tKey ? 'border-accent bg-accent/10 font-medium text-text-primary' : 'border-border-control text-text-body'}`}>
                      {TEMPLATE_LABEL[tt.key] ?? tt.key}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {tileNow?.category && libs.categories.some((c) => c.parentId === tileNow.category!.id) && (
              <div className="flex flex-col gap-2">
                <span className="text-body-sm text-text-muted">Підкатегорія (можна не обирати)</span>
                <div className="flex flex-wrap gap-2">
                  {libs.categories.filter((c) => c.parentId === tileNow.category!.id).map((c) => {
                    const on = doc.categoryIds[0] === c.id;
                    return <button key={c.id} type="button" aria-pressed={on} onClick={() => patch({ categoryIds: on ? [] : [c.id] })} className={`min-h-10 rounded-full border px-3 text-body-sm ${on ? 'border-accent bg-accent/10 font-medium' : 'border-border-control text-text-body'}`}>{c.name}</button>;
                  })}
                </div>
              </div>
            )}
            {productId && <p className="text-caption text-text-muted">Вид товару після створення не змінюється — для іншого виду створіть новий товар.</p>}
            {can('products.manage_origin') && !productId && (
              <div className="flex flex-col gap-2 border-t border-border-hairline pt-3">
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={doc.origin === 'PARTNER_MANUFACTURE'} onChange={(e) => patch({ origin: e.target.checked ? 'PARTNER_MANUFACTURE' : 'OWN_MANUFACTURE' })} />
                  Від партнерів (не нашого виробництва)
                </label>
                {doc.origin === 'PARTNER_MANUFACTURE' && <label className={labelCls}>Назва партнера (на сайті не показується)<input value={doc.partnerName ?? ''} onChange={(e) => patch({ partnerName: e.target.value || null })} className={inputCls} /></label>}
              </div>
            )}
          </>
        )}

        {step === 1 && productId && (
          <>
            <h2 className="text-h3 text-text-primary">Фото</h2>
            <p className="-mt-2 text-body-sm text-text-muted">Можна кілька одразу. Поки фото надсилаються, переходьте далі.</p>
            <PhotoGrid productId={productId} photos={photos} onPhotos={setPhotos} uploads={uploads} canEdit={can('products.manage_media')} />
            {!photos.length && !uploads.items.length && <p className="text-caption text-text-muted">Без фото товар залишиться чернеткою — фото можна додати пізніше.</p>}
          </>
        )}

        {step === 2 && t && (
          <>
            <h2 className="text-h3 text-text-primary">Назва й ціна</h2>
            <label className={labelCls}>Назва
              <input value={doc.name} onChange={(e) => { setNameTouched(true); patch({ name: e.target.value }); }} maxLength={160} className={inputCls} />
              {!nameTouched && t.axes.length > 0 && <span className="text-caption">Колір і розмір допишуться самі на наступному кроці, якщо обрати один.</span>}
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelCls}>Ціна, ₴{doc.pricingUnit === 'KILOGRAM' ? ' за кг' : doc.pricingUnit === 'SKEIN' ? ' за моток' : ''}
                <NumCell money value={basePrice || null} onValue={(v) => setBasePrice(v ?? 0)} disabled={!canPrice} placeholder="1500" className="w-full !py-2 !text-body" />
                {t.axes.includes('size') && <span className="text-caption">Для кожного розміру ціну можна змінити далі.</span>}
              </label>
              <label className={labelCls}>Артикул
                <input value={skuText} onChange={(e) => setSkuText(e.target.value.toUpperCase())} className={`${inputCls} font-mono`} />
                <span className="text-caption">Складається сам; можна змінити.</span>
              </label>
            </div>
            {t.pricingUnits.length > 1 && (
              <label className={labelCls}>Як продається
                <select value={doc.pricingUnit} onChange={(e) => patch({ pricingUnit: e.target.value as ProductDoc['pricingUnit'] })} className={inputCls}>
                  {t.pricingUnits.map((u) => <option key={u} value={u}>{UNIT_LABEL[u] ?? u}</option>)}
                </select>
              </label>
            )}
          </>
        )}

        {step === 3 && t && (
          <>
            <h2 className="text-h3 text-text-primary">Розміри й кольори</h2>
            {t.axes.map((a) => (
              <div key={a} className="flex flex-col gap-2">
                <span className="text-body-sm font-medium text-text-primary">{a === 'size' ? 'Розміри' : a === 'color' ? 'Кольори' : 'Візерунок'}</span>
                <ValuePicker values={axisValues(a, t, libs)} picked={picked[a] ?? []} onToggle={(id) => toggle(a, id)} round={a === 'color'} />
                {can('libraries.manage') && <AddValue kind={a as 'size' | 'color' | 'pattern'} templateKey={a === 'size' ? t.key : undefined} onAdded={(id) => toggle(a, id)} />}
              </div>
            ))}
            {anyArea && canPrice && (
              <div className="flex flex-wrap items-end gap-2 rounded-lg bg-bg-alt p-3">
                <label className={`${labelCls} w-36`}>Ціна за м², ₴<NumCell money value={rate} onValue={(v) => setRate(v || null)} className="w-full !py-2 !text-body" /></label>
                <GhostButton disabled={!rate} onClick={() => setDoc((d) => ({ ...d, variants: d.variants.map((v) => {
                  const s = v.optionValueIds.map((id) => byId.get(id)).find((x) => x && sizeIds.has(x.id)); const area = s && areaM2(s);
                  return area && rate ? { ...v, priceMinor: priceFromRate(area, rate) } : v;
                }) }))}>Порахувати ціни</GhostButton>
                {rate ? <p className="w-full text-caption text-text-muted">{[...new Map(sizedRows.map((v) => { const s = v.optionValueIds.map((id) => byId.get(id)).find((x) => x && sizeIds.has(x.id))!; return [s.id, s]; })).values()].map((s) => { const a = areaM2(s); return a ? `${s.label} — ${uah(priceFromRate(a, rate))}` : null; }).filter(Boolean).join(' · ')}. Перевірте й натисніть «Порахувати ціни».</p> : null}
              </div>
            )}
            {t.axes.length > 0 && !doc.variants.length && <p className="text-body-sm text-text-muted">Позначте розміри й кольори — таблиця цін складеться сама.</p>}
            <VariantGrid variants={doc.variants} byId={byId} sizeIds={sizeIds} canPrice={canPrice} canStock={canStock}
              onPatch={(i, n) => setDoc((d) => ({ ...d, variants: d.variants.map((v, k) => (k === i ? { ...v, ...n } : v)) }))} />
            <div className="flex flex-wrap items-center gap-3 border-t border-border-hairline pt-3">
              <label className="flex items-center gap-2 text-body-sm text-text-primary">
                <input type="checkbox" role="switch" className="size-5 accent-[var(--accent)]" checked={!!mtoDays}
                  onChange={(e) => setDoc((d) => ({ ...d, variants: d.variants.map((v) => ({ ...v, madeToOrderDays: e.target.checked ? 14 : null })) }))} />
                Виготовимо під замовлення
              </label>
              {mtoDays && <label className="flex items-center gap-2 text-body-sm text-text-muted">за<NumCell value={mtoDays} onValue={(x) => setDoc((d) => ({ ...d, variants: d.variants.map((v) => ({ ...v, madeToOrderDays: Math.min(120, x || 1) })) }))} className="w-16" />днів</label>}
            </div>
            <div className="flex flex-col gap-2 border-t border-border-hairline pt-3">
              <span className="text-body-sm font-medium text-text-primary">Склад</span>
              <CompositionEditor value={doc.composition} onChange={(composition) => patch({ composition })} libs={libs} />
            </div>
            {t.attributes.some((a) => a.isRequired) && (
              <div className="grid gap-3 border-t border-border-hairline pt-3 sm:grid-cols-2">
                {t.attributes.filter((a) => a.isRequired).map((a) => <Attr key={a.id} a={a} doc={doc} patch={patch} />)}
              </div>
            )}
          </>
        )}

        {step === 4 && t && (
          <>
            <h2 className="text-h3 text-text-primary">Опис</h2>
            <label className={labelCls}>Опис для покупця — перше речення стане коротким описом
              <textarea value={doc.description} onChange={(e) => patch({ description: e.target.value })} rows={12} className={inputCls} />
            </label>
            <details className="rounded-lg border border-border-hairline px-3 py-2">
              <summary className="cursor-pointer text-body-sm font-medium text-text-primary">Додатково</summary>
              <div className="mt-3 flex flex-col gap-3">
                <label className={labelCls}>Заголовок для Google (порожньо — складеться сам)
                  <input value={doc.metaTitle ?? ''} onChange={(e) => patch({ metaTitle: e.target.value || null })} placeholder={`${doc.name} | Вівчарик`} maxLength={160} className={inputCls} />
                </label>
                <label className={labelCls}>Опис для Google (порожньо — перше речення опису)
                  <input value={doc.metaDescription ?? ''} onChange={(e) => patch({ metaDescription: e.target.value || null })} placeholder={doc.description.split(/(?<=[.!?])\s/)[0] ?? ''} maxLength={320} className={inputCls} />
                </label>
                <label className={labelCls}>Інші назви для пошуку (через кому)
                  <input defaultValue={doc.searchSynonyms.join(', ')} onBlur={(e) => patch({ searchSynonyms: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) })} placeholder="коц, покривало" className={inputCls} />
                </label>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {doc.origin === 'OWN_MANUFACTURE' && <label className="flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={doc.isHandmade} onChange={(e) => patch({ isHandmade: e.target.checked })} />Ручна робота</label>}
                  <label className="flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={doc.isUniquePiece} onChange={(e) => patch({ isUniquePiece: e.target.checked })} />Єдиний екземпляр</label>
                </div>
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
              </div>
            </details>
          </>
        )}

        {step === 5 && t && (
          <>
            <h2 className="text-h3 text-text-primary">Так товар виглядатиме на сайті</h2>
            <ProductPreview doc={doc} photos={photos} libs={libs} t={t} />
            {shownReadiness && <ReadinessLine r={shownReadiness} />}
            {uploads.pending > 0 && <p className="text-body-sm text-warning">Ще надсилаються фото — зачекайте хвилинку перед публікацією.</p>}
          </>
        )}
      </section>

      {/* Main actions at the bottom, one hand (#253). */}
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 -mx-4 border-t border-border-hairline bg-bg-surface/95 px-4 py-2.5 backdrop-blur md:bottom-3 md:mx-0 md:rounded-xl md:border md:shadow-lg">
        <div className="flex items-center gap-2">
          {step > 0 && <GhostButton icon={ChevronLeft} onClick={() => void jump(step - 1)} disabled={busy}>Назад</GhostButton>}
          <span className="flex-1" />
          {step < 5 && (
            <PrimaryButton onClick={() => void next()} disabled={busy || (step === 0 && !t) || (step === 2 && doc.name.trim().length < 2)}>
              {step === 1 && !photos.length && !uploads.items.length ? 'Пропустити' : 'Далі'}<ChevronRight size={18} />
            </PrimaryButton>
          )}
          {step === 5 && (
            <>
              <GhostButton disabled={busy} onClick={() => void finish(false)}>Зберегти чернеткою</GhostButton>
              {can('products.publish') && <PrimaryButton disabled={busy || blocking.length > 0 || uploads.pending > 0} onClick={() => void finish(true)}>Опублікувати</PrimaryButton>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Attr({ a, doc, patch }: { a: Template['attributes'][number]; doc: ProductDoc; patch: (n: Partial<ProductDoc>) => void }) {
  const cur = doc.attributes.find((x) => x.definitionId === a.id)?.value ?? '';
  const set = (value: string) => patch({ attributes: [...doc.attributes.filter((x) => x.definitionId !== a.id), ...(value ? [{ definitionId: a.id, value }] : [])] });
  return (
    <label className={labelCls}>{a.name}{a.unit ? `, ${a.unit}` : ''}
      {a.options ? (
        <select value={cur} onChange={(e) => set(e.target.value)} className={inputCls}><option value="">—</option>{a.options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
      ) : <input value={cur} onChange={(e) => set(e.target.value)} inputMode={a.dataType === 'NUMBER' ? 'decimal' : undefined} className={inputCls} />}
    </label>
  );
}


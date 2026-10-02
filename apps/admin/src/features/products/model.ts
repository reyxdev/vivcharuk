import type { Libraries, LibValue, ProductDoc, Template, TemplateDraft, VariantDoc } from './api';
import { STAGE_LABEL } from './api';

// Money is typed in whole hryvnias and stored in kopecks.
export const toUah = (minor: number | null | undefined) => (minor ? String(minor / 100) : '');
export const fromUah = (s: string) => (s.trim() === '' ? 0 : Math.max(0, Math.round(Number(s.replace(',', '.').replace(/\s/g, '')) * 100) || 0));
export const int = (s: string) => (s.trim() === '' ? null : Math.max(0, Math.round(Number(s)) || 0));

export const AXIS_LABEL: Record<string, string> = { size: 'Розміри', color: 'Кольори', pattern: 'Візерунки' };
export const ROLE_LABEL: Record<string, string> = { main: 'Основний склад', warp: 'Основа', weft: 'Уток', filling: 'Наповнювач' };

export function axisValues(axis: string, t: Template, libs: Libraries): LibValue[] {
  if (axis === 'size') return libs.sizes[t.key] ?? [];
  if (axis === 'color') return libs.colors;
  if (axis === 'pattern') return libs.patterns;
  return [];
}

export function pickedFrom(doc: ProductDoc, t: Template, libs: Libraries) {
  const out: Record<string, string[]> = {};
  for (const a of t.axes) {
    const ids = new Set(axisValues(a, t, libs).map((v) => v.id));
    out[a] = [...new Set(doc.variants.flatMap((v) => v.optionValueIds.filter((o) => ids.has(o))))];
  }
  return out;
}

export const blankVariant = (sku: string, over: Partial<VariantDoc> = {}): VariantDoc => ({
  sku, optionValueIds: [], priceMinor: 0, compareAtMinor: null, stockQty: 0, madeToOrderDays: null, weightGrams: null, packedWeightGrams: null,
  packedLengthCm: null, packedWidthCm: null, packedHeightCm: null, isMainColor: false, isActive: true, ...over,
});

/**
 * The size × colour table is the cartesian product of the ticked values, in template axis order
 * (37 §37.4). Existing rows keep their numbers; a new row takes price and packing from a sibling of
 * the same size (the price of a size is shared by its colours), else the given defaults.
 */
export function buildMatrix(doc: ProductDoc, sku: string, t: Template, libs: Libraries, picked: Record<string, string[]>, defaults: Partial<VariantDoc> = {}): VariantDoc[] {
  if (t.axes.length === 0) return [doc.variants[0] ?? blankVariant(sku, defaults)];
  const axes = t.axes.filter((a) => (picked[a] ?? []).length > 0);
  if (axes.length === 0) return [];
  let combos: string[][] = [[]];
  for (const a of axes) {
    const order = axisValues(a, t, libs).map((v) => v.id);
    const vals = [...picked[a]!].sort((x, y) => order.indexOf(x) - order.indexOf(y));
    combos = combos.flatMap((c) => vals.map((v) => [...c, v]));
  }
  const key = (ids: string[]) => [...ids].sort().join('|');
  const existing = new Map(doc.variants.map((v) => [key(v.optionValueIds), v]));
  const all = [...libs.colors, ...libs.patterns, ...(libs.sizes[t.key] ?? [])];
  const code = (id: string) => all.find((v) => v.id === id)?.skuCode ?? '';
  const sizeIds = new Set((libs.sizes[t.key] ?? []).map((v) => v.id));
  return combos.map((ids) => {
    const prev = existing.get(key(ids));
    if (prev) return prev;
    const sibling = doc.variants.find((v) => v.optionValueIds.some((o) => sizeIds.has(o) && ids.includes(o)));
    return blankVariant([sku, ...ids.map(code)].filter(Boolean).join('-'), {
      ...defaults, optionValueIds: ids,
      ...(sibling ? {
        priceMinor: sibling.priceMinor, weightGrams: sibling.weightGrams, packedWeightGrams: sibling.packedWeightGrams,
        packedLengthCm: sibling.packedLengthCm, packedWidthCm: sibling.packedWidthCm, packedHeightCm: sibling.packedHeightCm,
      } : {}),
    });
  });
}

/** Area of a size in m², from its dimensions or a «150×200» label. */
export function areaM2(v: LibValue) {
  const w = v.dimensions?.widthCm, l = v.dimensions?.lengthCm;
  if (w && l) return (w * l) / 10_000;
  const m = /(\d{2,3})\s*[×xх*]\s*(\d{2,3})/i.exec(v.label);
  return m ? (Number(m[1]) * Number(m[2])) / 10_000 : null;
}
/** Price from the price per m², rounded to 10 ₴ (round 20 #160: suggested, Іван confirms). */
export const priceFromRate = (area: number, rateMinor: number) => Math.max(1000, Math.round((area * rateMinor) / 1000) * 1000);

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();

/** «Ліжник вовняний сірий 150×200» (round 20 #156): colour and size only when exactly one is ticked. */
export function fillName(pattern: string, t: Template, libs: Libraries, picked: Record<string, string[]>, fallback: string) {
  const one = (axis: string) => (picked[axis]?.length === 1 ? axisValues(axis, t, libs).find((v) => v.id === picked[axis]![0]) : undefined);
  const color = one('color')?.label.toLowerCase() ?? '';
  const size = one('size')?.label.replace(/\s*(см|cm)\.?$/i, '') ?? '';
  const name = clean(pattern.replace(/\{тип\}/g, t.typePrefix).replace(/\{колір\}/g, color).replace(/\{розмір\}/g, size));
  return name.length >= 2 ? name : fallback;
}

/** The description draft of the template (round 20 #127) with its tokens filled from the product. */
export function fillDescription(draft: TemplateDraft, doc: ProductDoc, t: Template, libs: Libraries) {
  const material = (id: string) => libs.materials.find((m) => m.id === id)?.name.toLowerCase() ?? '';
  const composition = doc.composition.map((c) => `${material(c.materialId)} ${c.percent} %`).join(', ');
  const sizeIds = new Set((libs.sizes[t.key] ?? []).map((v) => v.id));
  const sizes = [...new Set(doc.variants.flatMap((v) => v.optionValueIds.filter((o) => sizeIds.has(o))))]
    .map((id) => libs.sizes[t.key]!.find((v) => v.id === id)!.label);
  const stages = t.storyStages.filter((s) => !doc.storyStagesOff.includes(s)).map((s) => STAGE_LABEL[s]?.toLowerCase() ?? s);
  const making = doc.origin === 'OWN_MANUFACTURE' && stages.length ? `Робимо самі в Карпатах: ${stages.join(', ')}.` : '';
  return draft.description
    .replace(/\{назва\}/g, doc.name)
    .replace(/\{склад\}/g, composition || '…')
    .replace(/\{розміри\}/g, sizes.length ? ` Розміри: ${sizes.join(', ')}.` : '')
    .replace(/\{виготовлення\}/g, making)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function variantLabel(v: VariantDoc, byId: Map<string, LibValue>) {
  return v.optionValueIds.map((id) => byId.get(id)?.label).filter(Boolean).join(' · ') || 'Один варіант';
}

export function priceText(min: number, max: number, uah: (m: number) => string) {
  if (!max) return '—';
  return min === max ? uah(min) : `${uah(min)} – ${uah(max)}`;
}

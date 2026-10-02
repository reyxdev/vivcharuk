import { useEffect, useRef, useState } from 'react';
import type { LibValue, VariantDoc } from './api';
import { fromUah, int, toUah } from './model';

// Round 20 #129, #273: the size × colour table with a price and a stock each. On a computer a table;
// on the phone each size is a card with its colours. Numbers open the numeric keyboard (#268).

const cell = 'min-w-0 rounded-md border border-border-control bg-bg-input px-2 py-1.5 text-body-sm text-text-primary disabled:opacity-60 max-md:py-2.5 max-md:text-body';

/** A number field that keeps what is typed («15,» stays) and reports the parsed value. */
export function NumCell({ value, onValue, money = false, className = '', ...rest }: { value: number | null; onValue: (v: number | null) => void; money?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const show = (v: number | null) => (money ? toUah(v) : v === null ? '' : String(v));
  const [text, setText] = useState(show(value));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(show(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input {...rest} inputMode={money ? 'decimal' : 'numeric'} value={text}
      onFocus={(e) => { focused.current = true; e.target.select(); }} onBlur={() => { focused.current = false; setText(show(value)); }}
      onChange={(e) => { setText(e.target.value); onValue(money ? fromUah(e.target.value) : int(e.target.value)); }}
      className={`${cell} tabular ${className}`} />
  );
}

export function VariantGrid({ variants, byId, sizeIds, unitHint = '', canPrice, canStock, extended = false, showDays = false, onPatch, selected, onSelect }: {
  variants: VariantDoc[]; byId: Map<string, LibValue>; sizeIds: Set<string>; unitHint?: string; canPrice: boolean; canStock: boolean;
  extended?: boolean; showDays?: boolean; onPatch: (i: number, next: Partial<VariantDoc>) => void; selected?: Set<number>; onSelect?: (s: Set<number>) => void;
}) {
  if (!variants.length) return null;
  const label = (ids: string[], only?: 'size' | 'rest') => ids.filter((id) => (only === 'size' ? sizeIds.has(id) : only === 'rest' ? !sizeIds.has(id) : true)).map((id) => byId.get(id)).filter(Boolean) as LibValue[];
  const toggle = (i: number) => { if (!selected || !onSelect) return; const s = new Set(selected); if (s.has(i)) s.delete(i); else s.add(i); onSelect(s); };
  const bad = (v: VariantDoc) => v.isActive && v.priceMinor <= 0;

  // Phone: one card per size (or one card when there are no sizes).
  const groups = new Map<string, number[]>();
  variants.forEach((v, i) => { const k = label(v.optionValueIds, 'size').map((x) => x.id).join('|') || '—'; groups.set(k, [...(groups.get(k) ?? []), i]); });

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 max-md:hidden md:mx-0 md:px-0">
        <table className={`w-full text-left text-body-sm ${extended ? 'min-w-[56rem]' : ''}`}>
          <thead className="text-caption text-text-muted">
            <tr>
              {onSelect && <th className="w-8 p-1.5"><input type="checkbox" aria-label="Позначити всі" checked={selected!.size === variants.length} onChange={(e) => onSelect(e.target.checked ? new Set(variants.map((_, n) => n)) : new Set())} className="size-4 accent-[var(--accent)]" /></th>}
              <th className="p-1.5 font-medium">Розмір і колір</th>
              <th className="p-1.5 font-medium">Ціна, ₴{unitHint}</th>
              <th className="p-1.5 font-medium">Залишок</th>
              {(showDays || extended) && <th className="p-1.5 font-medium" title="Виготовимо під замовлення за стільки днів">Під замовл., дн.</th>}
              {extended && <><th className="p-1.5 font-medium">Стара ціна</th><th className="p-1.5 font-medium">Артикул</th><th className="p-1.5 font-medium">Вага в упак., г</th><th className="p-1.5 font-medium">Упаковка Д×Ш×В, см</th><th className="p-1.5 font-medium">Продається</th></>}
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={v.optionValueIds.join('|') || i} className={`border-t border-border-hairline ${bad(v) ? 'bg-danger/5' : ''} ${v.isActive ? '' : 'opacity-50'}`}>
                {onSelect && <td className="p-1.5"><input type="checkbox" aria-label="Позначити" checked={selected!.has(i)} onChange={() => toggle(i)} className="size-4 accent-[var(--accent)]" /></td>}
                <td className="whitespace-nowrap p-1.5 text-text-primary">
                  <span className="inline-flex items-center gap-1.5">
                    {label(v.optionValueIds).map((x) => x.hex ? <span key={x.id} className="size-3.5 rounded-full border border-border-hairline" style={{ background: x.hex }} aria-hidden="true" /> : null)}
                    {label(v.optionValueIds).map((x) => x.label).join(' · ') || 'Один варіант'}
                  </span>
                </td>
                <td className="p-1.5"><NumCell money value={v.priceMinor} onValue={(x) => onPatch(i, { priceMinor: x ?? 0 })} disabled={!canPrice} aria-label="Ціна" className={`w-24 ${bad(v) ? 'border-danger' : ''}`} /></td>
                <td className="p-1.5"><NumCell value={v.stockQty} onValue={(x) => onPatch(i, { stockQty: x ?? 0 })} disabled={!canStock} aria-label="Залишок" className="w-16" /></td>
                {(showDays || extended) && <td className="p-1.5"><NumCell value={v.madeToOrderDays} onValue={(x) => onPatch(i, { madeToOrderDays: x || null })} aria-label="Під замовлення, днів" className="w-16" /></td>}
                {extended && (
                  <>
                    <td className="p-1.5"><NumCell money value={v.compareAtMinor} onValue={(x) => onPatch(i, { compareAtMinor: x || null })} disabled={!canPrice} aria-label="Стара ціна" className="w-24" /></td>
                    <td className="p-1.5"><input value={v.sku} onChange={(e) => onPatch(i, { sku: e.target.value.toUpperCase() })} className={`${cell} w-44 font-mono`} aria-label="Артикул" /></td>
                    <td className="p-1.5"><NumCell value={v.packedWeightGrams} onValue={(x) => onPatch(i, { packedWeightGrams: x })} aria-label="Вага в упаковці" className="w-20" /></td>
                    <td className="p-1.5">
                      <span className="flex gap-1">
                        {([['packedLengthCm', 'Довжина'], ['packedWidthCm', 'Ширина'], ['packedHeightCm', 'Висота']] as const).map(([k, l]) => <NumCell key={k} value={v[k]} onValue={(x) => onPatch(i, { [k]: x })} aria-label={l} className="w-12" />)}
                      </span>
                    </td>
                    <td className="p-1.5 text-center"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={v.isActive} onChange={(e) => onPatch(i, { isActive: e.target.checked })} aria-label="Продається" /></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {[...groups.entries()].map(([k, idx]) => {
          const size = label(variants[idx[0]!]!.optionValueIds, 'size').map((x) => x.label).join(' · ');
          return (
            <section key={k} className="rounded-xl border border-border-hairline bg-bg-surface p-3">
              {size && <h4 className="mb-2 text-body font-semibold text-text-primary">{size}</h4>}
              <ul className="flex flex-col gap-2">
                {idx.map((i) => {
                  const v = variants[i]!;
                  const rest = label(v.optionValueIds, size ? 'rest' : undefined);
                  return (
                    <li key={i} className={`flex flex-col gap-2 ${v.isActive ? '' : 'opacity-50'}`}>
                      <div className="flex items-center gap-2">
                        {onSelect && <input type="checkbox" aria-label="Позначити" checked={selected!.has(i)} onChange={() => toggle(i)} className="size-5 accent-[var(--accent)]" />}
                        {rest.map((x) => x.hex ? <span key={x.id} className="size-5 shrink-0 rounded-full border border-border-hairline" style={{ background: x.hex }} aria-hidden="true" /> : null)}
                        <span className="min-w-0 flex-1 truncate text-body-sm text-text-body">{rest.map((x) => x.label).join(' · ') || (size ? 'Ціна й залишок' : 'Один варіант')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1 text-caption text-text-muted">Ціна, ₴{unitHint}<NumCell money value={v.priceMinor} onValue={(x) => onPatch(i, { priceMinor: x ?? 0 })} disabled={!canPrice} className={`w-full ${bad(v) ? 'border-danger' : ''}`} /></label>
                        <label className="flex flex-col gap-1 text-caption text-text-muted">Залишок, шт.<NumCell value={v.stockQty} onValue={(x) => onPatch(i, { stockQty: x ?? 0 })} disabled={!canStock} className="w-full" /></label>
                      </div>
                      {(extended || showDays) && (
                        <details className="text-body-sm">
                          <summary className="cursor-pointer text-caption text-text-muted">Ще: під замовлення{extended ? ', стара ціна, артикул, упаковка' : ''}</summary>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <label className="flex flex-col gap-1 text-caption text-text-muted">Під замовлення, днів<NumCell value={v.madeToOrderDays} onValue={(x) => onPatch(i, { madeToOrderDays: x || null })} className="w-full" /></label>
                            {extended && (
                              <>
                                <label className="flex flex-col gap-1 text-caption text-text-muted">Стара ціна, ₴<NumCell money value={v.compareAtMinor} onValue={(x) => onPatch(i, { compareAtMinor: x || null })} disabled={!canPrice} className="w-full" /></label>
                                <label className="col-span-2 flex flex-col gap-1 text-caption text-text-muted">Артикул<input value={v.sku} onChange={(e) => onPatch(i, { sku: e.target.value.toUpperCase() })} className={`${cell} font-mono`} /></label>
                                <label className="flex flex-col gap-1 text-caption text-text-muted">Вага в упак., г<NumCell value={v.packedWeightGrams} onValue={(x) => onPatch(i, { packedWeightGrams: x })} className="w-full" /></label>
                                <label className="flex flex-col gap-1 text-caption text-text-muted">Упаковка Д×Ш×В, см
                                  <span className="flex gap-1">{(['packedLengthCm', 'packedWidthCm', 'packedHeightCm'] as const).map((k) => <NumCell key={k} value={v[k]} onValue={(x) => onPatch(i, { [k]: x })} className="w-full" aria-label={k} />)}</span>
                                </label>
                                <label className="col-span-2 flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={v.isActive} onChange={(e) => onPatch(i, { isActive: e.target.checked })} />Продається</label>
                              </>
                            )}
                          </div>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

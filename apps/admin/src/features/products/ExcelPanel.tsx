import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, download, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { useMe } from '@/features/auth/useSession';

interface Row { rowNumber: number; variantSku: string; name: string; variant: string; action: 'update' | 'create' | 'error'; changes: Record<string, [unknown, unknown]>; errors: string[]; warnings: string[] }
interface DryRun {
  totals: { update: number; create: number; unchanged: number; error: number };
  rows: Row[]; blockers: Array<{ message: string; rowNumbers: number[] }>; warnings: number;
  columns: string[]; skippedColumns: string[]; unknownColumns: string[]; hash: string;
}

const LABEL: Record<string, string> = {
  variant: 'Новий варіант', price: 'Ціна', compare_at: 'Стара ціна', stock: 'Залишок', low_stock: 'Попередити при залишку', weight_g: 'Вага, г',
  packed_weight_g: 'Вага в упаковці, г', packed_length_cm: 'Довжина упаковки', packed_width_cm: 'Ширина упаковки',
  packed_height_cm: 'Висота упаковки', length_m: 'Метраж', ply: 'Товщина нитки', barcode: 'Штрихкод',
};
const MONEY = new Set(['price', 'compare_at']);
const show = (k: string, v: unknown) => (v === null || v === undefined || v === '' ? '—' : MONEY.has(k) ? `${(v as number) / 100} ₴` : String(v));
const ERR: Record<string, string> = {
  NOT_XLSX: 'Це не файл Excel (.xlsx). Збережіть таблицю як «Книга Excel» і спробуйте ще раз.',
  NO_SKU_COLUMN: 'У файлі немає стовпця «Артикул варіанта» — за ним ми знаходимо товари. Почніть з вивантаженого файла.',
  TOO_MANY_ROWS: 'Забагато рядків (понад 5000).',
  IMPORT_CHANGED: 'Поки ви переглядали зміни, дані в магазині змінились (наприклад, прийшло замовлення). Перевірте ще раз.',
  IMPORT_BLOCKED: 'У файлі є помилки — виправте їх.',
};

const toBase64 = (f: File) => f.arrayBuffer().then((b) => { let s = ''; const u = new Uint8Array(b); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); });

function csvOfDiff(d: DryRun) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [['Рядок', 'Артикул', 'Товар', 'Варіант', 'Поле', 'Було', 'Стане', 'Помилки / увага'].map(q).join(';')];
  for (const r of d.rows) {
    const notes = [...r.errors, ...r.warnings].join('; ');
    const ch = Object.entries(r.changes);
    if (!ch.length) lines.push([String(r.rowNumber), r.variantSku, r.name, r.variant, '', '', '', notes].map(q).join(';'));
    for (const [k, [b, a]] of ch) lines.push([String(r.rowNumber), r.variantSku, r.name, r.variant, LABEL[k] ?? k, show(k, b), show(k, a), notes].map(q).join(';'));
  }
  return `﻿${lines.join('\n')}`;
}

/** 37 §37.8 + round 12 G8/G9: export, «Завантажити шаблон» per template, import with the full preview. */
export function ExcelPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: templates } = useQuery({ queryKey: ['product-templates'], queryFn: () => api<{ items: Array<{ id: string; key: string; typePrefix: string }> }>('/admin/product-templates') });
  const [tpl, setTpl] = useState('');
  const [file, setFile] = useState<{ name: string; b64: string } | null>(null);
  const [dry, setDry] = useState<DryRun | null>(null);
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ updated: number; created: number } | null>(null);

  const fail = (e: unknown) => setErr(e instanceof ApiError ? (ERR[e.body?.error.message ?? ''] ?? messageFor(e.code)) : messageFor(''));
  const date = new Date().toISOString().slice(0, 10);
  const exportFile = async () => {
    setErr('');
    const t = templates?.items.find((x) => x.id === tpl);
    try { await download(`/admin/products/export.xlsx${tpl ? `?templateId=${tpl}` : ''}`, `vivcharyk-tovary${t ? `-${t.key}` : ''}-${date}.xlsx`); } catch (e) { fail(e); }
  };
  const check = async (f: File) => {
    setErr(''); setDry(null); setDone(null); setConfirm(''); setBusy(true);
    try {
      const b64 = await toBase64(f);
      setFile({ name: f.name, b64 });
      setDry(await post<DryRun>('/admin/products/import/dry-run', { file: b64 }));
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const commit = async () => {
    if (!file || !dry) return;
    setBusy(true); setErr('');
    try {
      const r = await post<{ updated: number; created: number }>('/admin/products/import/commit', { file: file.b64, hash: dry.hash, confirmWarnings: dry.warnings > 0 });
      setDone(r); setDry(null); setFile(null);
      await qc.invalidateQueries({ queryKey: ['products'] });
    } catch (e) { fail(e); if (e instanceof ApiError && e.body?.error.message === 'IMPORT_CHANGED') setDry(null); } finally { setBusy(false); }
  };
  const blocked = !dry || dry.blockers.length > 0 || dry.totals.update + dry.totals.create === 0 || (dry.warnings > 0 && confirm.trim().toUpperCase() !== 'ТАК');

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-accent bg-bg-raised p-4">
      <div className="flex items-center gap-3">
        <h2 className="text-h4 text-text-primary">Excel: ціни, залишки, вага й упаковка</h2>
        <button type="button" onClick={onClose} className="ml-auto text-body-sm underline">Закрити</button>
      </div>
      <p className="text-body-sm text-text-body">Вивантажте таблицю, змініть потрібні клітинки (помаранчеві стовпці) і завантажте її назад. Сірі стовпці — лише для довідки. Товари знаходимо за «Артикулом варіанта». Щоб додати новий варіант (розмір, колір), допишіть рядок з «Артикулом товару», новим артикулом варіанта, «Варіантом» (як в інших рядках, наприклад «200×220 см · Сірий») і ціною — він ляже в чернетку товару. Нові товари створюються в панелі. Стовпець, якого немає у файлі, не змінюється; порожня клітинка стирає значення. Нічого не записується, поки ви не переглянете всі зміни й не натиснете «Підтвердити».</p>

      {can('products.export') && (
        <div className="flex flex-wrap items-center gap-2">
          <select value={tpl} onChange={(e) => setTpl(e.target.value)} aria-label="Які товари" className="rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm">
            <option value="">Усі товари</option>
            {templates?.items.map((t) => <option key={t.id} value={t.id}>Лише: {t.typePrefix}</option>)}
          </select>
          <button type="button" onClick={exportFile} className="rounded-lg border border-border-control px-4 py-2 text-body-sm font-semibold text-text-primary">Вивантажити в Excel</button>
        </div>
      )}

      {can('products.import') && (
        <label className="cursor-pointer self-start rounded-lg bg-accent px-4 py-2 text-body-sm font-semibold text-bg-page">
          {busy && !dry ? 'Перевіряємо…' : 'Завантажити змінений файл…'}
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void check(f); }} />
        </label>
      )}

      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
      {done !== null && (
        <p role="status" className="text-body-sm text-ok">
          Готово: змінено {done.updated}{done.created ? `, додано нових варіантів ${done.created}` : ''}. Зміни цін і залишків уже на сайті.
          {done.created > 0 && ' Нові варіанти лежать у чернетках товарів — відкрийте товар і натисніть «Опублікувати».'}
        </p>
      )}

      {dry && (
        <div className="flex flex-col gap-3">
          <p className="text-body text-text-primary">
            <strong>{file?.name}</strong>: зміниться {dry.totals.update}{dry.totals.create > 0 && ` · нових варіантів ${dry.totals.create}`} · без змін {dry.totals.unchanged}{dry.totals.error > 0 && <span className="text-danger"> · з помилками {dry.totals.error}</span>}
          </p>
          {dry.skippedColumns.length > 0 && <p className="text-body-sm text-warning">Без вашого права змінювати: {dry.skippedColumns.join(', ')} — ці стовпці пропущено.</p>}
          {dry.unknownColumns.length > 0 && <p className="text-body-sm text-text-muted">Незнайомі стовпці пропущено: {dry.unknownColumns.join(', ')}.</p>}
          {dry.blockers.map((b) => <p key={b.message} role="alert" className="text-body-sm text-danger">{b.message}: рядки {b.rowNumbers.slice(0, 30).join(', ')}{b.rowNumbers.length > 30 ? '…' : ''}</p>)}
          {dry.rows.length > 0 && (
            <div className="max-h-[28rem] overflow-auto rounded-md border border-border-hairline">
              <table className="w-full text-left text-body-sm">
                <thead className="sticky top-0 bg-bg-surface text-caption text-text-muted"><tr><th className="p-2">Рядок</th><th className="p-2">Товар</th><th className="p-2">Що зміниться</th></tr></thead>
                <tbody>
                  {dry.rows.map((r) => (
                    <tr key={r.rowNumber} className={`border-t border-border-hairline align-top ${r.action === 'error' ? 'bg-danger/5' : ''}`}>
                      <td className="p-2">{r.rowNumber}</td>
                      <td className="p-2"><span className="text-text-primary">{r.name || r.variantSku}</span>{r.variant && <span className="block text-caption text-text-muted">{r.variant}</span>}<span className="block font-mono text-caption text-text-muted">{r.variantSku}</span></td>
                      <td className="p-2">
                        {r.action === 'create' && <span className="block font-semibold text-ok">+ Новий варіант у чернетку товару</span>}
                        {Object.entries(r.changes).map(([k, [b, a]]) => r.action === 'create'
                          ? <span key={k} className="block">{LABEL[k] ?? k}: <strong>{show(k, a)}</strong></span>
                          : <span key={k} className="block">{LABEL[k] ?? k}: <span className="text-text-muted line-through">{show(k, b)}</span> → <strong>{show(k, a)}</strong></span>)}
                        {r.errors.map((m) => <span key={m} className="block text-danger">{m}</span>)}
                        {r.warnings.map((m) => <span key={m} className="block text-warning">⚠ {m}</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvOfDiff(dry))}`} download={`zminy-${date}.csv`} className="self-start text-body-sm underline">Завантажити список змін (для перевірки іншою людиною)</a>
          {dry.warnings > 0 && dry.blockers.length === 0 && (
            <label className="flex flex-col gap-1 text-body-sm text-warning">Є великі зміни ціни ({dry.warnings}). Якщо все правильно, напишіть «ТАК»:
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="max-w-40 rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary" />
            </label>
          )}
          <button type="button" disabled={blocked || busy} onClick={commit} className="self-start rounded-lg bg-accent px-4 py-2 text-body-sm font-semibold text-bg-page disabled:opacity-40">{busy ? 'Записуємо…' : `Підтвердити: ${dry.totals.update + dry.totals.create}`}</button>
        </div>
      )}
    </section>
  );
}

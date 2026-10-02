import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';

interface Row { line: number; status: 'import' | 'skip'; reason?: string; date: string | null; rating: number | null; author: string; text: string; product: { name: string } | null }

const TEMPLATE = 'date;rating;author;text;product;ref\n14.03.2025;5;Олена Коваль;"Дуже теплі капці, дякую!";VCH-KP-0101;\n';

/** Round 13 N2 + round 12 G8: a CSV from Prom (or typed by hand), a preview of every row, then «Підтвердити». */
export function PromImport() {
  const qc = useQueryClient();
  const [csv, setCsv] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (file: File) => {
    setErr(''); setRows(null); setDone(null);
    const text = await file.text();
    setCsv(text);
    try { setRows((await post<{ rows: Row[] }>('/admin/reviews/import/preview', { csv: text })).rows); }
    catch (e) { setErr(e instanceof ApiError && e.body?.error.fieldErrors?.[0]?.code === 'COLUMNS' ? 'Потрібні стовпці: date, rating, author, text (і за бажанням product, ref). Візьміть шаблон.' : messageFor(e instanceof ApiError ? e.code : '')); }
  };
  const commit = async () => {
    setBusy(true);
    try { const r = await post<{ imported: number }>('/admin/reviews/import/commit', { csv }); setDone(r.imported); setRows(null); await qc.invalidateQueries({ queryKey: ['reviews'] }); }
    catch (e) { setErr(messageFor(e instanceof ApiError ? e.code : '')); } finally { setBusy(false); }
  };
  const ok = rows?.filter((r) => r.status === 'import').length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-text-body">Переносяться лише оцінки 3–5, з первісною датою; на сайті вони підписані «Prom.ua · перенесено». Товар шукаємо за артикулом або точною назвою; якщо не знайдено — це відгук про магазин. Повторний імпорт того самого файлу нічого не дублює.</p>
      <div className="flex flex-wrap items-center gap-3">
        <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${TEMPLATE}`)}`} download="vidguky-prom-shablon.csv" className="rounded-md border border-border-control px-3 py-1.5 text-body-sm">Завантажити шаблон CSV</a>
        <label className="cursor-pointer rounded-md bg-accent px-3 py-1.5 text-body-sm font-semibold text-white">Вибрати файл…<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && void load(e.target.files[0])} /></label>
      </div>
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
      {done !== null && <p role="status" className="text-body-sm text-success">Імпортовано: {done}. Вони вже на сайті, у вкладці «Опубліковані».</p>}
      {rows && (
        <>
          <div className="max-h-96 overflow-auto rounded-md border border-border-hairline">
            <table className="w-full text-left text-body-sm">
              <thead className="sticky top-0 bg-bg-surface text-caption text-text-muted"><tr><th className="p-2">Рядок</th><th className="p-2">Дата</th><th className="p-2">★</th><th className="p-2">Автор</th><th className="p-2">Текст</th><th className="p-2">Товар</th><th className="p-2">Дія</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={`border-t border-border-hairline ${r.status === 'skip' ? 'opacity-50' : ''}`}>
                    <td className="p-2">{r.line}</td><td className="p-2 whitespace-nowrap">{r.date ? new Date(r.date).toLocaleDateString('uk-UA') : '—'}</td><td className="p-2">{r.rating ?? '—'}</td>
                    <td className="p-2">{r.author}</td><td className="max-w-80 truncate p-2" title={r.text}>{r.text}</td><td className="p-2">{r.product?.name ?? 'про магазин'}</td>
                    <td className="p-2">{r.status === 'import' ? 'Імпортувати' : r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" disabled={!ok || busy} onClick={commit} className="self-start rounded-lg bg-accent px-4 py-2 text-body-sm font-semibold text-white disabled:opacity-40">Підтвердити: імпортувати {ok}</button>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { Printer, X } from 'lucide-react';
import { api } from '@/lib/api';
import { uah } from '@/lib/format';

interface TagData { productId: string; name: string; slug: string | null; sku: string; unit: string; priceMinor: number; size: string; color: string; composition: string }
type Tag = TagData & { qr: string | null };

const PER_UNIT: Record<string, string> = { KILOGRAM: ' / кг', METRE: ' / м', SKEIN: ' / моток' };
const PER_SHEET = 8; // #176–177: 8 per A4, 10 × 7 cm, black and white

// Screen preview → «Друкувати» (#237). Everything but the sheets is hidden when printing.
const PRINT_CSS = `
@page { size: A4; margin: 0; }
@media print {
  body > *:not(#vk-print) { display: none !important; }
  #vk-print .vk-overlay { position: static !important; overflow: visible !important; background: none !important; padding: 0 !important; }
  #vk-print .vk-a4 { margin: 0 !important; box-shadow: none !important; zoom: 1 !important; break-after: page; }
  #vk-print .vk-a4:last-child { break-after: auto; }
}`;

function PriceTags({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [error, setError] = useState(false);
  const zoom = Math.min(1, (window.innerWidth - 32) / 794);

  useEffect(() => {
    void (async () => {
      try {
        const { items } = await api<{ items: TagData[] }>(`/admin/stock/tags?ids=${encodeURIComponent(ids.join(','))}`);
        setTags(await Promise.all(items.map(async (t) => ({
          ...t, qr: t.slug ? await QRCode.toDataURL(`${window.location.origin}/uk/tovar/${t.slug}`, { margin: 0, width: 240, errorCorrectionLevel: 'M' }) : null,
        }))));
      } catch { setError(true); }
    })();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sheets = tags ? Array.from({ length: Math.ceil(tags.length / PER_SHEET) }, (_, i) => tags.slice(i * PER_SHEET, (i + 1) * PER_SHEET)) : [];
  return (
    <div className="vk-overlay fixed inset-0 z-[80] overflow-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Цінники">
      <style>{PRINT_CSS}</style>
      <div className="no-print sticky top-0 z-10 mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center gap-2 rounded-xl bg-bg-surface p-3 shadow-xl">
        <p className="flex-1 text-body text-text-primary">
          {error ? 'Не вдалося підготувати цінники. Закрийте й спробуйте ще раз.' : !tags ? 'Готуємо цінники…' : tags.length ? `Цінників: ${tags.length} · аркушів A4: ${sheets.length}. Розріжте по пунктиру.` : 'У вибраних товарів немає розмірів для цінника.'}
        </p>
        <button type="button" disabled={!tags?.length} onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white disabled:opacity-50"><Printer size={18} />Друкувати</button>
        <button type="button" onClick={onClose} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm text-text-primary"><X size={18} />Закрити</button>
      </div>
      {sheets.map((s, i) => (
        <div key={i} className="vk-a4 mx-auto mb-4 bg-white text-black shadow-xl" style={{ width: '210mm', height: '297mm', padding: '8.5mm 5mm', zoom, boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 100mm)', gridTemplateRows: 'repeat(4, 70mm)' }}>
            {s.map((t, j) => <TagCard key={`${t.sku}-${j}`} t={t} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TagCard({ t }: { t: Tag }) {
  return (
    <div style={{ outline: '0.25mm dashed #000', outlineOffset: '-0.125mm', padding: '5mm', display: 'flex', flexDirection: 'column', gap: '1.5mm', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif', color: '#000', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
        <img src="/admin/logo-96.webp" alt="" style={{ width: '9mm', height: '9mm', filter: 'grayscale(1)' }} />
        <span style={{ fontSize: '11pt', fontWeight: 700, letterSpacing: '0.02em' }}>Вівчарик</span>
      </div>
      <p style={{ margin: 0, fontSize: '12pt', fontWeight: 700, lineHeight: 1.2, maxHeight: '2.4em', overflow: 'hidden' }}>{t.name}</p>
      <div style={{ display: 'flex', flex: 1, gap: '3mm', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1mm', fontSize: '9pt', lineHeight: 1.3, minWidth: 0 }}>
          {t.size && <span>Розмір: {t.size}</span>}
          {t.color && <span>Колір: {t.color}</span>}
          {t.composition && <span>Склад: {t.composition}</span>}
          <span style={{ marginTop: 'auto', fontSize: '20pt', fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{uah(t.priceMinor)}<span style={{ fontSize: '10pt', fontWeight: 600 }}>{PER_UNIT[t.unit] ?? ''}</span></span>
          <span style={{ fontSize: '8pt', fontFamily: 'ui-monospace, monospace' }}>{t.sku}</span>
        </div>
        {t.qr && <img src={t.qr} alt="" style={{ width: '24mm', height: '24mm', alignSelf: 'flex-end' }} />}
      </div>
    </div>
  );
}

/**
 * Price tags for the given products (#92–94, #176–177): one tag per size/colour — name, price, size,
 * composition, SKU, a QR code to the product page, the logo. Opens a print preview over the page.
 * Needs the `products.read` permission. Call from anywhere: `openPriceTags(['id1', 'id2'])`.
 */
let closeOpen: (() => void) | null = null;
export function openPriceTags(productIds: string[]) {
  if (!productIds.length) return;
  closeOpen?.();
  const host = Object.assign(document.createElement('div'), { id: 'vk-print' });
  document.body.appendChild(host);
  const root = createRoot(host);
  const close = () => { root.unmount(); host.remove(); closeOpen = null; };
  closeOpen = close;
  root.render(<PriceTags ids={productIds} onClose={close} />);
}

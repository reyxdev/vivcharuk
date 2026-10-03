import type { ReactNode } from 'react';
import { useLocale } from '@/lib/i18n';

/**
 * Round 24 G062–G064, G099: the text of a category or collection comes from its description in the
 * panel. Plain text, paragraphs separated by an empty line:
 *   - the first paragraph is the two lines shown above the products;
 *   - a paragraph whose first line starts with «? » is a question, the lines under it its answer;
 *   - everything else is the longer text, folded under «Детальніше» below the products.
 * Nothing is shown until the field is filled; nothing is ever hidden from people but shown to robots.
 */
export interface CategoryText { lead: string | null; rest: string[]; faq: Array<{ q: string; a: string }> }

export function parseCategoryText(raw: string | null | undefined): CategoryText {
  const paras = (raw ?? '').replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const out: CategoryText = { lead: null, rest: [], faq: [] };
  for (const p of paras) {
    if (p.startsWith('?')) {
      const [q = '', ...a] = p.split('\n');
      const question = q.replace(/^\?\s*/, '').trim();
      if (question && a.length) out.faq.push({ q: question, a: a.join(' ').trim() });
    } else if (out.lead === null) out.lead = p;
    else out.rest.push(p);
  }
  return out;
}

const summary = 'flex cursor-pointer list-none items-center justify-between gap-4 py-4';
const plus = <span aria-hidden="true" className="text-h3 text-text-primary transition-transform group-open:rotate-45">+</span>;

/** A folded block whose visible title is a real heading (G072: headings stay headings when folded). */
export function Fold({ title, level = 2, children }: { title: string; level?: 2 | 3; children: ReactNode }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <details className="group border-b border-border-hairline">
      <summary className={summary}><H className={level === 2 ? 'text-h3 text-text-primary' : 'text-h4 text-text-primary'}>{title}</H>{plus}</summary>
      <div className="flex max-w-[72ch] flex-col gap-3 pb-5 text-body-lg text-text-body">{children}</div>
    </details>
  );
}

export function CategoryLead({ text }: { text: CategoryText }) {
  return text.lead ? <p className="max-w-[72ch] whitespace-pre-line text-body-lg text-text-body">{text.lead}</p> : null;
}

export interface SizeRow { key: string; label: string; widthCm: number | null; lengthCm: number | null }

/** Below the products: the longer text, the size table and the questions — each folded. */
// Round 24 G093: the frame in English; the text itself comes from the panel.
const COPY = {
  uk: { about: (n: string) => `Про розділ «${n}»`, more: 'Детальніше', sizes: 'Розміри', cm: 'см', dims: 'Ширина × довжина', called: 'Як називають', faq: 'Питання й відповіді',
    custom: 'Окремі вироби виготовляємо за вашими мірками — виготовлення 14 днів. Де це можна, на сторінці товару є кнопка «Свій розмір».' },
  en: { about: (n: string) => `About «${n}»`, more: 'More details', sizes: 'Sizes', cm: 'cm', dims: 'Width × length', called: 'Common name', faq: 'Questions and answers',
    custom: 'Some pieces we make to your measurements — making takes 14 days. Where this is possible, the product page has a «Custom size» button.' },
};

export function CategoryBelow({ name, text, sizes = [] }: { name: string; text: CategoryText; sizes?: SizeRow[] }) {
  const c = COPY[useLocale() === 'en' ? 'en' : 'uk'];
  if (!text.rest.length && !sizes.length && !text.faq.length) return null;
  // «Двоспальний · 200×220 см» → name «Двоспальний»; dimensions always from the numbers.
  const rows = sizes.map((s) => ({ key: s.key, dims: s.widthCm && s.lengthCm ? `${s.widthCm} × ${s.lengthCm} ${c.cm}` : s.label, name: s.label.includes('·') ? s.label.split('·')[0]!.trim() : '' }));
  const named = rows.some((r) => r.name);
  return (
    <section aria-label={c.about(name)} className="flex flex-col border-t border-border-hairline">
      {text.rest.length > 0 && (
        <Fold title={c.more}>{text.rest.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</Fold>
      )}
      {sizes.length > 0 && (
        <Fold title={c.sizes}>
          <table className="w-full max-w-md text-left text-body">
            <thead className="text-body-sm text-text-muted"><tr><th className="py-2 font-normal">{c.dims}</th>{named && <th className="py-2 font-normal">{c.called}</th>}</tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.key} className="border-t border-border-hairline">
                  <td className="py-2 text-text-primary">{s.dims}</td>
                  {named && <td className="py-2 text-text-body">{s.name}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-body text-text-body">{c.custom}</p>
        </Fold>
      )}
      {text.faq.length > 0 && (
        <div className="flex flex-col pt-6">
          <h2 className="text-h3 text-text-primary">{c.faq}</h2>
          {text.faq.map((f) => <Fold key={f.q} title={f.q} level={3}><p>{f.a}</p></Fold>)}
        </div>
      )}
    </section>
  );
}

import { z } from 'zod';

/**
 * An article body (22 §22.6): a constrained list of blocks — anything not here cannot be written.
 * Inline text allows **bold**, *italic* and [link](https://…) only. `figure` and `videoEmbed`
 * join when media storage exists.
 */
const text = z.string().max(4000);
export const postBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('keyFacts'), items: z.array(z.string().trim().min(1).max(300)).min(1).max(8) }),
  z.object({ type: z.literal('paragraph'), text }),
  z.object({ type: z.literal('heading'), level: z.union([z.literal(2), z.literal(3)]), text: z.string().max(200) }),
  z.object({ type: z.literal('bulletList'), items: z.array(z.string().max(1000)).min(1).max(30) }),
  z.object({ type: z.literal('orderedList'), items: z.array(z.string().max(1000)).min(1).max(30) }),
  z.object({ type: z.literal('blockquote'), text, attribution: z.string().max(120).nullable().default(null) }),
  z.object({ type: z.literal('callout'), variant: z.enum(['note', 'warning', 'tip']), text }),
  z.object({ type: z.literal('productEmbed'), productId: z.string() }),
  z.object({ type: z.literal('faq'), items: z.array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(2000) })).min(1).max(12) }),
  z.object({ type: z.literal('divider') }),
]);
export type PostBlock = z.infer<typeof postBlock>;
export const postBody = z.object({ blocks: z.array(postBlock).max(200) });
export type PostBody = z.infer<typeof postBody>;

const strip = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

/** `bodyPlain` (22 §22.6): all prose, captions and FAQ; never product embeds. Paragraph breaks kept. */
export function bodyPlain(body: PostBody) {
  return body.blocks.flatMap((b) => {
    switch (b.type) {
      case 'keyFacts': return b.items;
      case 'paragraph': case 'heading': case 'callout': return [b.text];
      case 'blockquote': return [b.text + (b.attribution ? ` — ${b.attribution}` : '')];
      case 'bulletList': case 'orderedList': return b.items;
      case 'faq': return b.items.flatMap((i) => [i.q, i.a]);
      default: return [];
    }
  }).map(strip).filter(Boolean).join('\n\n');
}

export const readMinutes = (plain: string) => Math.max(1, Math.round(plain.split(/\s+/).filter(Boolean).length / 180));

export interface PostLint { level: 'block' | 'warn'; message: string }

/** Save-time checks (22 §22.6, §22.8). `block` stops publishing; `warn` is shown to the writer. */
export function lintPost(body: PostBody, plain: string, embedStatus: (productId: string) => 'ACTIVE' | 'OTHER' | 'MISSING'): PostLint[] {
  const out: PostLint[] = [];
  const bl = body.blocks;
  if (bl[0]?.type !== 'keyFacts') out.push({ level: 'block', message: 'Перший блок має бути «Коротко» (ключові факти)' });
  const embeds = bl.map((b, i) => [b, i] as const).filter(([b]) => b.type === 'productEmbed');
  if (embeds.length > 3) out.push({ level: 'block', message: 'Не більше трьох товарів у статті' });
  if (embeds.some(([, i]) => i <= 1)) out.push({ level: 'block', message: 'Товар не може стояти на самому початку — спершу користь для читача' });
  if (embeds.some(([, i], n) => n > 0 && embeds[n - 1]![1] === i - 1)) out.push({ level: 'block', message: 'Два товари поспіль — розділіть їх текстом' });
  for (const [b] of embeds) {
    const st = embedStatus((b as { productId: string }).productId);
    if (st !== 'ACTIVE') out.push({ level: 'block', message: st === 'MISSING' ? 'Згаданого товару не існує' : 'Згаданий товар не на сайті (чернетка чи архів)' });
  }
  const words = plain.split(/\s+/).length;
  if (words > 600 && !bl.some((b) => b.type === 'heading' && b.level === 2)) out.push({ level: 'warn', message: 'Довга стаття без жодного підзаголовка' });
  const lower = plain.toLowerCase();
  const deny: Array<[RegExp, string]> = [
    [/сертифік/, '«сертифікат» — сертифікатів немає'], [/(^|\s)еко(\s|-|$)/, '«еко» як окреме твердження'], [/100\s?% натурал/, '«100% натуральний» без підтвердження'],
    [/засновано 19|з 199\d року/, 'дата заснування'], [/екскурсі|відкрито для відвідувачів|щодня о|записатись на огляд/, 'обіцянка доступу — лише «домовтеся телефоном»'],
    [/власн\S* отар|стрижемо|фарбуємо/, 'власна отара, стрижка чи фарбування не заявляються (раунд 9)'],
  ];
  for (const [re, why] of deny) if (re.test(lower)) out.push({ level: 'warn', message: `Перевірте: ${why}` });
  for (const m of lower.matchAll(/14 дн/g)) {
    const around = lower.slice(Math.max(0, m.index! - 120), m.index! + 120);
    if (!/відправ|доставк/.test(around)) { out.push({ level: 'warn', message: '«14 днів» без уточнення, що це до відправки' }); break; }
  }
  return out;
}

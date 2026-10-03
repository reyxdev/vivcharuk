import { BUSINESS, BUSINESS_EN, DEFAULT_VOLUME_TIERS, type CategoryNode, type Locale, type VolumeTier } from '@vivcharyk/schemas';
import type { Route } from './+types/root-files';
import { apiGet, apiGetCached } from '@/lib/api.server';
import { ENABLED_LOCALES } from '@/lib/locale';
import { path, type SegmentKey } from '@/lib/segments';

// Round 24 G011–G012, G151: files that live at the site root, outside the `/:locale` routes (RFC 8615 for
// /.well-known/). llms.txt is built from the real pages: no empty category, no journal without articles.

const origin = () => (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const text = (body: string, type = 'text/plain; charset=utf-8', maxAge = 3600) =>
  new Response(body, { headers: { 'content-type': type, 'cache-control': `public, max-age=${maxAge}` } });

interface SiteSettings { contact: { hoursText: string; phone: string; publicEmail: string } }

async function llms() {
  const o = origin();
  const l: Locale = 'uk';
  const englishOn = ENABLED_LOCALES.includes('en');
  const [cats, posts, settings, facts, catsEn] = await Promise.all([
    apiGet<{ items: CategoryNode[] }>('/categories', l).then((r) => r.data.items).catch(() => []),
    apiGet<{ items: unknown[] }>('/posts', l).then((r) => r.data.items.length).catch(() => 0),
    apiGetCached<SiteSettings>('/site/settings', l).catch(() => null),
    apiGet<{ volumeTiers: VolumeTier[] }>('/site/facts', l).then((r) => r.data.volumeTiers).catch(() => DEFAULT_VOLUME_TIERS),
    englishOn ? apiGet<{ items: CategoryNode[] }>('/categories', 'en').then((r) => r.data.items).catch(() => []) : Promise.resolve([] as CategoryNode[]),
  ]);
  const c = settings?.contact;
  const link = (name: string, p: string, note?: string) => `- [${name}](${o}${p})${note ? `: ${note}` : ''}`;
  const live = (n: CategoryNode) => (n.productCount ?? 0) > 0;
  const catalog = cats.filter(live).flatMap((n) => [
    link(n.name, path.category(l, n.slug)),
    ...n.children.filter(live).map((ch) => link(ch.name, path.category(l, n.slug, ch.slug))),
  ]);
  const page = (k: SegmentKey, name: string, note?: string) => link(name, path.seg(l, k), note);
  const tiers = facts.map((t) => `від ${t.minUnits} шт. −${t.percent} %`).join(', ');
  // G093: the English pages that exist, each with a one-line summary.
  const en: Locale = 'en';
  const tiersEn = facts.map((t) => `−${t.percent}% from ${t.minUnits} pcs`).join(', ');
  const pageEn = (k: SegmentKey, name: string, note: string) => link(name, path.seg(en, k), note);
  const english = !englishOn ? [] : [
    '',
    '## English',
    '',
    `${BUSINESS_EN.tagline} Hutsul lizhnyks, rugs and other sheep’s wool goods, made in ${BUSINESS_EN.locality}. A family business of Ivan Hondurak, in the craft since 1972, named Vivcharyk since the early 1990s. Delivery within Ukraine only.`,
    '',
    link('Home', path.home(en), 'lizhnyks, rugs and wool goods from our workshop'),
    ...catsEn.filter(live).map((n) => link(n.name, path.category(en, n.slug), 'catalogue')),
    pageEn('about', 'About us', 'our story since 1972, the workshop and shop in Yavoriv, the facts in brief'),
    pageEn('production', 'How we make it', 'every stage, from raw wool to the finished piece'),
    pageEn('contacts', 'Contacts', 'address, opening hours, how to get here'),
    pageEn('wholesale', 'Wholesale', `${tiersEn} of one product`),
    pageEn('delivery', 'Delivery and payment', 'Nova Poshta, Ukrposhta or pickup in Yavoriv; no international delivery'),
    pageEn('returns', 'Returns', 'how to return or exchange an item'),
    pageEn('faq', 'FAQ', 'questions and answers'),
    pageEn('care', 'Wool care', 'how to look after wool goods'),
    link('Glossary', `/${en}/slovnyk`, 'lizhnyk, hunia, felting and other craft words'),
  ];
  return [
    `# ${BUSINESS.brand}`,
    '',
    `> ${BUSINESS.tagline} Ліжники, килими та інші вироби з овечої вовни від виробника з ${BUSINESS.locality}, Івано-Франківська обл.`,
    '',
    'Сімейна справа Івана Федоровича Гондурака: у ремеслі з 1972 року, назва «Вівчарик» — з початку 1990-х; чесальні машини, пряжа й основа для ліжників, ровниця для прядильниць села. ' +
      'Самі робимо вичинку шкур, миття, чесання, прядіння, ткання, валяння й пошиття: від сирої вовни до готового виробу. ' +
      `Доставка по Україні. Оптом ${tiers} на кожен товар. ` +
      [c?.hoursText ?? BUSINESS.hoursText, c ? `Телефон ${c.phone}, пошта ${c.publicEmail}.` : `Пошта ${BUSINESS.publicEmail}.`].join(' '),
    '',
    '## Каталог',
    '',
    ...catalog,
    '',
    '## Про нас',
    '',
    link('Головна', path.home(l)),
    page('about', 'Про нас', 'наша історія з 1972 року, майстерня й магазин у Яворові'),
    page('production', 'Виробництво', 'як ми робимо вироби, етап за етапом'),
    page('contacts', 'Контакти', 'адреса, години, як доїхати'),
    ...(posts ? [page('journal', 'Журнал')] : []),
    '',
    '## Покупцям',
    '',
    page('delivery', 'Доставка і оплата'),
    page('returns', 'Повернення'),
    page('wholesale', 'Опт', tiers),
    page('faq', 'Питання й відповіді'),
    page('care', 'Догляд за вовною'),
    link('Словник', `/${l}/slovnyk`, 'ліжник, гуня, валяння та інші слова ремесла'),
    ...english,
    '',
    '## Optional',
    '',
    link('Карта сайту', '/sitemap.xml'),
    '',
  ].join('\n');
}

/** RFC 9116. Contact: the developer's address set on the server (SECURITY_CONTACT), else the shop mailbox. */
function securityTxt() {
  const raw = (process.env.SECURITY_CONTACT ?? '').trim();
  const contact = !raw ? `mailto:${BUSINESS.publicEmail}` : /^(mailto:|https:\/\/|tel:)/.test(raw) ? raw : raw.includes('@') ? `mailto:${raw}` : raw;
  const expires = new Date(Date.now() + 365 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return [`Contact: ${contact}`, `Expires: ${expires}`, 'Preferred-Languages: uk, en', `Canonical: ${origin()}/.well-known/security.txt`, ''].join('\n');
}

function manifest() {
  return JSON.stringify({
    name: BUSINESS.brand,
    short_name: BUSINESS.brand,
    description: BUSINESS.tagline,
    lang: 'uk',
    start_url: '/uk/',
    scope: '/',
    display: 'browser',
    background_color: '#F4D9B8',
    theme_color: '#F4D9B8',
    icons: [
      { src: '/brand/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { src: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/brand/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }, null, 2);
}

const humans = () => [
  '/* TEAM */',
  `Виробник: ${BUSINESS.brand}, ${BUSINESS.locality}`,
  `Пошта: ${BUSINESS.publicEmail}`,
  '',
  '/* SITE */',
  ENABLED_LOCALES.includes('en') ? 'Мова: українська, англійська' : 'Мова: українська',
  'Зроблено на: React Router, Fastify, PostgreSQL',
  '',
].join('\n');

export async function loader({ request }: Route.LoaderArgs) {
  switch (new URL(request.url).pathname) {
    case '/llms.txt': return text(await llms(), 'text/markdown; charset=utf-8');
    case '/.well-known/security.txt': return text(securityTxt(), 'text/plain; charset=utf-8', 86_400);
    case '/manifest.webmanifest': return text(manifest(), 'application/manifest+json; charset=utf-8', 86_400);
    case '/humans.txt': return text(humans(), 'text/plain; charset=utf-8', 86_400);
  }
  throw new Response('Not Found', { status: 404 });
}

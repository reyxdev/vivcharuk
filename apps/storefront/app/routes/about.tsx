import { Link, useLoaderData } from 'react-router';
import type { Locale, ProductListResponse, VolumeTier } from '@vivcharyk/schemas';
import { BUSINESS, BUSINESS_EN } from '@vivcharyk/schemas';
import type { Route } from './+types/about';
import { apiGet } from '@/lib/api.server';
import { useBusiness } from '@/lib/business';
import { path } from '@/lib/segments';
import { localeOf, originOf, pageMeta, pct, priceRangeText, titled } from '@/lib/seo';
import { t as tr } from '@/lib/i18n';
import { Fold } from '@/features/catalog/components/CategoryText';
import { History } from '@/features/about/History';

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const [facts, range] = await Promise.all([
    apiGet<{ volumeTiers: VolumeTier[]; cardPayments: boolean }>('/site/facts', locale).then((r) => r.data).catch(() => null),
    apiGet<ProductListResponse>('/products', locale, { perPage: '1' }).then((r) => r.data.priceRange).catch(() => null),
  ]);
  const prices = range ? priceRangeText(range.minMinor, range.maxMinor, locale === 'en' ? 'en' : 'uk') : null;
  return { locale, facts, prices, seo: prices ? { priceRange: prices } : {} };
}

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    return pageMeta({
      title: titled('About us: a lizhnyk workshop in Yavoriv', locale),
      description: `Our workshop and shop are in ${BUSINESS_EN.locality}, known as the capital of lizhnyk weaving. Call ahead to visit.`,
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: titled('Про нас: майстерня ліжників у Яворові'),
    description: `${BUSINESS.tagline} Цех і магазин у с. Яворів, Косівський р-н — селі, яке називають столицею ліжникарства.`,
    origin: originOf(matches),
  });
}

const STAGES = 'вичинка шкур, миття, чесання, прядіння, ткання, валяння, пошиття';

/**
 * Round 24 G153–G154: the short facts block an assistant can quote whole. Only recorded facts:
 * address and hours, the seven stages, prices from the catalogue, delivery and payment that are live,
 * wholesale tiers, made to measure, and the honest «no certificates».
 */
function Facts({ locale, prices, facts }: { locale: Locale; prices: string | null; facts: { volumeTiers: VolumeTier[]; cardPayments: boolean } | null }) {
  const biz = useBusiness();
  if (locale === 'en') return <FactsEn locale={locale} prices={prices} facts={facts} />;
  const tiers = [...(facts?.volumeTiers ?? [])].sort((a, b) => a.minUnits - b.minUnits).map((t) => `від ${t.minUnits} шт. одного товару — ${pct(t.percent, true)}`).join(', ');
  const rows: Array<[string, string]> = [
    ['З якого часу', 'Ремеслом займаємося з 1972 року; назва «Вівчарик» — від початку 1990-х.'],
    ['Де', `${biz.factoryAddress}. Магазин і майстерня в одному місці.`],
    ['Коли', biz.hoursText],
    ['Що робимо самі', `${STAGES[0]!.toUpperCase()}${STAGES.slice(1)} — від сирої вовни до готового виробу.`],
    ...(prices ? [['Ціни', `${prices[0]!.toUpperCase()}${prices.slice(1)}.`] as [string, string]] : []),
    ['Доставка', 'Новою поштою й Укрпоштою по Україні або самовивіз у Яворові. Відправляємо за 2–4 дні.'],
    ['Оплата', facts?.cardPayments ? 'Карткою онлайн, накладеним платежем з оглядом, передоплатою або на рахунок IBAN.' : 'На рахунок IBAN; оплата карткою з’явиться найближчим часом.'],
    ...(tiers ? [['Опт', `${tiers[0]!.toUpperCase()}${tiers.slice(1)}.`] as [string, string]] : []),
    ['На замовлення', 'Окремі вироби виготовляємо за вашими мірками — 14 днів.'],
    ['Сертифікати', 'Сертифікатів не маємо — кажемо чесно. Натомість до нас можна приїхати й подивитися, як усе робиться.'],
  ];
  return (
    <section aria-labelledby="facts" className="py-(--section-y-sm)">
      <div className="mx-auto flex max-w-(--container-narrow) flex-col gap-5 px-4">
        <h2 id="facts" className="text-h2 text-text-primary">Коротко про Вівчарика</h2>
        <dl className="grid gap-x-6 gap-y-3 text-body-lg sm:grid-cols-[auto_1fr]">
          {rows.map(([k, v]) => <div key={k} className="contents"><dt className="font-semibold text-text-primary">{k}</dt><dd className="text-text-body">{v}</dd></div>)}
        </dl>
        {/* G065: what a ліжник is, folded — only what the workshop itself states about it. */}
        <div className="border-t border-border-hairline">
          <Fold title="Що таке ліжник">
            <p>Ліжник — гуцульське вовняне покривало з густим пухнастим ворсом. Його роблять з овечої вовни, і шлях у нього довгий. Сиру вовну перуть, щоб вода забрала бруд і жир. Суху вовну чешуть на машині: сплутане руно розходиться на паралельні волокна й виходить безперервною стрічкою — рівницею. З рівниці прядуть нитку потрібної товщини, а з нитки на ткацькому верстаті тчуть полотно.</p>
            <p>Головне відбувається далі: виткане полотно валяють. Вовна ущільнюється, а ворс піднімається — так ліжник стає густим і пухнастим. Наостанок обробляють краї.</p>
            <p>Село Яворів у Косівському районі називають столицею ліжникарства: тут ліжники ткуть і сьогодні. У нашій майстерні в Яворові ліжник проходить увесь цей шлях — від миття вовни до готового виробу.</p>
            <p><Link to={`/${locale}/slovnyk`} className="text-text-primary underline">Словник: ліжник, коц, гуня, чуні та інші слова</Link></p>
          </Fold>
        </div>
      </div>
    </section>
  );
}

const cap = (s: string) => `${s[0]!.toUpperCase()}${s.slice(1)}`;

/** The English facts block: the same rows, the same facts (G093). */
function FactsEn({ locale, prices, facts }: { locale: Locale; prices: string | null; facts: { volumeTiers: VolumeTier[]; cardPayments: boolean } | null }) {
  const biz = useBusiness();
  const tiers = [...(facts?.volumeTiers ?? [])].sort((a, b) => a.minUnits - b.minUnits).map((t) => `${pct(t.percent, true, locale)} from ${t.minUnits} pieces of one product`).join(', ');
  const rows: Array<[string, string]> = [
    ['Since', 'In the craft since 1972; named “Vivcharyk” since the early 1990s.'],
    ['Where', `${biz.factoryAddress}. The shop and the workshop are in one place.`],
    ['When', biz.hoursText],
    ['What we do ourselves', 'Tanning of hides, washing, carding, spinning, weaving, felting and sewing: from raw wool to the finished piece.'],
    ...(prices ? [['Prices', `${cap(prices)}.`] as [string, string]] : []),
    ['Delivery', 'Across Ukraine by Nova Poshta and Ukrposhta, or pick up in Yavoriv. We send orders out within 2–4 days. International delivery is not available.'],
    ['Payment', facts?.cardPayments ? 'By card online, cash on delivery with inspection at the post office, prepayment, or bank transfer to our IBAN.' : 'By bank transfer to our IBAN; card payment is coming soon.'],
    ...(tiers ? [['Wholesale', `${cap(tiers)}.`] as [string, string]] : []),
    ['Made to measure', 'Some pieces we make to your measurements, in 14 days.'],
    ['Certificates', 'We have no certificates, and we say so honestly. Instead, you are welcome to come and see how everything is made.'],
  ];
  return (
    <section aria-labelledby="facts" className="py-(--section-y-sm)">
      <div className="mx-auto flex max-w-(--container-narrow) flex-col gap-5 px-4">
        <h2 id="facts" className="text-h2 text-text-primary">{biz.brand} in brief</h2>
        <dl className="grid gap-x-6 gap-y-3 text-body-lg sm:grid-cols-[auto_1fr]">
          {rows.map(([k, v]) => <div key={k} className="contents"><dt className="font-semibold text-text-primary">{k}</dt><dd className="text-text-body">{v}</dd></div>)}
        </dl>
        <div className="border-t border-border-hairline">
          <Fold title="What is a lizhnyk">
            <p>A lizhnyk (ліжник) is a Hutsul wool blanket with a fluffy felted pile. It is made from sheep’s wool, and its path is a long one. The raw wool is washed so the water takes away the dirt and grease. The dry wool is carded on a machine: the tangled fleece separates into parallel fibres and comes out as one continuous strip, wool roving. Yarn of the right thickness is spun from the roving, and the cloth is woven from the yarn on a loom.</p>
            <p>The main step comes next: the woven cloth is felted. The wool becomes denser and the pile rises, and that is how a lizhnyk becomes thick and fluffy. Finally, the edges are finished.</p>
            <p>Yavoriv village in Kosiv district is called the capital of lizhnyk weaving: lizhnyks are still woven here today. In our workshop in Yavoriv a lizhnyk goes through this whole path, from washing the wool to the finished piece.</p>
            <p><Link to={`/${locale}/slovnyk`} className="text-text-primary underline">Glossary: lizhnyk, kots, hunia, chuni and other words</Link></p>
          </Fold>
        </div>
      </div>
    </section>
  );
}

/**
 * Orientation diagram, not a map (21 §21.6): two places, real text labels, no tiles, no cookies.
 * Positions are schematic; the caption carries everything the drawing says.
 */
const MAP_TEXT = {
  uk: { label: 'Схема: Яворів і Косів у Косівському районі Івано-Франківської області', kosiv: 'Косів', yavoriv: 'Яворів', capital: 'столиця ліжникарства', district: 'КОСІВСЬКИЙ РАЙОН', region: 'ІВАНО-ФРАНКІВСЬКА ОБЛАСТЬ', caption: 'Яворів лежить у Косівському районі Івано-Франківської області, неподалік Косова. Село називають столицею ліжникарства.' },
  en: { label: 'Diagram: Yavoriv and Kosiv in Kosiv district, Ivano-Frankivsk region', kosiv: 'Kosiv', yavoriv: 'Yavoriv', capital: 'capital of lizhnyk weaving', district: 'KOSIV DISTRICT', region: 'IVANO-FRANKIVSK REGION', caption: 'Yavoriv lies in Kosiv district, Ivano-Frankivsk region, not far from the town of Kosiv. The village is called the capital of lizhnyk weaving.' },
};

function PlaceMap({ locale }: { locale: Locale }) {
  const m = MAP_TEXT[locale === 'en' ? 'en' : 'uk'];
  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox="0 0 480 360" role="img" aria-label={m.label} className="w-full rounded-md bg-bg-alt">
        <path d="M0 250 L60 190 L110 225 L175 150 L235 205 L300 130 L360 190 L420 150 L480 200 L480 360 L0 360 Z" fill="var(--color-meadow-trava, #4E9A6A)" opacity="0.35" />
        <path d="M0 290 L80 240 L150 270 L230 215 L310 262 L390 225 L480 260 L480 360 L0 360 Z" fill="var(--color-meadow-trava, #4E9A6A)" opacity="0.55" />
        <g fontFamily="inherit">
          <circle cx="330" cy="120" r="7" fill="none" stroke="var(--color-text-primary)" strokeWidth="3" />
          <circle cx="330" cy="120" r="2.5" fill="var(--color-text-primary)" />
          <text x="345" y="126" fontSize="18" fill="var(--color-text-primary)">{m.kosiv}</text>
          <circle cx="170" cy="200" r="10" fill="var(--color-text-primary)" />
          <text x="188" y="200" fontSize="24" fontWeight="700" fill="var(--color-text-primary)">{m.yavoriv}</text>
          <text x="188" y="224" fontSize="15" fill="var(--color-text-primary)">{m.capital}</text>
          <text x="20" y="34" fontSize="13" letterSpacing="1.2" fill="var(--color-text-primary)" opacity="0.75">{m.district}</text>
          <text x="20" y="54" fontSize="13" letterSpacing="1.2" fill="var(--color-text-primary)" opacity="0.75">{m.region}</text>
        </g>
      </svg>
      <figcaption className="text-body-sm text-text-muted">{m.caption}</figcaption>
    </figure>
  );
}

// 21 §21.8: a claim, the evidence that makes it checkable, and where the evidence lives.
// Only claims with evidence; round 9 §F1 limits the production claim to the stages the client names.
const claims = (hoursText: string): Array<{ claim: string; evidence: string; link: { seg: 'production' | 'contacts' | null; label: string } }> => [
  { claim: 'Ми робимо самі — від сирої вовни до готового виробу, від сирої шкури до овчини.', evidence: 'Миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — кожен етап показано окремо.', link: { seg: 'production', label: 'Як ми виробляємо' } },
  { claim: 'Ми не перепродаємо чуже як своє.', evidence: 'Кожен товар підписаний: «Власне виробництво» або «Від партнерів». У каталозі за цим можна відфільтрувати.', link: { seg: null, label: '' } },
  { claim: 'Ми не ховаємо склад.', evidence: 'Склад у відсотках — на сторінці кожного товару, у таблиці характеристик.', link: { seg: null, label: '' } },
  { claim: 'Ми не вигадуємо історію — до нас можна приїхати.', evidence: `Магазин і виробництво — в одному місці, в Яворові. ${hoursText}`, link: { seg: 'contacts', label: 'Контакти' } },
  { claim: 'Ми не обіцяємо того, чого не маємо.', evidence: 'Сертифікатів у нас немає, і ми про них не пишемо. Маємо цех, куди можна приїхати.', link: { seg: null, label: '' } },
];

const claimsEn = (hoursText: string): ReturnType<typeof claims> => [
  { claim: 'We make it ourselves: from raw wool to the finished piece, from raw hide to sheepskin.', evidence: 'Washing, carding, spinning, weaving, felting, sewing and tanning of hides: each stage is shown separately.', link: { seg: 'production', label: 'How we make it' } },
  { claim: 'We do not pass off other people’s goods as our own.', evidence: `Every product is labelled “${tr('en', 'product.own')}” or “${tr('en', 'product.partner')}”, and you can filter the catalogue by it.`, link: { seg: null, label: '' } },
  { claim: 'We do not hide what things are made of.', evidence: 'The wool content in percent is on every product page, in the specifications table.', link: { seg: null, label: '' } },
  { claim: 'We do not make up a history: you can come and see us.', evidence: `The shop and the workshop are in one place, in Yavoriv. ${hoursText}`, link: { seg: 'contacts', label: 'Contacts' } },
  { claim: 'We do not promise what we do not have.', evidence: 'We have no certificates, and we do not write about any. What we do have is a workshop you can visit.', link: { seg: null, label: '' } },
];

export default function About() {
  const biz = useBusiness();
  const { locale, facts, prices } = useLoaderData<typeof loader>();
  const l = locale as Locale;
  if (l === 'en') return (
    <>
      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <span className="text-overline uppercase opacity-80">{biz.locality}</span>
          <h1 className="max-w-[20ch] text-display-lg">{biz.tagline}</h1>
          <p className="max-w-[48ch] text-body-lg opacity-90">The names have changed. The hands, the machines and the village are the same.</p>
        </div>
      </section>

      <History locale={l} />

      <Facts locale={l} prices={prices} facts={facts} />

      <section aria-labelledby="place" className="bg-bg-alt py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) items-center gap-10 px-4 md:grid-cols-2 lg:px-12">
          <PlaceMap locale={l} />
          <div className="flex max-w-[66ch] flex-col gap-4 text-body-lg text-text-body">
            <h2 id="place" className="text-h1 text-text-primary">Yavoriv</h2>
            <p>Our workshop is in Yavoriv village, Kosiv district, Ivano-Frankivsk region. Yavoriv is called the capital of lizhnyk weaving: Hutsul lizhnyks are woven here, and the village has a Museum of Lizhnyk Weaving.</p>
            <p>Every year Yavoriv hosts lizhnyk-weaving plein-airs, attended by art historians from Kyiv, Lviv and Ivano-Frankivsk. The craft is alive here: it is studied, not staged for tourists.</p>
            <p>Hutsul lizhnyk weaving is included in the National List of Elements of the Intangible Cultural Heritage of Ukraine.</p>
            <p>Yavoriv is also the home village of the Shkribliak and Korpaniuk families of woodcarvers.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values" className="py-(--section-y-md)">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 lg:px-12">
          <h2 id="values" className="text-h1 text-text-primary">What we stand by</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {claimsEn(biz.hoursText).map((c) => (
              <li key={c.claim} className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-6">
                <p className="text-h4 text-text-primary">“{c.claim}”</p>
                <p className="text-body text-text-body">{c.evidence}</p>
                {c.link.seg && <Link to={path.seg(l, c.link.seg)} className="self-start text-body text-text-primary underline">{c.link.label} <span className="vk-arrow" aria-hidden="true">→</span></Link>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <h2 className="max-w-[22ch] text-h1">Come and visit: the shop and the workshop in one place</h2>
          <p className="max-w-[56ch] text-body-lg opacity-90">You can look round the workshop together with the owner. Call ahead to arrange a time.</p>
          <div className="flex flex-wrap gap-3">
            <Link to={path.seg(l, 'contacts')} className="rounded-lg bg-bg-page px-6 py-3.5 text-body-lg font-semibold text-text-primary">Contacts and directions</Link>
            <Link to={path.seg(l, 'production')} className="rounded-lg border-2 border-text-on-inverted px-6 py-3 text-body-lg font-semibold">How we make it</Link>
          </div>
        </div>
      </section>
    </>
  );
  return (
    <>
      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <span className="text-overline uppercase opacity-80">{BUSINESS.locality}</span>
          {/* Approved copy, exact (D1; «у Яворові» declined — F6). No badge, no seal, no counter. */}
          <h1 className="max-w-[20ch] text-display-lg">{BUSINESS.tagline}</h1>
          <p className="max-w-[48ch] text-body-lg opacity-90">Змінювалися назви. Руки, машини й село — ті самі.</p>
        </div>
      </section>

      <History locale={l} />

      <Facts locale={l} prices={prices} facts={facts} />

      <section aria-labelledby="place" className="bg-bg-alt py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) items-center gap-10 px-4 md:grid-cols-2 lg:px-12">
          <PlaceMap locale={l} />
          <div className="flex max-w-[66ch] flex-col gap-4 text-body-lg text-text-body">
            <h2 id="place" className="text-h1 text-text-primary">Яворів</h2>
            <p>Наш цех — у селі Яворів Косівського району на Івано-Франківщині. Яворів називають столицею ліжникарства: тут ткуть гуцульські ліжники, і тут є Музей ліжникарства.</p>
            <p>Щороку в Яворові проходять пленери з ліжникарства — на них приїздять мистецтвознавці з Києва, Львова та Івано-Франківська. Ремесло тут живе, його вивчають, а не відтворюють для туристів.</p>
            <p>Гуцульське ліжникарство — ремесло, внесене до Національного переліку елементів нематеріальної культурної спадщини України.</p>
            <p>Яворів — також рідне село різьбярських родин Шкрібляків і Корпанюків.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values" className="py-(--section-y-md)">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 lg:px-12">
          <h2 id="values" className="text-h1 text-text-primary">Чого ми тримаємося</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {claims(biz.hoursText).map((c) => (
              <li key={c.claim} className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-6">
                <p className="text-h4 text-text-primary">«{c.claim}»</p>
                <p className="text-body text-text-body">{c.evidence}</p>
                {c.link.seg && <Link to={path.seg(l, c.link.seg)} className="self-start text-body text-text-primary underline">{c.link.label} <span className="vk-arrow" aria-hidden="true">→</span></Link>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <h2 className="max-w-[22ch] text-h1">Приїздіть: магазин і виробництво в одному місці</h2>
          <p className="max-w-[56ch] text-body-lg opacity-90">Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.</p>
          <div className="flex flex-wrap gap-3">
            <Link to={path.seg(l, 'contacts')} className="rounded-lg bg-bg-page px-6 py-3.5 text-body-lg font-semibold text-text-primary">Контакти й маршрут</Link>
            <Link to={path.seg(l, 'production')} className="rounded-lg border-2 border-text-on-inverted px-6 py-3 text-body-lg font-semibold">Як ми виробляємо</Link>
          </div>
        </div>
      </section>
    </>
  );
}

import { Link, useParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';

export function meta() {
  const title = `Про нас — ${BUSINESS.brand}`;
  return [
    { title },
    { name: 'description', content: `${BUSINESS.tagline} Цех і магазин у ${BUSINESS.locality} — селі, яке називають столицею ліжникарства.` },
    { property: 'og:title', content: title },
  ];
}

/**
 * Orientation diagram, not a map (21 §21.6): two places, real text labels, no tiles, no cookies.
 * Positions are schematic; the caption carries everything the drawing says.
 */
function PlaceMap() {
  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox="0 0 480 360" role="img" aria-label="Схема: Яворів і Косів у Косівському районі Івано-Франківської області" className="w-full rounded-md bg-bg-alt">
        <path d="M0 250 L60 190 L110 225 L175 150 L235 205 L300 130 L360 190 L420 150 L480 200 L480 360 L0 360 Z" fill="var(--color-meadow-trava, #4E9A6A)" opacity="0.35" />
        <path d="M0 290 L80 240 L150 270 L230 215 L310 262 L390 225 L480 260 L480 360 L0 360 Z" fill="var(--color-meadow-trava, #4E9A6A)" opacity="0.55" />
        <g fontFamily="inherit">
          <circle cx="330" cy="120" r="7" fill="none" stroke="var(--color-text-primary)" strokeWidth="3" />
          <circle cx="330" cy="120" r="2.5" fill="var(--color-text-primary)" />
          <text x="345" y="126" fontSize="18" fill="var(--color-text-primary)">Косів</text>
          <circle cx="170" cy="200" r="10" fill="var(--color-text-primary)" />
          <text x="188" y="200" fontSize="24" fontWeight="700" fill="var(--color-text-primary)">Яворів</text>
          <text x="188" y="224" fontSize="15" fill="var(--color-text-primary)">столиця ліжникарства</text>
          <text x="20" y="34" fontSize="13" letterSpacing="1.2" fill="var(--color-text-primary)" opacity="0.75">КОСІВСЬКИЙ РАЙОН</text>
          <text x="20" y="54" fontSize="13" letterSpacing="1.2" fill="var(--color-text-primary)" opacity="0.75">ІВАНО-ФРАНКІВСЬКА ОБЛАСТЬ</text>
        </g>
      </svg>
      <figcaption className="text-body-sm text-text-muted">Яворів лежить у Косівському районі Івано-Франківської області, неподалік Косова. Село називають столицею ліжникарства.</figcaption>
    </figure>
  );
}

// 21 §21.8: a claim, the evidence that makes it checkable, and where the evidence lives.
// Only claims with evidence; round 9 §F1 limits the production claim to the stages the client names.
const CLAIMS: Array<{ claim: string; evidence: string; link: { seg: 'production' | 'contacts' | null; label: string } }> = [
  { claim: 'Ми робимо самі — від сирої вовни до готового виробу, від сирої шкури до овчини.', evidence: 'Миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — кожен етап показано окремо.', link: { seg: 'production', label: 'Як ми виробляємо' } },
  { claim: 'Ми не перепродаємо чуже як своє.', evidence: 'Кожен товар підписаний: «Власне виробництво» або «Від партнерів». У каталозі за цим можна відфільтрувати.', link: { seg: null, label: '' } },
  { claim: 'Ми не ховаємо склад.', evidence: 'Склад у відсотках — на сторінці кожного товару, у таблиці характеристик.', link: { seg: null, label: '' } },
  { claim: 'Ми не вигадуємо історію — до нас можна приїхати.', evidence: `Магазин і виробництво — в одному місці, в Яворові. ${BUSINESS.hoursText}`, link: { seg: 'contacts', label: 'Контакти' } },
  { claim: 'Ми не обіцяємо того, чого не маємо.', evidence: 'Сертифікатів у нас немає, і ми про них не пишемо. Маємо цех, куди можна приїхати.', link: { seg: null, label: '' } },
];

export default function About() {
  const { locale = 'uk' } = useParams();
  const l = locale as Locale;
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

      <section aria-labelledby="place" className="py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) items-center gap-10 px-4 md:grid-cols-2 lg:px-12">
          <PlaceMap />
          <div className="flex max-w-[66ch] flex-col gap-4 text-body-lg text-text-body">
            <h2 id="place" className="text-h1 text-text-primary">Яворів</h2>
            <p>Наш цех — у селі Яворів Косівського району на Івано-Франківщині. Яворів називають столицею ліжникарства: тут ткуть гуцульські ліжники, і тут є Музей ліжникарства.</p>
            <p>Щороку в Яворові проходять пленери з ліжникарства — на них приїздять мистецтвознавці з Києва, Львова та Івано-Франківська. Ремесло тут живе, його вивчають, а не відтворюють для туристів.</p>
            <p>Гуцульське ліжникарство — ремесло, внесене до Національного переліку елементів нематеріальної культурної спадщини України.</p>
            <p>Яворів — також рідне село різьбярських родин Шкрібляків і Корпанюків.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values" className="bg-bg-alt py-(--section-y-md)">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 lg:px-12">
          <h2 id="values" className="text-h1 text-text-primary">Чого ми тримаємося</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {CLAIMS.map((c) => (
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

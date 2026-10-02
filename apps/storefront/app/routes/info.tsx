import type { ReactNode } from 'react';
import { Link, useLoaderData, useMatches } from 'react-router';
import type { LiveBusiness, Locale, VolumeTier } from '@vivcharyk/schemas';
import { BUSINESS, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/info';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { CookieSettings } from '@/features/consent/CookieSettings';

type Key = 'delivery' | 'returns' | 'faq' | 'care' | 'terms' | 'privacy' | 'cookies';
interface Facts { volumeTiers: VolumeTier[]; cardPayments: boolean }

// The page key travels in the route id: `info_<key>-<segment>` (app/routes.ts).
const keyOf = (id: string) => id.slice(5, id.indexOf('-')) as Key;

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const { data } = await apiGet<Facts>('/site/facts', locale);
  return { locale, facts: data };
}

const TITLES: Record<Key, string> = {
  delivery: 'Доставка і оплата', returns: 'Повернення та обмін', faq: 'Питання й відповіді', care: 'Догляд за виробами',
  terms: 'Договір публічної оферти', privacy: 'Політика конфіденційності', cookies: 'Файли cookie',
};

export function meta({ matches }: Route.MetaArgs) {
  const k = keyOf(matches.at(-1)?.id ?? '');
  return [{ title: `${TITLES[k] ?? ''} — ${BUSINESS.brand}` }];
}

const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-4 text-h3 text-text-primary">{children}</h2>;
const P = ({ children }: { children: ReactNode }) => <p className="text-body-lg text-text-body">{children}</p>;
const UL = ({ items }: { items: ReactNode[] }) => <ul className="flex list-disc flex-col gap-2 pl-6 text-body-lg text-text-body">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;

function Seller() {
  const biz = useBusiness();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-md border border-border-hairline bg-bg-surface p-4 text-body">
      <dt className="text-text-muted">Продавець</dt><dd>{BUSINESS.legalEntityName}</dd>
      <dt className="text-text-muted">РНОКПП</dt><dd>{BUSINESS.legalId}</dd>
      <dt className="text-text-muted">Адреса</dt><dd>{isPlaceholder(BUSINESS.factoryAddress) ? `${BUSINESS.locality} ${BUSINESS.factoryAddress}` : BUSINESS.factoryAddress}</dd>
      <dt className="text-text-muted">Email</dt><dd>{biz.publicEmail}</dd>
    </dl>
  );
}

function LegalStub() {
  return <p className="rounded-md border-2 border-dashed border-border-control bg-bg-alt p-4 text-body text-text-muted">Повний текст готує юрист — заглушка. Він з'явиться тут до запуску сайту.</p>;
}

function Delivery({ f, l }: { f: Facts; l: Locale }) {
  const biz = useBusiness();
  return (
    <>
      <H2>Доставка</H2>
      <P>Доставляємо по Україні. Доставку оплачує покупець за тарифом перевізника — точну суму видно під час оформлення, до оплати.</P>
      <UL items={[
        'Нова пошта — у відділення або поштомат (якщо посилка в нього поміститься), чи кур’єром за адресою.',
        'Укрпошта — у відділення.',
        <>Самовивіз у Яворові, з магазину при цеху. {biz.hoursText} <Link to={path.seg(l, 'contacts')} className="underline">Контакти</Link>.</>,
      ]} />
      <P>Вироби «свого розміру» та позиції з позначкою «Виготовимо під замовлення» спершу виготовляємо — це 14 днів, — а потім відправляємо.</P>
      <P>За кордон поки не доставляємо.</P>

      <H2>Оплата</H2>
      <UL items={[
        ...(f.cardPayments ? [
          'Карткою онлайн — Visa, Mastercard, Apple Pay, Google Pay. Фіскальний чек з’явиться на сторінці замовлення.',
          'Накладений платіж з оглядом — онлайн сплачуєте лише доставку в обидва боки, а товар — на пошті, після огляду. Якщо товар забираєте, вартість зворотної доставки зараховуємо в оплату.',
          'Передоплата — 10 % від суми товарів, але не менше 460 ₴; решту сплачуєте на пошті.',
        ] : []),
        'На рахунок IBAN — реквізити побачите одразу після оформлення; відправимо після зарахування оплати. Зручно для компаній.',
      ]} />
      {f.cardPayments && <P>Вироби «свого розміру» оплачуються лише повністю карткою.</P>}
      <H2>Оптова знижка</H2>
      <P>{f.volumeTiers.map((t) => `від ${t.minUnits} шт. одного товару — −${t.percent}%`).join(', ')}. Кольори й розміри одного товару рахуються разом. Знижка рахується в кошику автоматично. <Link to={path.seg(l, 'wholesale')} className="underline">Детальніше про опт</Link>.</P>
    </>
  );
}

function Returns({ l }: { l: Locale }) {
  const biz = useBusiness();
  return (
    <>
      <P>Товар можна повернути або обміняти протягом 14 днів від отримання, якщо він зберіг товарний вигляд.</P>
      <UL items={[
        'Якщо виріб просто не підійшов, зворотну доставку оплачує покупець.',
        'Якщо є брак, зворотну доставку оплачуємо ми.',
        'Вироби «свого розміру» виготовляємо саме для вас, тому поверненню вони не підлягають — окрім браку. Про це сказано ще до оформлення.',
      ]} />
      <H2>Як повернути</H2>
      <P>Зателефонуйте або напишіть на {biz.publicEmail}, вкажіть номер замовлення — підкажемо, куди й як відправити. <Link to={path.seg(l, 'contacts')} className="underline">Контакти</Link>.</P>
    </>
  );
}

function faqItems(f: Facts, l: Locale, biz: LiveBusiness): Array<{ q: string; a: ReactNode; text: string }> {
  const tiers = f.volumeTiers.map((t) => `від ${t.minUnits} шт. одного товару — −${t.percent}%`).join(', ');
  return [
    { q: 'Де ви знаходитесь?', text: `У ${BUSINESS.locality}. Магазин і виробництво — в одному місці. ${biz.hoursText}`,
      a: <>У {BUSINESS.locality}. Магазин і виробництво — в одному місці. {biz.hoursText} <Link to={path.seg(l, 'contacts')} className="underline">Контакти</Link>.</> },
    { q: 'Це все ваше виробництво?', text: 'Кожен товар підписаний: «Власне виробництво» або «Від партнерів». Власні вироби ми робимо самі — від сирої вовни до готового виробу.',
      a: <>Кожен товар підписаний: «Власне виробництво» або «Від партнерів». Власні вироби ми робимо самі — від сирої вовни до готового виробу. <Link to={path.seg(l, 'production')} className="underline">Як ми виробляємо</Link>.</> },
    { q: 'Чи можна замовити ліжник свого розміру?', text: 'Так, там, де на сторінці товару є «Свій розмір». Виготовлення — 14 днів, лише повна передоплата карткою; повернення — тільки у разі браку.',
      a: 'Так, там, де на сторінці товару є «Свій розмір». Виготовлення — 14 днів, лише повна передоплата карткою; повернення — тільки у разі браку.' },
    { q: 'Як ви доставляєте?', text: 'Новою поштою (відділення, поштомат, кур’єр) та Укрпоштою по Україні, або самовивіз у Яворові. Доставку оплачує покупець.',
      a: <>Новою поштою (відділення, поштомат, кур’єр) та Укрпоштою по Україні, або самовивіз у Яворові. Доставку оплачує покупець. <Link to={path.seg(l, 'delivery')} className="underline">Доставка і оплата</Link>.</> },
    ...(f.cardPayments ? [{ q: 'Чи можна оглянути товар перед оплатою?', text: 'Так, накладеним платежем з оглядом: онлайн сплачуєте лише доставку в обидва боки, а товар — на пошті після огляду.',
      a: 'Так, накладеним платежем з оглядом: онлайн сплачуєте лише доставку в обидва боки, а товар — на пошті після огляду.' }] : []),
    { q: 'Чи є знижки на опт?', text: `Так: ${tiers}. Знижка рахується в кошику автоматично.`, a: <>Так: {tiers}. Знижка рахується в кошику автоматично. <Link to={path.seg(l, 'wholesale')} className="underline">Опт</Link>.</> },
    { q: 'Чи потрібно реєструватися?', text: 'Ні. Замовлення оформлюється без акаунта — достатньо імені, телефону й адреси доставки.', a: 'Ні. Замовлення оформлюється без акаунта — достатньо імені, телефону й адреси доставки.' },
    { q: 'Як доглядати за вовняними виробами?', text: 'Частіше провітрювати, ніж прати; прати вручну в прохолодній воді й сушити розкладеним. Докладно — на сторінці догляду.',
      a: <>Частіше провітрювати, ніж прати; прати вручну в прохолодній воді й сушити розкладеним. <Link to={path.seg(l, 'care')} className="underline">Догляд за виробами</Link>.</> },
    { q: 'Чи є у вас сертифікати?', text: 'Ні, сертифікатів у нас немає. Натомість є цех, куди можна приїхати й подивитися, як усе робиться.', a: 'Ні, сертифікатів у нас немає. Натомість є цех, куди можна приїхати й подивитися, як усе робиться.' },
  ];
}

function Faq({ f, l }: { f: Facts; l: Locale }) {
  const biz = useBusiness();
  const items = faqItems(f, l, biz);
  // FAQPage structured data, same text as the page (30 AI search; round 10 part 7 #11).
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.text } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-hairline bg-bg-surface">
        {items.map((i) => (
          <details key={i.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-h4 text-text-primary">
              {i.q}<span aria-hidden="true" className="transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-body-lg text-text-body">{i.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}

// Round 10 part 7 #13: care by material. General guidance; the client reviews it before launch.
function Care() {
  return (
    <>
      <P>Порада загальна. Якщо на етикетці виробу написано інакше — дотримуйтесь етикетки.</P>
      <H2>Вовна: ліжники, пледи, одяг, шкарпетки, пряжа</H2>
      <UL items={[
        'Вовну частіше провітрюють, ніж перуть: на свіжому повітрі вона позбувається запахів.',
        'Прати — вручну, у прохолодній воді, із засобом для вовни. Не терти й не викручувати.',
        'Сушити розкладеним на рівній поверхні, подалі від батареї та прямого сонця. Не в сушильній машині.',
        'Великий ліжник чи плед зручніше віддати в хімчистку.',
        'Зберігати сухим, у бавовняному чохлі; від молі допоможе лаванда чи кедр.',
      ]} />
      <H2>Овчина</H2>
      <UL items={[
        'Витрушувати й провітрювати; хутро розчісувати щіткою з рідкими зубцями.',
        'Не прати в пральній машині. Невелику пляму — зачистити м’якою щіткою чи злегка вологою тканиною.',
        'Якщо овчина намокла — сушити природно, подалі від тепла.',
      ]} />
      <H2>Шкіра</H2>
      <UL items={[
        'Протирати сухою або злегка вологою м’якою тканиною.',
        'Час від часу обробляти засобом для шкіри.',
        'Мокрий виріб сушити природно, не на батареї.',
      ]} />
    </>
  );
}

function Legal({ k }: { k: 'terms' | 'privacy' }) {
  return (
    <>
      <LegalStub />
      {k === 'terms' && (
        <>
          <H2>Основні умови вже зараз</H2>
          <UL items={[
            'Повернення — 14 днів; зворотну доставку, якщо виріб не підійшов, оплачує покупець.',
            'Вироби «свого розміру» поверненню не підлягають, окрім браку.',
            'Доставку оплачує покупець; доставляємо по Україні.',
          ]} />
        </>
      )}
      {k === 'privacy' && (
        <>
          <H2>Розсилка</H2>
          <UL items={[
            'Рекламні листи (акції, знижки, новинки) надсилаємо лише тим, хто сам поставив позначку під час оформлення замовлення й підтвердив підписку за посиланням у листі.',
            'Пишемо не частіше одного разу на тиждень. Відписатися можна одним кліком у кожному листі.',
            'Після відписки зберігаємо лише адресу пошти — щоб більше не писати на неї.',
            `Відповідальна за ці дані: ${BUSINESS.legalEntityName}.`,
          ]} />
        </>
      )}
      <H2>Продавець</H2>
      <Seller />
    </>
  );
}

function Cookies() {
  return (
    <>
      <P>Необхідні файли cookie потрібні, щоб працювали кошик і оформлення замовлення. Список обраного зберігається лише у вашому браузері й нікуди не передається.</P>
      <P>Аналітика (Google Analytics) вмикається лише після вашої згоди — у смужці внизу сторінки «Прийняти всі» або «Лише необхідні». Змінити вибір можна будь-коли тут.</P>
      <CookieSettings />
      <LegalStub />
    </>
  );
}

export default function Info() {
  const { locale, facts } = useLoaderData<typeof loader>();
  const k = keyOf(useMatches().at(-1)?.id ?? '');
  return (
    <article className="mx-auto flex max-w-(--container-narrow) flex-col gap-5 px-4 py-(--section-y-sm)">
      <h1 className="text-h1 text-text-primary">{TITLES[k]}</h1>
      {k === 'delivery' && <Delivery f={facts} l={locale} />}
      {k === 'returns' && <Returns l={locale} />}
      {k === 'faq' && <Faq f={facts} l={locale} />}
      {k === 'care' && <Care />}
      {(k === 'terms' || k === 'privacy') && <Legal k={k} />}
      {k === 'cookies' && <Cookies />}
    </article>
  );
}

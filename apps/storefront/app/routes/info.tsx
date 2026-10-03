import type { ReactNode } from 'react';
import { Link, useLoaderData, useMatches } from 'react-router';
import type { LiveBusiness, Locale, VolumeTier } from '@vivcharyk/schemas';
import { BUSINESS, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/info';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { CookieSettings } from '@/features/consent/CookieSettings';
import { Fold } from '@/features/catalog/components/CategoryText';
import { localeOf, originOf, pageMeta, pct, titled, updatedOn } from '@/lib/seo';

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
// Round 24 G093: the English pages.
const TITLES_EN: Record<Key, string> = {
  delivery: 'Delivery and payment', returns: 'Returns and exchanges', faq: 'Questions and answers', care: 'Caring for your wool goods',
  terms: 'Public offer contract', privacy: 'Privacy policy', cookies: 'Cookies',
};
const titleOf = (k: Key, l: Locale) => (l === 'en' ? TITLES_EN : TITLES)[k];

// G056, G196: a description written for each page.
const DESCRIPTIONS: Record<Key, (f: Facts | undefined) => string> = {
  delivery: (f) => `Доставка по Україні Новою поштою й Укрпоштою або самовивіз у с. Яворів, Косівський р-н. Відправляємо за 2–4 дні. ${f?.cardPayments ? 'Оплата карткою, з оглядом на пошті або на рахунок.' : 'Оплата на рахунок IBAN.'}`,
  returns: () => 'Повернення й обмін у Вівчарика — протягом 14 днів від отримання. Вироби «свого розміру» не повертаються, окрім браку. Як повернути покупку.',
  faq: () => 'Відповіді Вівчарика: де ми, доставка й оплата, опт від 10 шт., виріб свого розміру, догляд за вовною, сертифікати. Майстерня в с. Яворів, Косівський р-н.',
  care: () => 'Як прати, сушити й зберігати ліжники, пледи, вовняний одяг, овчину та шкіру: прості поради майстерні з с. Яворів, Косівський р-н.',
  terms: () => 'Договір публічної оферти Вівчарика: продавець, умови замовлення, доставки й повернення.',
  privacy: () => 'Як Вівчарик зберігає й використовує ваші дані: замовлення, розсилка лише за згодою, відписка одним кліком.',
  cookies: () => 'Які файли cookie використовує сайт Вівчарика і як змінити свій вибір.',
};
const DESCRIPTIONS_EN: Record<Key, (f: Facts | undefined) => string> = {
  delivery: (f) => `We deliver within Ukraine only, by Nova Poshta or Ukrposhta, or collect in Yavoriv, Kosiv district. Dispatch in 2–4 days. ${f?.cardPayments ? 'Pay by card or on delivery.' : 'Pay by IBAN transfer.'}`,
  returns: () => 'Return or exchange a Vivcharyk purchase within 14 days of receiving it. Custom-size pieces cannot be returned unless faulty. How to return.',
  faq: () => 'Vivcharyk answers: where we are, delivery and payment, wholesale from 10 pcs, custom sizes, wool care, certificates. Workshop in Yavoriv, Kosiv district.',
  care: () => 'How to wash, dry and store lizhnyks, throws, wool clothing, sheepskin and leather. In short: air wool often, wash by hand in cool water, dry flat.',
  terms: () => 'The Vivcharyk public offer contract: the seller, and the terms of ordering, delivery and returns.',
  privacy: () => 'How Vivcharyk stores and uses your data: orders, newsletters only with your consent, one-click unsubscribe.',
  cookies: () => 'Which cookies the Vivcharyk website uses and how to change your choice at any time.',
};

// G071: «Оновлено …» under the pages whose rules change; bump the date when the text changes.
const UPDATED: Partial<Record<Key, string>> = { delivery: '2026-10-03', returns: '2026-10-03', faq: '2026-10-03', care: '2026-10-03' };

export function meta({ matches, data }: Route.MetaArgs) {
  const k = keyOf(matches.at(-1)?.id ?? '');
  const locale = localeOf(matches);
  const description = (locale === 'en' ? DESCRIPTIONS_EN : DESCRIPTIONS)[k]?.(data?.facts);
  return pageMeta({ title: titled(titleOf(k, locale) ?? '', locale), description, origin: originOf(matches), locale });
}

const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-4 text-h3 text-text-primary">{children}</h2>;
const P = ({ children }: { children: ReactNode }) => <p className="text-body-lg text-text-body">{children}</p>;
const UL = ({ items }: { items: ReactNode[] }) => <ul className="flex list-disc flex-col gap-2 pl-6 text-body-lg text-text-body">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;

function Seller({ l }: { l: Locale }) {
  const biz = useBusiness();
  if (l === 'en') return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-md border border-border-hairline bg-bg-surface p-4 text-body">
      <dt className="text-text-muted">Seller</dt><dd>{biz.legalEntityName}</dd>
      <dt className="text-text-muted">Taxpayer number (RNOKPP)</dt><dd>{BUSINESS.legalId}</dd>
      <dt className="text-text-muted">Address</dt><dd>{isPlaceholder(BUSINESS.factoryAddress) ? biz.locality : biz.factoryAddress}</dd>
      <dt className="text-text-muted">Email</dt><dd>{biz.publicEmail}</dd>
    </dl>
  );
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-md border border-border-hairline bg-bg-surface p-4 text-body">
      <dt className="text-text-muted">Продавець</dt><dd>{BUSINESS.legalEntityName}</dd>
      <dt className="text-text-muted">РНОКПП</dt><dd>{BUSINESS.legalId}</dd>
      <dt className="text-text-muted">Адреса</dt><dd>{isPlaceholder(BUSINESS.factoryAddress) ? `${BUSINESS.locality} ${BUSINESS.factoryAddress}` : BUSINESS.factoryAddress}</dd>
      <dt className="text-text-muted">Email</dt><dd>{biz.publicEmail}</dd>
    </dl>
  );
}

function LegalStub({ l }: { l: Locale }) {
  return <p className="rounded-md border-2 border-dashed border-border-control bg-bg-alt p-4 text-body text-text-muted">{l === 'en' ? 'The full text is being prepared by a lawyer — it will appear here soon.' : 'Повний текст готує юрист — він з’явиться тут найближчим часом.'}</p>;
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
      <div className="border-t border-border-hairline">
        <Fold title="Детальніше: доставка й оплата одним абзацом">
          <p>Вівчарик доставляє замовлення по всій Україні Новою поштою та Укрпоштою, а забрати покупку можна й самому — у магазині при цеху в селі Яворів Косівського району. Новою поштою відправляємо у відділення, у поштомат, якщо посилка в нього поміститься, або кур’єром на адресу; Укрпоштою — у відділення. Відправляємо за 2–4 дні, а вироби «свого розміру» та позиції «під замовлення» спершу виготовляємо — це 14 днів. Доставку оплачує покупець за тарифом перевізника; точну суму видно під час оформлення, ще до оплати. {f.cardPayments ? `Оплатити можна карткою онлайн, накладеним платежем з оглядом на пошті, передоплатою ${pct(10)} (не менше 460 ₴) або на рахунок IBAN.` : 'Оплатити можна на рахунок IBAN — реквізити видно одразу після оформлення.'} За кордон поки не доставляємо. Оптова знижка — {f.volumeTiers.map((t) => `${pct(t.percent)} від ${t.minUnits} шт. одного товару`).join(', ')} — рахується в кошику сама.</p>
        </Fold>
      </div>

      <H2>Оплата</H2>
      <UL items={[
        ...(f.cardPayments ? [
          'Карткою онлайн — Visa, Mastercard, Apple Pay, Google Pay. Фіскальний чек з’явиться на сторінці замовлення.',
          'Накладений платіж з оглядом — онлайн сплачуєте лише доставку в обидва боки, а товар — на пошті, після огляду. Якщо товар забираєте, вартість зворотної доставки зараховуємо в оплату.',
          `Передоплата — ${pct(10)} від суми товарів, але не менше 460 ₴; решту сплачуєте на пошті.`,
        ] : []),
        'На рахунок IBAN — реквізити побачите одразу після оформлення; відправимо після зарахування оплати. Зручно для компаній.',
      ]} />
      {f.cardPayments && <P>Вироби «свого розміру» оплачуються лише повністю карткою.</P>}
      <H2>Оптова знижка</H2>
      <P>{f.volumeTiers.map((t) => `від ${t.minUnits} шт. одного товару — ${pct(t.percent, true)}`).join(', ')}. Кольори й розміри одного товару рахуються разом. Знижка рахується в кошику автоматично. <Link to={path.seg(l, 'wholesale')} className="underline">Детальніше про опт</Link>.</P>
    </>
  );
}

function DeliveryEn({ f, l }: { f: Facts; l: Locale }) {
  const biz = useBusiness();
  const tiers = f.volumeTiers.map((t) => `from ${t.minUnits} items of one product — ${pct(t.percent, true, l)}`).join(', ');
  return (
    <>
      <H2>Delivery</H2>
      <P>We deliver within Ukraine only; international delivery is not available. The buyer pays for delivery at the carrier’s rate — you see the exact amount at checkout, before you pay.</P>
      <UL items={[
        'Nova Poshta — to a branch or a parcel locker (if the parcel fits), or by courier to your address.',
        'Ukrposhta — to a branch.',
        <>Pickup in {biz.locality}, from the shop at our workshop. {biz.hoursText} <Link to={path.seg(l, 'contacts')} className="underline">Contacts</Link>.</>,
      ]} />
      <P>Custom-size pieces and items marked «Made to order» are made first — that takes 14 days — and then sent.</P>
      <div className="border-t border-border-hairline">
        <Fold title="More details: delivery and payment in one paragraph">
          <p>Vivcharyk delivers orders across Ukraine by Nova Poshta and Ukrposhta, and you can also collect your purchase yourself from the shop at our workshop in Yavoriv village, Kosiv district, Ivano-Frankivsk region. With Nova Poshta we send to a branch, to a parcel locker if the parcel fits, or by courier to your address; with Ukrposhta, to a branch. We dispatch in 2–4 days; custom-size pieces and made-to-order items are made first, which takes 14 days. The buyer pays for delivery at the carrier’s rate; you see the exact amount at checkout, before you pay. {f.cardPayments ? `You can pay by card online, cash on delivery with inspection at the post office, a prepayment of ${pct(10, false, l)} (no less than 460 ₴) or by IBAN bank transfer.` : 'You can pay by IBAN bank transfer — the details appear right after checkout.'} We deliver within Ukraine only; international delivery is not available. The wholesale discount — {f.volumeTiers.map((t) => `${pct(t.percent, false, l)} from ${t.minUnits} items of one product`).join(', ')} — is applied in the basket automatically.</p>
        </Fold>
      </div>

      <H2>Payment</H2>
      <UL items={[
        ...(f.cardPayments ? [
          'By card online — Visa, Mastercard, Apple Pay, Google Pay. The fiscal receipt appears on the order page.',
          'Cash on delivery with inspection at the post office — online you pay only for delivery both ways, and you pay for the goods at the post office after inspecting them. If you keep the goods, the cost of the return delivery counts towards your payment.',
          `Prepayment — ${pct(10, false, l)} of the goods total, but no less than 460 ₴; you pay the rest at the post office.`,
        ] : []),
        'By IBAN bank transfer — you see the details right after checkout; we send the order once the payment arrives. Convenient for companies.',
      ]} />
      {f.cardPayments && <P>Custom-size pieces are paid for only in full, by card.</P>}
      <H2>Wholesale discount</H2>
      <P>{tiers.charAt(0).toUpperCase() + tiers.slice(1)}. Colours and sizes of one product count together. The discount is applied in the basket automatically. <Link to={path.seg(l, 'wholesale')} className="underline">More about wholesale</Link>.</P>
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
      <div className="border-t border-border-hairline">
        <Fold title="Детальніше: повернення одним абзацом">
          <p>Покупку у Вівчарика можна повернути або обміняти протягом 14 днів від отримання, якщо виріб зберіг товарний вигляд. Якщо річ просто не підійшла, зворотну доставку оплачує покупець; якщо є брак — її оплачуємо ми. Вироби «свого розміру» ми виготовляємо саме для вас, тому їх не повертають, окрім браку, — про це сказано ще до оформлення замовлення. Щоб повернути чи обміняти покупку, зателефонуйте нам або напишіть на {biz.publicEmail} і вкажіть номер замовлення: ми підкажемо, куди й як відправити посилку. Майстерня й магазин Вівчарика — в селі Яворів Косівського району, тож обміняти виріб можна й на місці, у робочі години.</p>
        </Fold>
      </div>
    </>
  );
}

function ReturnsEn({ l }: { l: Locale }) {
  const biz = useBusiness();
  return (
    <>
      <P>You can return or exchange a product within 14 days of receiving it, as long as it is still in saleable condition.</P>
      <UL items={[
        'If the piece simply did not suit you, the buyer pays for the return delivery.',
        'If it is faulty, we pay for the return delivery.',
        'Custom-size pieces are made just for you, so they cannot be returned unless they are faulty. We say so before checkout.',
      ]} />
      <H2>How to return</H2>
      <P>Call us or write to {biz.publicEmail} (a written statement by e-mail is accepted) with your order number — we will tell you where and how to send it. <Link to={path.seg(l, 'contacts')} className="underline">Contacts</Link>.</P>
      <div className="border-t border-border-hairline">
        <Fold title="More details: returns in one paragraph">
          <p>A Vivcharyk purchase can be returned or exchanged within 14 days of receiving it, as long as the piece is still in saleable condition. If it simply did not suit you, the buyer pays for the return delivery; if it is faulty, we pay. Custom-size pieces are made just for you, so they are not returned unless faulty — we say so before you place the order. To return or exchange a purchase, call us or write to {biz.publicEmail} (a written statement by e-mail is accepted) with your order number, and we will tell you where and how to send the parcel. The Vivcharyk workshop and shop are in Yavoriv village, Kosiv district, Ivano-Frankivsk region, so you can also exchange a piece in person during opening hours.</p>
        </Fold>
      </div>
    </>
  );
}

function faqItems(f: Facts, l: Locale, biz: LiveBusiness): Array<{ q: string; a: ReactNode; text: string }> {
  const tiers = f.volumeTiers.map((t) => `від ${t.minUnits} шт. одного товару — ${pct(t.percent, true)}`).join(', ');
  return [
    { q: 'Де ви знаходитесь?', text: `Майстерня й магазин Вівчарика — в одному місці: ${BUSINESS.factoryAddress}. ${biz.hoursText}`,
      a: <>Майстерня й магазин Вівчарика — в одному місці: {BUSINESS.factoryAddress}. {biz.hoursText} <Link to={path.seg(l, 'contacts')} className="underline">Контакти</Link>.</> },
    { q: 'Це все ваше виробництво?', text: 'Так, усе з позначкою «Власне виробництво» ми робимо самі — від сирої вовни до готового виробу. Товари інших майстрів підписані «Від партнерів».',
      a: <>Так, усе з позначкою «Власне виробництво» ми робимо самі — від сирої вовни до готового виробу. Товари інших майстрів підписані «Від партнерів». <Link to={path.seg(l, 'production')} className="underline">Як ми виробляємо</Link>.</> },
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

function faqItemsEn(f: Facts, l: Locale, biz: LiveBusiness): Array<{ q: string; a: ReactNode; text: string }> {
  const tiers = f.volumeTiers.map((t) => `from ${t.minUnits} items of one product — ${pct(t.percent, true, l)}`).join(', ');
  return [
    { q: 'Where are you?', text: `The Vivcharyk workshop and shop are in one place: ${biz.factoryAddress}. ${biz.hoursText}`,
      a: <>The Vivcharyk workshop and shop are in one place: {biz.factoryAddress}. {biz.hoursText} <Link to={path.seg(l, 'contacts')} className="underline">Contacts</Link>.</> },
    { q: 'Do you make everything yourselves?', text: 'Yes, everything marked «Made in our workshop» we make ourselves — from raw wool to the finished piece. Goods by other makers are labelled «From our partners».',
      a: <>Yes, everything marked «Made in our workshop» we make ourselves — from raw wool to the finished piece. Goods by other makers are labelled «From our partners». <Link to={path.seg(l, 'production')} className="underline">How we make it</Link>.</> },
    { q: 'Can I order a lizhnyk in my own size?', text: 'Yes, where the product page has «Custom size». Making takes 14 days, full prepayment by card only; returns only if the piece is faulty.',
      a: 'Yes, where the product page has «Custom size». Making takes 14 days, full prepayment by card only; returns only if the piece is faulty.' },
    { q: 'How do you deliver?', text: 'By Nova Poshta (branch, parcel locker, courier) and Ukrposhta within Ukraine, or pickup in Yavoriv. The buyer pays for delivery. We do not deliver outside Ukraine.',
      a: <>By Nova Poshta (branch, parcel locker, courier) and Ukrposhta within Ukraine, or pickup in Yavoriv. The buyer pays for delivery. We do not deliver outside Ukraine. <Link to={path.seg(l, 'delivery')} className="underline">Delivery and payment</Link>.</> },
    ...(f.cardPayments ? [{ q: 'Can I inspect the goods before paying?', text: 'Yes, with cash on delivery with inspection: online you pay only for delivery both ways, and you pay for the goods at the post office after inspecting them.',
      a: 'Yes, with cash on delivery with inspection: online you pay only for delivery both ways, and you pay for the goods at the post office after inspecting them.' }] : []),
    { q: 'Are there wholesale discounts?', text: `Yes: ${tiers}. The discount is applied in the basket automatically.`, a: <>Yes: {tiers}. The discount is applied in the basket automatically. <Link to={path.seg(l, 'wholesale')} className="underline">Wholesale</Link>.</> },
    { q: 'Do I need to register?', text: 'No. You order without an account — a name, a phone number and a delivery address are enough.', a: 'No. You order without an account — a name, a phone number and a delivery address are enough.' },
    { q: 'How do I care for wool goods?', text: 'Air them more often than you wash them; wash by hand in cool water and dry flat. More on the care page.',
      a: <>Air them more often than you wash them; wash by hand in cool water and dry flat. <Link to={path.seg(l, 'care')} className="underline">Caring for your wool goods</Link>.</> },
    { q: 'Do you have certificates?', text: 'No, we do not have certificates. Instead, there is a workshop you can visit to see how everything is made.', a: 'No, we do not have certificates. Instead, there is a workshop you can visit to see how everything is made.' },
  ];
}

function Faq({ f, l }: { f: Facts; l: Locale }) {
  const biz = useBusiness();
  const items = (l === 'en' ? faqItemsEn : faqItems)(f, l, biz);
  // FAQPage structured data, same text as the page (30 AI search; round 10 part 7 #11).
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.text } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-hairline bg-bg-surface">
        {items.map((i) => (
          <details key={i.q} className="group px-5 py-4">
            {/* G072: each question is a real heading inside the folding element. */}
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <h2 className="text-h4 text-text-primary">{i.q}</h2><span aria-hidden="true" className="text-h4 text-text-primary transition-transform group-open:rotate-45">+</span>
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
      {/* G196: the answer first. */}
      <P>Вовняні вироби частіше провітрюють, ніж перуть; перуть уручну в прохолодній воді й сушать розкладеними. Порада загальна: якщо на етикетці виробу написано інакше — дотримуйтесь етикетки.</P>
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

function CareEn() {
  return (
    <>
      <P>Wool goods are aired more often than they are washed; wash them by hand in cool water and dry them flat. This is general advice: if the label on the piece says otherwise, follow the label.</P>
      <H2>Wool: lizhnyks, throws, clothing, socks, yarn</H2>
      <UL items={[
        'Air wool more often than you wash it: in fresh air it loses odours.',
        'Wash by hand, in cool water, with a wool detergent. Do not rub or wring.',
        'Dry flat on a level surface, away from radiators and direct sun. Not in a tumble dryer.',
        'A large lizhnyk or throw is easier to take to a dry cleaner.',
        'Store dry, in a cotton cover; lavender or cedar helps against moths.',
      ]} />
      <H2>Sheepskin</H2>
      <UL items={[
        'Shake out and air; brush the fur with a wide-toothed brush.',
        'Do not machine-wash. Clean a small stain with a soft brush or a slightly damp cloth.',
        'If sheepskin gets wet, let it dry naturally, away from heat.',
      ]} />
      <H2>Leather</H2>
      <UL items={[
        'Wipe with a dry or slightly damp soft cloth.',
        'Treat with a leather care product from time to time.',
        'Dry a wet piece naturally, not on a radiator.',
      ]} />
    </>
  );
}

function LegalEn({ k }: { k: 'terms' | 'privacy' }) {
  const biz = useBusiness();
  return (
    <>
      <LegalStub l="en" />
      {k === 'terms' && (
        <>
          <H2>The main terms already</H2>
          <UL items={[
            'Returns — 14 days; if the piece did not suit you, the buyer pays for the return delivery.',
            'Custom-size pieces cannot be returned unless faulty.',
            'The buyer pays for delivery; we deliver within Ukraine.',
          ]} />
        </>
      )}
      {k === 'privacy' && (
        <>
          <H2>Newsletter</H2>
          <UL items={[
            'We send promotional e-mails (offers, discounts, new arrivals) only to people who ticked the box themselves at checkout and confirmed the subscription through the link in our e-mail.',
            'We write no more than once a week. You can unsubscribe with one click in every e-mail.',
            'After you unsubscribe, we keep only the e-mail address — so that we never write to it again.',
            `Responsible for this data: ${biz.legalEntityName}.`,
          ]} />
        </>
      )}
      <H2>Seller</H2>
      <Seller l="en" />
    </>
  );
}

function Legal({ k }: { k: 'terms' | 'privacy' }) {
  return (
    <>
      <LegalStub l="uk" />
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
      <Seller l="uk" />
    </>
  );
}

function Cookies({ l }: { l: Locale }) {
  if (l === 'en') return (
    <>
      <P>Essential cookies are needed for the basket and checkout to work. Your wishlist is stored only in your browser and is not sent anywhere.</P>
      <P>Analytics (Google Analytics) is switched on only after you agree — in the bar at the bottom of the page, «Accept all» or «Essential only». You can change your choice here at any time.</P>
      <CookieSettings />
      <LegalStub l="en" />
    </>
  );
  return (
    <>
      <P>Необхідні файли cookie потрібні, щоб працювали кошик і оформлення замовлення. Список обраного зберігається лише у вашому браузері й нікуди не передається.</P>
      <P>Аналітика (Google Analytics) вмикається лише після вашої згоди — у смужці внизу сторінки «Прийняти всі» або «Лише необхідні». Змінити вибір можна будь-коли тут.</P>
      <CookieSettings />
      <LegalStub l="uk" />
    </>
  );
}

export default function Info() {
  const { locale, facts } = useLoaderData<typeof loader>();
  const k = keyOf(useMatches().at(-1)?.id ?? '');
  const en = locale === 'en';
  return (
    <article className="mx-auto flex max-w-(--container-narrow) flex-col gap-5 px-4 py-(--section-y-sm)">
      <h1 className="text-h1 text-text-primary">{titleOf(k, locale)}</h1>
      {k === 'delivery' && (en ? <DeliveryEn f={facts} l={locale} /> : <Delivery f={facts} l={locale} />)}
      {k === 'returns' && (en ? <ReturnsEn l={locale} /> : <Returns l={locale} />)}
      {k === 'faq' && <Faq f={facts} l={locale} />}
      {k === 'care' && (en ? <CareEn /> : <Care />)}
      {(k === 'terms' || k === 'privacy') && (en ? <LegalEn k={k} /> : <Legal k={k} />)}
      {k === 'cookies' && <Cookies l={locale} />}
      {UPDATED[k] && <p className="mt-6 text-caption text-text-muted">{updatedOn(UPDATED[k]!, locale)}</p>}
    </article>
  );
}

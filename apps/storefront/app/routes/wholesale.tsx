import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale, VolumeTier } from '@vivcharyk/schemas';
import { contactLinks } from '@vivcharyk/schemas';
import { t as tr } from '@/lib/i18n';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/wholesale';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { Messengers } from '@/components/contact/Messengers';
import type { loader as layoutLoader } from './locale-layout';
import { localeOf, originOf, pageMeta, pct, titled } from '@/lib/seo';
import { Fold } from '@/features/catalog/components/CategoryText';

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const { data } = await apiGet<{ volumeTiers: VolumeTier[] }>('/site/facts', locale);
  return { locale, tiers: [...data.volumeTiers].sort((a, b) => a.minUnits - b.minUnits) };
}

export function meta({ matches, data }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    const tiers = data?.tiers ?? [];
    const top = tiers.at(-1);
    return pageMeta({
      title: titled(top ? `Wholesale wool goods from the maker, up to ${pct(top.percent, false, locale)} off` : 'Wholesale wool goods from the maker', locale),
      description: `Lizhnyks, rugs and runners wholesale from the maker in Yavoriv, Kosiv district${tiers.length ? `: ${tiers.map((t, i) => `${pct(t.percent, true, locale)} from ${t.minUnits} pcs${i ? '' : ' of one product'}`).join(', ')}` : ''}. Invoices for companies.`,
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: titled('Вовняні вироби оптом від виробника, знижка до 20 %'),
    description: 'Ліжники, килими й доріжки оптом від виробника з с. Яворів, Косівський р-н: від 10 шт. одного товару −10 %, від 20 шт. −20 %. Рахунок для компаній.',
    origin: originOf(matches),
  });
}

const live = (c: CategoryNode) => (c as CategoryNode & { productCount?: number }).productCount !== 0;

const box = 'flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-6';

/** The contact person's name in Latin script on English pages (the panel stores it in Ukrainian). */
const personName = (name: string, en: boolean) => (en && name === 'Іван' ? 'Ivan' : name);

// Round 10 part 7 / §P7a: no enquiry form and no price list. The calls to action are the phone,
// the messengers and the catalogue; the volume discount is applied by the cart itself.
export default function Wholesale() {
  const biz = useBusiness();
  const { locale, tiers } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const first = layout?.categories[0];
  const groups = (layout?.categories ?? []).filter(live);
  const catalogHref = first ? path.category(locale, first.slug) : path.home(locale);
  const owner = biz.contactPeople[0];
  const tel = contactLinks(owner.phone)?.tel;
  const en = locale === 'en';
  const min = tiers[0]?.minUnits ?? 10;

  return (
    <>
      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <span className="text-overline uppercase opacity-80">{en ? 'Wholesale · The whole cycle. The same hands.' : 'Опт · Повний цикл. Одні руки.'}</span>
          {/* G077: «оптом» in the H1. */}
          <h1 className="max-w-[22ch] text-display-lg">{en ? 'Wholesale wool goods direct from a Carpathian maker' : 'Вовняні вироби оптом від виробника з Карпат'}</h1>
          <p className="max-w-[56ch] text-body-lg opacity-90">
            {biz.tagline}<br />{en ? 'Washing, carding, spinning, weaving, felting, sewing and tanning of hides, all in one workshop.' : 'Миття, чесання, прядіння, ткання, валяння, пошиття, вичинка шкур — в одному цеху.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={catalogHref} className="rounded-lg bg-bg-page px-6 py-3.5 text-body-lg font-semibold text-text-primary">{en ? 'Go to the catalogue' : 'Перейти в каталог'}</Link>
            {tel && <a href={tel} className="rounded-lg border-2 border-text-on-inverted px-6 py-3 text-body-lg font-semibold">{en ? 'Call us' : 'Подзвонити'}</a>}
          </div>
        </div>
      </section>

      <section aria-labelledby="w-offer" className="py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) gap-5 px-4 lg:grid-cols-2 lg:px-12">
          <div className={box}>
            <h2 id="w-offer" className="text-h2 text-text-primary">{en ? 'Volume discount' : 'Знижка за кількість'}</h2>
            <table className="w-full text-left text-body-lg">
              <thead className="text-body-sm text-text-muted"><tr><th className="py-2 font-normal">{en ? 'Quantity' : 'Кількість'}</th><th className="py-2 font-normal">{en ? 'Discount' : 'Знижка'}</th></tr></thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.minUnits} className="border-t border-border-hairline">
                    <td className="py-3 text-text-primary">{en ? `${t.minUnits} pieces or more` : `від ${t.minUnits} шт.`}</td>
                    <td className="py-3 text-h3 font-semibold text-text-primary">{pct(t.percent, true, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {en ? <>
              <p className="text-body text-text-body">The discount is applied automatically in the basket: there is nothing to ask for. Pieces of one product are counted, its colours and sizes together; different products are counted separately.</p>
              <p className="text-body-sm text-text-muted">Yarn and wool sold by weight and “Custom size” pieces are not included in the discount.</p>
            </> : <>
              <p className="text-body text-text-body">Знижка застосовується автоматично в кошику — нічого не треба запитувати. Рахуються штуки одного товару: його кольори й розміри разом, різні товари — окремо.</p>
              <p className="text-body-sm text-text-muted">Пряжа й вовна на вагу та вироби «свого розміру» у знижку не входять.</p>
            </>}
          </div>

          <div className="flex flex-col gap-5">
            <div className={box}>
              <h2 className="text-h3 text-text-primary">{en ? `Minimum wholesale order: ${min} pieces of one product` : `Мінімальне оптове замовлення — ${min} шт. одного товару`}</h2>
              <p className="text-body text-text-body">{en ? 'There is no separate minimum order value. Prices are the same as in the catalogue; the discount is taken off in the basket.' : 'Окремого мінімуму на суму немає. Ціни — ті самі, що в каталозі, знижка віднімається в кошику.'}</p>
            </div>
            <div className={box}>
              <h2 className="text-h3 text-text-primary">{en ? 'For companies' : 'Для компаній'}</h2>
              <p className="text-body text-text-body">{en ? 'At checkout, enter your company name and EDRPOU code and choose payment by bank transfer to our IBAN. We will email you an invoice and send the order once the payment arrives.' : 'При оформленні вкажіть назву компанії та ЄДРПОУ й оберіть оплату на рахунок IBAN — рахунок надішлемо на email, відправимо після зарахування оплати.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* G078: what can be bought in bulk — the categories that have products. */}
      {groups.length > 0 && (
        <section aria-labelledby="w-range" className="pb-(--section-y-sm)">
          <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 lg:px-12">
            <h2 id="w-range" className="text-h2 text-text-primary">{en ? 'What you can buy wholesale' : 'Що можна взяти оптом'}</h2>
            <ul className="flex flex-wrap gap-2">
              {groups.flatMap((g) => (g.children.filter(live).length ? g.children.filter(live).map((c) => ({ c, href: path.category(locale, g.slug, c.slug) })) : [{ c: g, href: path.category(locale, g.slug) }])).map(({ c, href }) => (
                <li key={c.id}><Link to={href} className="inline-flex min-h-11 items-center rounded-full border border-border-control px-4 text-body text-text-primary hover:underline">{c.name}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* G175: hotels, guest houses and садиби. */}
      <section aria-labelledby="w-hotels" className="pb-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) gap-5 px-4 lg:grid-cols-2 lg:px-12">
          <div className={box}>
            {en ? <>
              <h2 id="w-hotels" className="text-h3 text-text-primary">For hotels, guest houses and rural homesteads</h2>
              <p className="text-body text-text-body">Lizhnyks, rugs and runners for your rooms, from our workshop, direct from the maker. From {min} pieces of one product the wholesale discount applies, and we send companies an invoice. Some pieces we can make to your measurements, in 14 days. Give us a call and we will suggest what will suit you.</p>
            </> : <>
              <h2 id="w-hotels" className="text-h3 text-text-primary">Для готелів, садиб і гостьових будинків</h2>
              <p className="text-body text-text-body">Ліжники, килими й доріжки для номерів — з нашого цеху, напряму від виробника. Від {tiers[0]?.minUnits ?? 10} шт. одного товару діє оптова знижка, компаніям надсилаємо рахунок. Окремі вироби виготовимо за вашими мірками — 14 днів. Зателефонуйте — порадимо, що підійде.</p>
            </>}
          </div>
          <div className={`${box} text-body-lg`}>
            {en
              ? <Fold title="More details: wholesale in one paragraph">
                <p>{biz.brand} sells wool goods wholesale direct from the maker, from its own workshop in Yavoriv village, Kosiv district, Ivano-Frankivsk region. The wholesale discount is worked out in the basket automatically: {tiers.map((t) => `${pct(t.percent, false, locale)} from ${t.minUnits} pieces of one product`).join(', ')}; the colours and sizes of one product count together. There is no separate minimum order value, and prices are the same as in the catalogue. At checkout, companies enter their name and EDRPOU code and choose payment by bank transfer to our IBAN: we email the invoice and send the order once the payment arrives. Yarn and wool sold by weight and “Custom size” pieces are not included in the wholesale discount. You can look round the workshop together with the owner: arrange a time by phone.</p>
              </Fold>
              : <Fold title="Детальніше: опт одним абзацом">
                <p>Вівчарик продає вовняні вироби оптом напряму від виробника — з власного цеху в селі Яворів Косівського району Івано-Франківської області. Оптова знижка рахується в кошику сама: {tiers.map((t) => `від ${t.minUnits} шт. одного товару — ${pct(t.percent)}`).join(', ')}; кольори й розміри одного товару рахуються разом. Окремого мінімуму на суму немає, ціни — ті самі, що в каталозі. Компанії вказують під час оформлення назву та ЄДРПОУ й обирають оплату на рахунок IBAN: рахунок надсилаємо на пошту, а відправляємо після зарахування оплати. Пряжа й вовна на вагу та вироби «свого розміру» в оптову знижку не входять. Цех можна оглянути разом із власником — домовтеся про час телефоном.</p>
              </Fold>}
          </div>
        </div>
      </section>

      <section aria-labelledby="w-trust" className="bg-bg-alt py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) gap-8 px-4 md:grid-cols-2 lg:px-12">
          <div className="flex flex-col gap-4 text-body-lg text-text-body">
            {en ? <>
              <h2 id="w-trust" className="text-h1 text-text-primary">Direct from the maker</h2>
              <p>The workshop is in Yavoriv village, Kosiv district, Ivano-Frankivsk region, which is called the capital of lizhnyk weaving. The shop is in the same place: you can see the pieces in person.</p>
              <p>You can look round the workshop together with the owner. Call ahead to arrange a time.</p>
              <p className="text-body">Every product in the catalogue is labelled “{tr(locale, 'product.own')}” or “{tr(locale, 'product.partner')}”.</p>
            </> : <>
              <h2 id="w-trust" className="text-h1 text-text-primary">Напряму від виробника</h2>
              <p>Цех — у селі Яворів Косівського району, яке називають столицею ліжникарства. Там само працює магазин: вироби можна побачити наживо.</p>
              <p>Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.</p>
              <p className="text-body">Кожен товар у каталозі підписаний: «Власне виробництво» або «Від партнерів».</p>
            </>}
            <div className="flex flex-wrap gap-4 text-body">
              <Link to={path.seg(locale, 'production')} className="text-text-primary underline">{en ? 'How we make it' : 'Як ми виробляємо'} <span className="vk-arrow" aria-hidden="true">→</span></Link>
              <Link to={path.seg(locale, 'reviews')} className="text-text-primary underline">{en ? 'Customer reviews' : 'Відгуки покупців'} <span className="vk-arrow" aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className={box}>
            <h2 className="text-h3 text-text-primary">{en ? 'Wholesale questions' : 'Питання щодо опту'}</h2>
            {biz.contactPeople.map((p) => {
              const l = contactLinks(p.phone);
              return (
                <p key={p.name} className="flex flex-wrap gap-3 text-body">
                  <span className="w-16 text-text-muted">{personName(p.name, en)}</span>
                  {l ? <a href={l.tel} className="font-semibold text-text-primary">{p.phone}</a> : <span className="text-text-muted">{p.phone}</span>}
                </p>
              );
            })}
            <div className="text-text-primary"><Messengers /></div>
            <a href={`mailto:${biz.publicEmail}`} className="self-start text-body text-text-primary underline">{biz.publicEmail}</a>
          </div>
        </div>
      </section>
    </>
  );
}

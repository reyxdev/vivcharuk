import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { Locale, VolumeTier } from '@vivcharyk/schemas';
import { BUSINESS, contactLinks } from '@vivcharyk/schemas';
import type { Route } from './+types/wholesale';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { Messengers } from '@/components/contact/Messengers';
import type { loader as layoutLoader } from './locale-layout';

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const { data } = await apiGet<{ volumeTiers: VolumeTier[] }>('/site/facts', locale);
  return { locale, tiers: [...data.volumeTiers].sort((a, b) => a.minUnits - b.minUnits) };
}

export function meta() {
  const title = `Опт — ${BUSINESS.brand}`;
  return [{ title }, { name: 'description', content: 'Вовняні вироби оптом від виробника: знижка від 10 штук одного товару, автоматично в кошику. Повний цикл в одному цеху в Карпатах.' }, { property: 'og:title', content: title }];
}

const box = 'flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-6';

// Round 10 part 7 / §P7a: no enquiry form and no price list. The calls to action are the phone,
// the messengers and the catalogue; the volume discount is applied by the cart itself.
export default function Wholesale() {
  const { locale, tiers } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const first = layout?.categories[0];
  const catalogHref = first ? path.category(locale, first.slug) : path.home(locale);
  const owner = BUSINESS.contactPeople[0];
  const tel = contactLinks(owner.phone)?.tel;

  return (
    <>
      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <span className="text-overline uppercase opacity-80">Опт</span>
          <h1 className="text-display-lg">Повний цикл. Одні руки.</h1>
          <p className="max-w-[56ch] text-body-lg opacity-90">
            {BUSINESS.tagline}<br />Миття, чесання, прядіння, ткання, валяння, пошиття, вичинка шкур — в одному цеху.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={catalogHref} className="rounded-lg bg-bg-page px-6 py-3.5 text-body-lg font-semibold text-text-primary">Перейти в каталог</Link>
            {tel && <a href={tel} className="rounded-lg border-2 border-text-on-inverted px-6 py-3 text-body-lg font-semibold">Подзвонити</a>}
          </div>
        </div>
      </section>

      <section aria-labelledby="w-offer" className="py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) gap-5 px-4 lg:grid-cols-2 lg:px-12">
          <div className={box}>
            <h2 id="w-offer" className="text-h2 text-text-primary">Знижка за кількість</h2>
            <table className="w-full text-left text-body-lg">
              <thead className="text-body-sm text-text-muted"><tr><th className="py-2 font-normal">Кількість</th><th className="py-2 font-normal">Знижка</th></tr></thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.minUnits} className="border-t border-border-hairline">
                    <td className="py-3 text-text-primary">від {t.minUnits} шт.</td>
                    <td className="py-3 text-h3 font-semibold text-text-primary">−{t.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-body text-text-body">Знижка застосовується автоматично в кошику — нічого не треба запитувати. Рахуються штуки одного товару: його кольори й розміри разом, різні товари — окремо.</p>
            <p className="text-body-sm text-text-muted">Пряжа й вовна на вагу та вироби «свого розміру» у знижку не входять.</p>
          </div>

          <div className="flex flex-col gap-5">
            <div className={box}>
              <h2 className="text-h3 text-text-primary">Мінімальне оптове замовлення — {tiers[0]?.minUnits ?? 10} шт. одного товару</h2>
              <p className="text-body text-text-body">Окремого мінімуму на суму немає. Ціни — ті самі, що в каталозі, знижка віднімається в кошику.</p>
            </div>
            <div className={box}>
              <h2 className="text-h3 text-text-primary">Для компаній</h2>
              <p className="text-body text-text-body">При оформленні вкажіть назву компанії та ЄДРПОУ й оберіть оплату на рахунок IBAN — рахунок надішлемо на email, відправимо після зарахування оплати.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="w-trust" className="bg-bg-alt py-(--section-y-md)">
        <div className="mx-auto grid max-w-(--container-wide) gap-8 px-4 md:grid-cols-2 lg:px-12">
          <div className="flex flex-col gap-4 text-body-lg text-text-body">
            <h2 id="w-trust" className="text-h1 text-text-primary">Напряму від виробника</h2>
            <p>Цех — у селі Яворів Косівського району, яке називають столицею ліжникарства. Там само працює магазин: вироби можна побачити наживо.</p>
            <p>Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.</p>
            <p className="text-body">Кожен товар у каталозі підписаний: «Власне виробництво» або «Від партнерів».</p>
            <div className="flex flex-wrap gap-4 text-body">
              <Link to={path.seg(locale, 'production')} className="text-text-primary underline">Як ми виробляємо <span className="vk-arrow" aria-hidden="true">→</span></Link>
              <Link to={path.seg(locale, 'reviews')} className="text-text-primary underline">Відгуки покупців <span className="vk-arrow" aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className={box}>
            <h2 className="text-h3 text-text-primary">Питання щодо опту</h2>
            {BUSINESS.contactPeople.map((p) => {
              const l = contactLinks(p.phone);
              return (
                <p key={p.name} className="flex flex-wrap gap-3 text-body">
                  <span className="w-16 text-text-muted">{p.name}</span>
                  {l ? <a href={l.tel} className="font-semibold text-text-primary">{p.phone}</a> : <span className="text-text-muted">{p.phone}</span>}
                </p>
              );
            })}
            <div className="text-text-primary"><Messengers /></div>
            <a href={`mailto:${BUSINESS.publicEmail}`} className="self-start text-body text-text-primary underline">{BUSINESS.publicEmail}</a>
          </div>
        </div>
      </section>
    </>
  );
}

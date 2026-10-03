import { Link, useParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS, BUSINESS_EN, contactLinks, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { path } from '@/lib/segments';
import { Messengers } from '@/components/contact/Messengers';
import { SpecialDayNote } from '@/components/contact/SpecialDayNote';
import mapPreview from '@/features/home/art/map-preview.svg?url';
import mapPreviewEn from '@/features/home/art/map-preview-en.svg?url';
import type { Route } from './+types/contacts';
import { localeOf, originOf, pageMeta, titled } from '@/lib/seo';

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    return pageMeta({
      title: titled('Contacts and the way to our workshop', locale),
      description: `${BUSINESS_EN.brand} workshop and shop: ${BUSINESS_EN.street}, Yavoriv village, Kosiv district, near Kosiv. Directions, opening hours, phone, messengers.`,
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: titled('Контакти й дорога до майстерні в Яворові'),
    description: 'Майстерня й магазин Вівчарика: вул. Петруші, 1, с. Яворів, Косівський р-н, неподалік Косова. Як доїхати, години роботи, телефон і месенджери.',
    origin: originOf(matches),
  });
}

// The map is a static image of the styled map plus a link (round 13): no Google API, no cookies
// until the visitor follows it. The link searches the village until the exact address is known.

const box = 'flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-6';

/** The contact person's name in Latin script on English pages (the panel stores it in Ukrainian). */
const personName = (name: string, en: boolean) => (en && name === 'Іван' ? 'Ivan' : name);

export default function Contacts() {
  const biz = useBusiness();
  const { locale = 'uk' } = useParams();
  const l = locale as Locale;
  const en = l === 'en';
  const address = (
    <address className="not-italic text-body text-text-body">
      {isPlaceholder(BUSINESS.factoryAddress) ? biz.locality : biz.factoryAddress}
      {isPlaceholder(BUSINESS.factoryAddress) && <span className="block text-caption text-text-muted">{BUSINESS.factoryAddress}</span>}
    </address>
  );
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 py-(--section-y-sm) lg:px-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 text-text-primary">{en ? 'Contacts' : 'Контакти'}</h1>
        <p className="max-w-[60ch] text-body-lg text-text-body">{en ? `The shop and the workshop are in one place, in ${biz.locality}.` : `Магазин і виробництво в одному місці — у ${biz.locality}.`} {biz.hoursText} <SpecialDayNote locale={l} /></p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <section className={box} aria-labelledby="c-phones">
            <h2 id="c-phones" className="text-h3 text-text-primary">{en ? 'Phone' : 'Телефони'}</h2>
            {biz.contactPeople.map((p) => {
              const links = contactLinks(p.phone);
              return (
                <div key={p.name} className="flex flex-wrap items-center gap-3">
                  <span className="w-16 text-body text-text-muted">{personName(p.name, en)}</span>
                  {links
                    ? <a href={links.tel} className="text-h4 font-semibold text-text-primary">{p.phone}</a>
                    : <span className="text-body text-text-muted">{p.phone}</span>}
                </div>
              );
            })}
            <h3 className="mt-2 text-body font-semibold text-text-primary">{en ? 'Messengers' : 'Месенджери'}</h3>
            <div className="text-text-primary"><Messengers /></div>
            <a href={`mailto:${biz.publicEmail}`} className="self-start text-body text-text-primary underline">{biz.publicEmail}</a>
          </section>

          <section className={box} aria-labelledby="c-visit">
            {en ? (
              <>
                <h2 id="c-visit" className="text-h3 text-text-primary">Visit us</h2>
                <p className="text-body text-text-body">There is a shop at the workshop, where you can see the pieces in person. {biz.hoursText} If you would like Ivan to show you the workshop, please call ahead.</p>
                <p className="text-body text-text-body">You can look round the workshop together with the owner: arrange a time by phone.</p>
                <p className="text-body text-text-body"><Link to={path.seg(l, 'production')} className="text-text-primary underline">How we make it</Link>: every stage in turn.</p>
              </>
            ) : (
              <>
                <h2 id="c-visit" className="text-h3 text-text-primary">Приїздіть</h2>
                <p className="text-body text-text-body">При цеху працює магазин: вироби можна побачити наживо. {biz.hoursText} Щоб Іван показав виробництво, зателефонуйте заздалегідь.</p>
                {/* Round 9 part 5 #4: tours have no page of their own; they are mentioned here and arranged by phone. */}
                <p className="text-body text-text-body">Цех можна оглянути разом із власником — домовтеся про час телефоном.</p>
                <p className="text-body text-text-body"><Link to={path.seg(l, 'production')} className="text-text-primary underline">Як ми виробляємо</Link> — усі етапи по черзі.</p>
              </>
            )}
          </section>
        </div>

        <section className={box} aria-labelledby="c-map">
          <h2 id="c-map" className="text-h3 text-text-primary">{en ? 'How to get here' : 'Як доїхати'}</h2>
          {/* G094, G149: the way there in plain words; landmarks wait for Іван (checklist). */}
          {en
            ? <p className="text-body text-text-body">Yavoriv is a village in Kosiv district, Ivano-Frankivsk region, not far from the town of Kosiv. The workshop and the shop are in one place, at the address below. {biz.hoursText} Give us a call before you set off and we will tell you how to drive up to us.</p>
            : <p className="text-body text-text-body">Яворів — село в Косівському районі Івано-Франківської області, неподалік Косова. Майстерня й магазин — в одному місці, за адресою нижче. {biz.hoursText} Перед приїздом зателефонуйте — підкажемо, як під’їхати.</p>}
          {address}
          {/* The drawn preview from the canvas board until the static styled map image exists (round 13 N7). */}
          <img src={locale === 'en' ? mapPreviewEn : mapPreview} alt="" aria-hidden="true" width={700} height={340} loading="lazy" className="aspect-[4/3] w-full rounded-md border border-border-hairline object-cover" />
          <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="self-start rounded-lg bg-bg-inverted px-5 py-3 text-body font-semibold text-text-on-inverted">{en ? 'Get directions in Google Maps' : 'Прокласти маршрут у Google Maps'} ↗</a>
        </section>
      </div>
    </div>
  );
}

import { Link, useParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS, contactLinks, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { path } from '@/lib/segments';
import { Messengers } from '@/components/contact/Messengers';
import mapPreview from '@/features/home/art/map-preview.svg?url';

export function meta() {
  const title = `Контакти — ${BUSINESS.brand}`;
  return [{ title }, { name: 'description', content: `Магазин і виробництво в ${BUSINESS.locality}. Телефони, месенджери, як доїхати.` }, { property: 'og:title', content: title }];
}

// The map is a static image of the styled map plus a link (round 13): no Google API, no cookies
// until the visitor follows it. The link searches the village until the exact address is known.

const box = 'flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-6';

export default function Contacts() {
  const biz = useBusiness();
  const { locale = 'uk' } = useParams();
  const l = locale as Locale;
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 py-(--section-y-sm) lg:px-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 text-text-primary">Контакти</h1>
        <p className="max-w-[60ch] text-body-lg text-text-body">Магазин і виробництво в одному місці — у {BUSINESS.locality}. {biz.hoursText}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <section className={box} aria-labelledby="c-phones">
            <h2 id="c-phones" className="text-h3 text-text-primary">Телефони</h2>
            {biz.contactPeople.map((p) => {
              const links = contactLinks(p.phone);
              return (
                <div key={p.name} className="flex flex-wrap items-center gap-3">
                  <span className="w-16 text-body text-text-muted">{p.name}</span>
                  {links
                    ? <a href={links.tel} className="text-h4 font-semibold text-text-primary">{p.phone}</a>
                    : <span className="text-body text-text-muted">{p.phone}</span>}
                </div>
              );
            })}
            <h3 className="mt-2 text-body font-semibold text-text-primary">Месенджери</h3>
            <div className="text-text-primary"><Messengers /></div>
            <a href={`mailto:${biz.publicEmail}`} className="self-start text-body text-text-primary underline">{biz.publicEmail}</a>
          </section>

          <section className={box} aria-labelledby="c-visit">
            <h2 id="c-visit" className="text-h3 text-text-primary">Приїздіть</h2>
            <p className="text-body text-text-body">При цеху працює магазин: вироби можна побачити наживо. {biz.hoursText} Щоб Іван показав виробництво, зателефонуйте заздалегідь.</p>
            {/* Round 9 part 5 #4: tours have no page of their own; they are mentioned here and arranged by phone. */}
            <p className="text-body text-text-body">Цех можна оглянути разом із власником — домовтеся про час телефоном.</p>
            <p className="text-body text-text-body"><Link to={path.seg(l, 'production')} className="text-text-primary underline">Як ми виробляємо</Link> — усі етапи по черзі.</p>
          </section>
        </div>

        <section className={box} aria-labelledby="c-map">
          <h2 id="c-map" className="text-h3 text-text-primary">Як доїхати</h2>
          <address className="not-italic text-body text-text-body">
            {isPlaceholder(BUSINESS.factoryAddress) ? BUSINESS.locality : BUSINESS.factoryAddress}
            {isPlaceholder(BUSINESS.factoryAddress) && <span className="block text-caption text-text-muted">{BUSINESS.factoryAddress}</span>}
          </address>
          {/* The drawn preview from the canvas board until the static styled map image exists (round 13 N7). */}
          <img src={mapPreview} alt="" aria-hidden="true" width={700} height={340} loading="lazy" className="aspect-[4/3] w-full rounded-md border border-border-hairline object-cover" />
          <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="self-start rounded-lg bg-bg-inverted px-5 py-3 text-body font-semibold text-text-on-inverted">Прокласти маршрут у Google Maps ↗</a>
        </section>
      </div>
    </div>
  );
}

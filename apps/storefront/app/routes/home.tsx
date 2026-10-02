import { Fragment, useState, type ReactNode } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale, ProductListItem } from '@vivcharyk/schemas';
import { BUSINESS, contactLinks, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/home';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { HeroScene } from '@/features/home/HeroScene';
import meadowEdge from '@/features/home/art/meadow-edge.svg?raw';
import mapPreview from '@/features/home/art/map-preview.svg?raw';
import { Band, BandTitle, type Tone } from '@/features/home/Band';
import { ProductionPath, type HomeStage } from '@/features/home/ProductionPath';
import { IconHut, IconMeasure, IconStar } from '@/features/home/TrustIcons';
import { categoryArt } from '@/features/home/categoryArt';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { Messengers } from '@/components/contact/Messengers';
import { HomeBanners, type HomeBanner } from '@/features/home/HomeBanners';
import type { loader as layoutLoader } from './locale-layout';

interface Collection { key: string; slug: string; name: string; products: number }
interface ReviewSummary { count: number; average: number | null }

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  // Homepage rails are own manufacture only; the endpoint enforces it (26 §26.10.1, D3.5).
  const [{ data }, cols, stages, reviews, banners] = await Promise.all([
    apiGet<{ items: ProductListItem[] }>('/products/featured', locale),
    apiGet<{ items: Collection[] }>('/collections', locale),
    apiGet<{ items: HomeStage[] }>('/production/stages', locale),
    apiGet<{ summary: ReviewSummary }>('/reviews?perPage=1', locale),
    apiGet<{ items: HomeBanner[] }>('/site/banners', locale).catch(() => ({ data: { items: [] as HomeBanner[] } })),
  ]);
  return {
    locale, hits: data.items, collections: cols.data.items.filter((c) => c.products > 0),
    stages: stages.data.items, reviews: reviews.data.summary, banners: banners.data.items,
  };
}

export function meta() {
  return [{ title: `${BUSINESS.brand} — ${BUSINESS.tagline}` }, { name: 'description', content: BUSINESS.tagline }];
}

const YARN_KEY = 'priazha-ta-rukodillia';
const findKey = (nodes: CategoryNode[], key: string): CategoryNode | undefined =>
  nodes.find((c) => c.key === key) ?? nodes.flatMap((c) => c.children).find((c) => c.key === key);

/** The wool thread drawn round a category circle (36 §36.3.3, `draw` mode). */
function Thread() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute -inset-2 size-[calc(100%+1rem)] -rotate-90">
      <path className="vk-ring" pathLength={1} d="M50 2.5a47.5 47.5 0 1 1-.1 0" fill="none" stroke="var(--c-forest-700)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Circle({ c, locale }: { c: CategoryNode; locale: Locale }) {
  const art = categoryArt(c.key);
  return (
    <Link to={path.category(locale, c.slug)} className="group flex w-36 flex-col items-center gap-3 text-center sm:w-44">
      {/* The circle and its thread lift together. */}
      <span className="relative transition-transform duration-(--dur-base) group-hover:-translate-y-1">
      <Thread />
      {art
        ? <span className="grid size-32 place-items-center rounded-full border border-border-hairline bg-bg-surface p-5 sm:size-40" dangerouslySetInnerHTML={{ __html: art }} />
        : <span className="grid size-32 place-items-center rounded-full border-2 border-dashed border-border-control bg-bg-surface text-caption text-text-muted sm:size-40">ілюстрація</span>}
      </span>
      <span className="text-body-lg font-semibold text-text-primary">{c.name}</span>
    </Link>
  );
}

// Round 10 part 2 #7–8: four circles + «Усі категорії», editable in the admin (★ на головній).
function Categories({ categories, locale, banners }: { categories: CategoryNode[]; locale: Locale; banners: HomeBanner[] }) {
  const [all, setAll] = useState(false);
  const featured = (categories.some((c) => c.isFeatured) ? categories.filter((c) => c.isFeatured) : categories).slice(0, 4);
  const rest = categories.filter((c) => !featured.includes(c));
  return (
    <section className="relative bg-bg-page pb-(--section-y-sm) pt-24">
      {/* The meadow runs on past the hero as a grassy hill edge (round 11 hill transitions, round 17 B7). */}
      <div className="pointer-events-none absolute inset-x-0 -top-0.5 h-[66px]" dangerouslySetInnerHTML={{ __html: meadowEdge }} />
      {/* D27: the panel's banners, right under the hero. */}
      <HomeBanners items={banners} />
      <div className="mx-auto flex max-w-(--container-wide) flex-wrap justify-center gap-x-6 gap-y-8 px-4 lg:gap-x-14">
        {featured.map((c) => <Circle key={c.id} c={c} locale={locale} />)}
        {all && rest.map((c) => <Circle key={c.id} c={c} locale={locale} />)}
        {rest.length > 0 && !all && (
          <button type="button" onClick={() => setAll(true)} className="group flex w-36 flex-col items-center gap-3 text-center sm:w-44">
            <span className="relative transition-transform duration-(--dur-base) group-hover:-translate-y-1"><Thread /><span className="grid size-32 place-items-center rounded-full bg-bg-inverted text-text-on-inverted sm:size-40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>
            </span></span>
            <span className="text-body-lg font-semibold text-text-primary">Усі категорії</span>
          </button>
        )}
      </div>
    </section>
  );
}

function Trust({ label, text, icon }: { label: ReactNode; text: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      {icon}
      <span className="text-h4 text-text-primary">{label}</span>
      <span className="text-body text-text-muted">{text}</span>
    </div>
  );
}

const google = (label: ReactNode) => isPlaceholder(BUSINESS.googleProfileUrl) ? label : <a href={BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="hover:underline">{label}</a>;

export default function Home() {
  const biz = useBusiness();
  const { locale, hits, collections, stages, reviews, banners } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const categories = layout?.categories ?? [];
  const first = categories[0];
  const yarn = findKey(categories, YARN_KEY);
  const phone = biz.contactPeople[0].phone;
  const tel = contactLinks(phone)?.tel;

  // Round 10 part 2, resulting order. Sections without content are skipped; the peach/cream
  // alternation is assigned after that so two neighbours never share a colour.
  const sections: Array<[string, (tone: Tone, hill: number) => ReactNode]> = [];

  if (stages.length > 0) sections.push(['production', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-10">
      <div className="flex flex-col gap-2.5">
        <BandTitle className="text-h1">Від сирої вовни до готового виробу</BandTitle>
        <p className="max-w-[60ch] text-body-lg text-text-muted">Кожен етап — у нашій майстерні в Яворові.</p>
      </div>
      <ProductionPath stages={stages} locale={locale} />
    </Band>
  )]);

  if (hits.length > 0) sections.push(['hits', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <BandTitle>Хіти продажу</BandTitle>
        {first && <Link to={path.category(locale, first.slug)} className="text-body font-semibold text-text-primary underline">Весь каталог <span className="vk-arrow" aria-hidden="true">→</span></Link>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {hits.slice(0, 4).map((p) => <ProductCard key={p.id} item={p} locale={locale} />)}
      </div>
    </Band>
  )]);

  // Round 10 part 2 #13: four points; inspection before payment and returns live on the PDP.
  sections.push(['trust', (tone, hill) => (
    <Band tone={tone} hill={hill} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <Trust icon={<IconHut />} label="Власне виробництво" text="Від сирої вовни до готового виробу — у Яворові." />
      <Trust icon={
        <span className="relative flex h-[58px] w-fit items-end text-display-md leading-none text-text-primary">30+
          {/* Round 11 #61: the number stays still; a wool thread draws underneath it. */}
          <svg data-draw viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-3 left-0 h-2.5 w-full">
            <path className="vk-draw" pathLength={1} d="M2 6q12-5 24 0t24 0 24 0 24 0" fill="none" stroke="#B3261E" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>} label="років" text={BUSINESS.tagline} />
      <Trust icon={<IconMeasure />} label="Під ваш розмір" text="Окремі вироби виготовляємо за вашими мірками — виготовлення 14 днів." />
      <Trust icon={<IconStar />} label={google(`${BUSINESS.googleRating} у Google`)} text={`${BUSINESS.googleReviewCount} відгуків покупців.`} />
    </Band>
  )]);

  // Round 10 part 2 #15: the yarn and needlework block.
  if (yarn) sections.push(['yarn', (tone, hill) => (
    <Band tone={tone} hill={hill} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <img src="/home/yarn-2474aab736-960.webp" srcSet="/home/yarn-2474aab736-480.webp 480w, /home/yarn-2474aab736-960.webp 960w, /home/yarn-2474aab736-1600.webp 1600w"
        sizes="(min-width: 768px) 50vw, 100vw" width={1600} height={1200} loading="lazy" decoding="async"
        alt="Мотки й бобіни вовняної пряжі та ровниця з нашої майстерні" className="aspect-[4/3] w-full rounded-xl object-cover" />
      <div className="flex flex-col items-start gap-4">
        <span className="text-overline uppercase text-text-muted">Для рукоділля</span>
        <BandTitle>Пряжа з нашої майстерні</BandTitle>
        <p className="max-w-[48ch] text-body-lg text-text-body">Пряжу прядемо самі з місцевої карпатської вовни: кручена пряжа й рівниця сучена. Метраж і товщину вказуємо на кожному мотку.</p>
        <Link to={path.category(locale, yarn.slug)} className="rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted">Обрати пряжу <span className="vk-arrow" aria-hidden="true">→</span></Link>
      </div>
    </Band>
  )]);

  // Round 10 part 2 #18 / round 11 #65: three cards in a row, stacked on phones. The rotating
  // photographs (round 11) arrive with the photo shoot.
  if (collections.length > 0) sections.push(['collections', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-7">
      <BandTitle>Добірки</BandTitle>
      <div className="grid gap-5 md:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.key} to={`${path.seg(locale, 'collections')}/${c.slug}`} className="group flex flex-col gap-3">
            <span className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-xl">
              {[1, 2, 3, 4].map((n) => <span key={n} className="grid place-items-center border border-dashed border-border-control bg-bg-surface text-caption text-text-muted">фото {n}</span>)}
            </span>
            <span className="text-h4 text-text-primary group-hover:underline">{c.name}</span>
          </Link>
        ))}
      </div>
    </Band>
  )]);

  // Round 10 part 2 #21 / round 13: the Google rating badge; the video row stays hidden until
  // there are at least three video reviews (none can be uploaded before the media module).
  sections.push(['reviews', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <BandTitle>Відгуки покупців</BandTitle>
        <Link to={path.seg(locale, 'reviews')} className="text-body font-semibold text-text-primary underline">Читати всі відгуки <span className="vk-arrow" aria-hidden="true">→</span></Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="rounded-xl border border-border-hairline bg-bg-surface px-5 py-3 text-body text-text-body">{google(<><strong className="text-text-primary">{BUSINESS.googleRating} ★</strong> у Google · читати відгуки</>)}</span>
        {reviews.count > 0 && reviews.average !== null && (
          <Link to={path.seg(locale, 'reviews')} className="rounded-xl border border-border-hairline bg-bg-surface px-5 py-3 text-body text-text-body hover:underline">
            <strong className="text-text-primary">{reviews.average.toLocaleString('uk-UA')} ★</strong> на сайті · {reviews.count} {reviews.count === 1 ? 'відгук' : 'відгуків'}
          </Link>
        )}
      </div>
    </Band>
  )]);

  // Round 10 part 2 #21, round 13 N7: a static image of the styled map + «Відкрити в Google Maps».
  // Until that image exists, the canvas board's drawn preview stands in.
  sections.push(['visit', (tone, hill) => (
    <Band tone={tone} hill={hill} className="grid items-center gap-8 md:grid-cols-[1fr_1.3fr] md:gap-14">
      <div className="flex flex-col items-start gap-4">
        <BandTitle>Приїжджайте до нас у Яворів</BandTitle>
        <p className="text-body-lg text-text-muted">Магазин і майстерня в одному місці. {biz.hoursText} Зателефонуйте перед візитом — і Іван покаже виробництво.</p>
        <p className="text-body-lg text-text-body">{isPlaceholder(BUSINESS.factoryAddress) ? BUSINESS.locality : BUSINESS.factoryAddress}</p>
        <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg border-2 border-text-primary px-6 py-3 text-body font-semibold text-text-primary">Прокласти маршрут</a>
      </div>
      <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border-hairline">
        <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: mapPreview }} />
        <div className="absolute left-4 top-4 flex w-52 flex-col gap-1.5 rounded-xl bg-[#FFFFFF] px-4 py-3.5 shadow-lg">
          <span className="font-wordmark text-[1.875rem] leading-none text-[#1F3A2E]">{BUSINESS.brand}</span>
          <span className="text-caption text-[#5E5B54]">{BUSINESS.locality}</span>
          <span className="text-caption text-[#33312C]"><strong className="text-[#1F3A2E]">{BUSINESS.googleRating} ★</strong> · {BUSINESS.googleReviewCount} відгуків</span>
          <a href={isPlaceholder(BUSINESS.googleProfileUrl) ? BUSINESS.mapsUrl : BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="mt-1 text-body-sm font-semibold text-[#1F3A2E] underline">Google Maps <span className="vk-arrow" aria-hidden="true">→</span></a>
        </div>
      </div>
    </Band>
  )]);

  // Round 10 part 2 #22: the closing block — phone and messengers.
  sections.push(['contact', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col items-center gap-5 pb-8 text-center">
      <BandTitle>Маєте питання? Напишіть або зателефонуйте</BandTitle>
      {tel
        ? <a href={tel} className="text-display-md text-text-primary">{phone}</a>
        : <span className="text-h2 text-text-muted">{phone}</span>}
      <Messengers />
    </Band>
  )]);

  return (
    <>
      <HeroScene locale={locale} catalogHref={first ? path.category(locale, first.slug) : path.home(locale)} />
      <Categories categories={categories} locale={locale} banners={banners} />
      {sections.map(([key, render], i) => <Fragment key={key}>{render(i % 2 === 0 ? 'alt' : 'page', i)}</Fragment>)}
    </>
  );
}

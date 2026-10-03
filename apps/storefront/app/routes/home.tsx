import { Fragment, useState, type ReactNode } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale, ProductListItem, ProductListResponse } from '@vivcharyk/schemas';
import { BUSINESS, BUSINESS_EN, contactLinks, isPlaceholder } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/home';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { HeroScene } from '@/features/home/HeroScene';
import meadowEdge from '@/features/home/art/meadow-edge.svg?raw';
// G039: the map drawings (34 KB each) are files the browser fetches when the block nears the screen, not page HTML.
import mapPreview from '@/features/home/art/map-preview.svg?url';
import mapPreviewEn from '@/features/home/art/map-preview-en.svg?url';
import { Band, BandTitle, type Tone } from '@/features/home/Band';
import { ProductionPath, type HomeStage } from '@/features/home/ProductionPath';
import { IconHut, IconMeasure, IconStar } from '@/features/home/TrustIcons';
import { categoryArt } from '@/features/home/categoryArt';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { Messengers } from '@/components/contact/Messengers';
import { HomeBanners, type HomeBanner } from '@/features/home/HomeBanners';
import type { loader as layoutLoader } from './locale-layout';
import { localeOf, originOf, pageMeta, plural, priceRangeText } from '@/lib/seo';
import { t } from '@/lib/i18n';

interface Collection { key: string; slug: string; name: string; products: number }
interface ReviewSummary { count: number; average: number | null }

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  // Homepage rails are own manufacture only; the endpoint enforces it (26 §26.10.1, D3.5).
  const [{ data }, cols, stages, reviews, banners, all] = await Promise.all([
    apiGet<{ items: ProductListItem[] }>('/products/featured', locale),
    apiGet<{ items: Collection[] }>('/collections', locale),
    apiGet<{ items: HomeStage[] }>('/production/stages', locale),
    apiGet<{ summary: ReviewSummary }>('/reviews?perPage=1', locale),
    apiGet<{ items: HomeBanner[] }>('/site/banners', locale).catch(() => ({ data: { items: [] as HomeBanner[] } })),
    // G110: the whole catalogue's price range, for the Store's priceRange.
    apiGet<ProductListResponse>('/products', locale, { perPage: '1' }).then((r) => r.data.priceRange).catch(() => null),
  ]);
  return {
    locale, hits: data.items, collections: cols.data.items.filter((c) => c.products > 0),
    stages: stages.data.items, reviews: reviews.data.summary, banners: banners.data.items,
    seo: all ? { priceRange: priceRangeText(all.minMinor, all.maxMinor, locale === 'en' ? 'en' : 'uk') } : {},
  };
}

// G051: the title names the product people search for; the wordmark stays the H1 (round 17 B1).
export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    return pageMeta({
      title: 'Hutsul lizhnyk wool blankets from the Carpathians — Vivcharyk',
      description: `Hutsul lizhnyks, rugs and runners made of sheep’s wool in our workshop in ${BUSINESS_EN.locality}. Delivery within Ukraine.`,
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: 'Гуцульські ліжники з овечої вовни — Вівчарик',
    description: `${BUSINESS.tagline} Ліжники, килими й доріжки з нашої майстерні в с. Яворів, Косівський р-н. Доставка по Україні.`,
    origin: originOf(matches),
  });
}

/** Round 24 G004–G005, G083: a category without products is not offered (count from the tree, when the API sends it). */
const hasProducts = (c: CategoryNode) => (c as CategoryNode & { productCount?: number }).productCount !== 0;
const GOOGLE_LIVE = !isPlaceholder(BUSINESS.googleProfileUrl) && !isPlaceholder(BUSINESS.googleRating) && !isPlaceholder(BUSINESS.googleReviewCount);

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
        : <span className="grid size-32 place-items-center rounded-full border border-border-hairline bg-bg-surface sm:size-40" aria-hidden="true" />}
      </span>
      <span className="text-body-lg font-semibold text-text-primary">{c.name}</span>
    </Link>
  );
}

// Round 10 part 2 #7–8: four circles + «Усі категорії», editable in the admin (★ на головній).
function Categories({ categories, locale, banners }: { categories: CategoryNode[]; locale: Locale; banners: HomeBanner[] }) {
  const [all, setAll] = useState(false);
  const live = categories.filter(hasProducts);
  const featured = (live.some((c) => c.isFeatured) ? live.filter((c) => c.isFeatured) : live).slice(0, 4);
  const rest = live.filter((c) => !featured.includes(c));
  return (
    <section className="relative bg-bg-page pb-(--section-y-sm) pt-24">
      {/* The meadow runs on past the hero as a grassy hill edge (round 11 hill transitions, round 17 B7). */}
      <div className="pointer-events-none absolute inset-x-0 -top-0.5 h-[66px]" dangerouslySetInnerHTML={{ __html: meadowEdge }} />
      {/* D27: the panel's banners, right under the hero. */}
      <HomeBanners items={banners} />
      {/* G052: a visible H2 that says what the shop sells, right under the wordmark hero. */}
      <h2 className="mx-auto mb-10 max-w-(--container-wide) px-4 text-center text-h2 text-text-primary">{locale === 'en' ? 'Lizhnyks and wool goods from the Carpathians' : 'Ліжники та вовняні вироби з Карпат'}</h2>
      <div className="mx-auto flex max-w-(--container-wide) flex-wrap justify-center gap-x-6 gap-y-8 px-4 lg:gap-x-14">
        {featured.map((c) => <Circle key={c.id} c={c} locale={locale} />)}
        {all && rest.map((c) => <Circle key={c.id} c={c} locale={locale} />)}
        {rest.length > 0 && !all && (
          <button type="button" onClick={() => setAll(true)} className="group flex w-36 flex-col items-center gap-3 text-center sm:w-44">
            <span className="relative transition-transform duration-(--dur-base) group-hover:-translate-y-1"><Thread /><span className="grid size-32 place-items-center rounded-full bg-bg-inverted text-text-on-inverted sm:size-40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>
            </span></span>
            <span className="text-body-lg font-semibold text-text-primary">{t(locale, 'nav.allCategories')}</span>
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

/** English plural for the review counts (the Ukrainian ones go through plural()). */
const reviewsWord = (n: number, en: boolean) => (en ? (n === 1 ? 'review' : 'reviews') : plural(n, 'відгук', 'відгуки', 'відгуків'));

const google = (label: ReactNode) => <a href={BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="hover:underline">{label}</a>;

/** A banner that leads to an empty category is not shown (G083). */
function bannerLive(b: HomeBanner, categories: CategoryNode[]) {
  const parts = (b.linkUrl ?? '').split('?')[0]!.split('/').filter(Boolean);
  const slug = parts.at(-1);
  const node = slug && parts.length >= 2 ? (categories.find((c) => c.slug === slug) ?? categories.flatMap((c) => c.children).find((c) => c.slug === slug)) : undefined;
  return !node || hasProducts(node);
}

export default function Home() {
  const biz = useBusiness();
  const { locale, hits, collections, stages, reviews, banners } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const categories = layout?.categories ?? [];
  const first = categories[0];
  const found = findKey(categories, YARN_KEY);
  const yarn = found && hasProducts(found) ? found : undefined;
  const en = locale === 'en';
  // The panel's banners are written in Ukrainian only; English pages leave them out (G093).
  const liveBanners = en ? [] : banners.filter((b) => bannerLive(b, categories));
  const phone = biz.contactPeople[0].phone;
  const tel = contactLinks(phone)?.tel;

  // Round 10 part 2, resulting order. Sections without content are skipped; the peach/cream
  // alternation is assigned after that so two neighbours never share a colour.
  const sections: Array<[string, (tone: Tone, hill: number) => ReactNode]> = [];

  if (stages.length > 0) sections.push(['production', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-10">
      <div className="flex flex-col gap-2.5">
        <BandTitle className="text-h1">{en ? 'From raw wool to the finished piece' : 'Від сирої вовни до готового виробу'}</BandTitle>
        <p className="max-w-[60ch] text-body-lg text-text-muted">{en ? `Every stage happens in our own workshop in ${biz.locality}.` : 'Кожен етап — у нашій майстерні в Яворові.'}</p>
      </div>
      <ProductionPath stages={stages} locale={locale} />
    </Band>
  )]);

  if (hits.length > 0) sections.push(['hits', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <BandTitle>{en ? 'Bestsellers' : 'Хіти продажу'}</BandTitle>
        {first && <Link to={path.category(locale, first.slug)} className="text-body font-semibold text-text-primary underline">{en ? 'Full catalogue' : 'Весь каталог'} <span className="vk-arrow" aria-hidden="true">→</span></Link>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {hits.slice(0, 4).map((p) => <ProductCard key={p.id} item={p} locale={locale} />)}
      </div>
    </Band>
  )]);

  // Round 10 part 2 #13: four points; inspection before payment and returns live on the PDP.
  sections.push(['trust', (tone, hill) => (
    <Band tone={tone} hill={hill} className={`grid gap-8 sm:grid-cols-2 ${GOOGLE_LIVE ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      <Trust icon={<IconHut />} label={en ? 'Our own production' : 'Власне виробництво'} text={en ? 'From raw wool to the finished piece, in Yavoriv, Kosiv district.' : 'Від сирої вовни до готового виробу — у Яворові.'} />
      <Trust icon={
        <span className="relative flex h-[58px] w-fit items-end text-display-md leading-none text-text-primary">30+
          {/* Round 11 #61: the number stays still; a wool thread draws underneath it. */}
          <svg data-draw viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-3 left-0 h-2.5 w-full">
            <path className="vk-draw" pathLength={1} d="M2 6q12-5 24 0t24 0 24 0 24 0" fill="none" stroke="#B3261E" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>} label={en ? 'years' : 'років'} text={biz.tagline} />
      <Trust icon={<IconMeasure />} label={en ? 'Made to your size' : 'Під ваш розмір'} text={en ? 'Some pieces we make to your measurements; making takes 14 days.' : 'Окремі вироби виготовляємо за вашими мірками — виготовлення 14 днів.'} />
      {/* G075: the Google rating appears only once the profile and its numbers are real. */}
      {GOOGLE_LIVE && <Trust icon={<IconStar />} label={google(en ? `${BUSINESS.googleRating} on Google` : `${BUSINESS.googleRating} у Google`)} text={en ? `${BUSINESS.googleReviewCount} customer ${reviewsWord(Number(BUSINESS.googleReviewCount), true)}.` : `${BUSINESS.googleReviewCount} ${reviewsWord(Number(BUSINESS.googleReviewCount), false)} покупців.`} />}
    </Band>
  )]);

  // Round 10 part 2 #15: the yarn and needlework block.
  if (yarn) sections.push(['yarn', (tone, hill) => (
    <Band tone={tone} hill={hill} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <img src="/home/yarn-2474aab736-960.webp" srcSet="/home/yarn-2474aab736-480.webp 480w, /home/yarn-2474aab736-960.webp 960w, /home/yarn-2474aab736-1600.webp 1600w"
        sizes="(min-width: 768px) 50vw, 100vw" width={1600} height={1200} loading="lazy" decoding="async"
        alt={en ? 'Skeins and bobbins of wool yarn and wool roving from our workshop' : 'Мотки й бобіни вовняної пряжі та ровниця з нашої майстерні'} className="aspect-[4/3] w-full rounded-xl object-cover" />
      <div className="flex flex-col items-start gap-4">
        <span className="text-overline uppercase text-text-muted">{en ? 'For needlework' : 'Для рукоділля'}</span>
        <BandTitle>{en ? 'Yarn from our workshop' : 'Пряжа з нашої майстерні'}</BandTitle>
        <p className="max-w-[48ch] text-body-lg text-text-body">{en ? 'We spin our yarn ourselves: plied yarn and twisted wool roving. The length and thickness are given for every skein.' : 'Пряжу прядемо самі: кручена пряжа й рівниця сучена. Метраж і товщину вказуємо на кожному мотку.'}</p>
        <Link to={path.category(locale, yarn.slug)} className="rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted">{en ? 'Choose yarn' : 'Обрати пряжу'} <span className="vk-arrow" aria-hidden="true">→</span></Link>
      </div>
    </Band>
  )]);

  // Round 10 part 2 #18 / round 11 #65: three cards in a row, stacked on phones. The rotating
  // photographs (round 11) arrive with the photo shoot.
  if (collections.length > 0) sections.push(['collections', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-7">
      <BandTitle>{en ? 'Collections' : 'Добірки'}</BandTitle>
      <div className="grid gap-5 md:grid-cols-3">
        {collections.map((c) => (
          // G076: no photo placeholders — the card is its name until the photos are taken.
          <Link key={c.key} to={`${path.seg(locale, 'collections')}/${c.slug}`} className="group flex items-center justify-between gap-3 rounded-xl border border-border-hairline bg-bg-surface px-5 py-5">
            <span className="flex flex-col gap-1">
              <span className="text-h4 text-text-primary group-hover:underline">{c.name}</span>
              <span className="text-body-sm text-text-muted">{t(locale, 'catalog.count', { n: c.products })}</span>
            </span>
            <span className="vk-arrow text-h4 text-text-primary" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </Band>
  )]);

  // Round 10 part 2 #21 / round 13: the Google rating badge; the video row stays hidden until
  // there are at least three video reviews (none can be uploaded before the media module).
  if (GOOGLE_LIVE || reviews.count > 0) sections.push(['reviews', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <BandTitle>{en ? 'Customer reviews' : 'Відгуки покупців'}</BandTitle>
        <Link to={path.seg(locale, 'reviews')} className="text-body font-semibold text-text-primary underline">{en ? 'Read all reviews' : 'Читати всі відгуки'} <span className="vk-arrow" aria-hidden="true">→</span></Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {GOOGLE_LIVE && <span className="rounded-xl border border-border-hairline bg-bg-surface px-5 py-3 text-body text-text-body">{google(<><strong className="text-text-primary">{BUSINESS.googleRating} ★</strong> {en ? 'on Google · read the reviews' : 'у Google · читати відгуки'}</>)}</span>}
        {reviews.count > 0 && reviews.average !== null && (
          <Link to={path.seg(locale, 'reviews')} className="rounded-xl border border-border-hairline bg-bg-surface px-5 py-3 text-body text-text-body hover:underline">
            <strong className="text-text-primary">{reviews.average.toLocaleString(en ? 'en-GB' : 'uk-UA')} ★</strong> {en ? 'on this site' : 'на сайті'} · {reviews.count} {reviewsWord(reviews.count, en)}
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
        <BandTitle>{en ? 'Come and see us in Yavoriv' : 'Приїжджайте до нас у Яворів'}</BandTitle>
        <p className="text-body-lg text-text-muted">{en ? `The shop and the workshop are in one place. ${biz.hoursText} Give us a call before you come, and Ivan will show you round the workshop.` : `Магазин і майстерня в одному місці. ${biz.hoursText} Зателефонуйте перед візитом — і Іван покаже виробництво.`}</p>
        <p className="text-body-lg text-text-body">{isPlaceholder(BUSINESS.factoryAddress) ? biz.locality : biz.factoryAddress}</p>
        <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg border-2 border-text-primary px-6 py-3 text-body font-semibold text-text-primary">{en ? 'Get directions' : 'Прокласти маршрут'}</a>
      </div>
      <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border-hairline">
        <img src={locale === 'en' ? mapPreviewEn : mapPreview} alt="" width={700} height={340} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        <div className="absolute left-4 top-4 flex w-52 flex-col gap-1.5 rounded-xl bg-[#FFFFFF] px-4 py-3.5 shadow-lg">
          <span className="font-wordmark text-[1.875rem] leading-none text-[#1F3A2E]">{biz.brand}</span>
          <span className="text-caption text-[#5E5B54]">{biz.locality}</span>
          {GOOGLE_LIVE && <span className="text-caption text-[#33312C]"><strong className="text-[#1F3A2E]">{BUSINESS.googleRating} ★</strong> · {BUSINESS.googleReviewCount} {reviewsWord(Number(BUSINESS.googleReviewCount), en)}</span>}
          <a href={isPlaceholder(BUSINESS.googleProfileUrl) ? BUSINESS.mapsUrl : BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="mt-1 text-body-sm font-semibold text-[#1F3A2E] underline">Google Maps <span className="vk-arrow" aria-hidden="true">→</span></a>
        </div>
      </div>
    </Band>
  )]);

  // Round 10 part 2 #22: the closing block — phone and messengers.
  sections.push(['contact', (tone, hill) => (
    <Band tone={tone} hill={hill} className="flex flex-col items-center gap-5 pb-8 text-center">
      <BandTitle>{en ? 'Any questions? Message us or give us a call' : 'Маєте питання? Напишіть або зателефонуйте'}</BandTitle>
      {tel
        ? <a href={tel} className="text-display-md text-text-primary">{phone}</a>
        : <span className="text-h2 text-text-muted">{phone}</span>}
      <Messengers />
    </Band>
  )]);

  return (
    <>
      <HeroScene locale={locale} catalogHref={first ? path.category(locale, first.slug) : path.home(locale)} />
      <Categories categories={categories} locale={locale} banners={liveBanners} />
      {sections.map(([key, render], i) => <Fragment key={key}>{render(i % 2 === 0 ? 'alt' : 'page', i)}</Fragment>)}
    </>
  );
}

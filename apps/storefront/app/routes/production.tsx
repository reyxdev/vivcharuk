import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { Locale, ProductListItem } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import type { Route } from './+types/production';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { mediaUrl, videoUrl } from '@/lib/media';
import { localeOf, originOf, pageMeta, titled } from '@/lib/seo';
import { Fold } from '@/features/catalog/components/CategoryText';

interface Stage {
  key: string; track: 'WOOL' | 'HIDE'; title: string; body: string; preview: boolean;
  facts: { duration: string | null; temperature: string | null; machine: string | null; person: string | null };
  photo: { publicId: string; width: number; height: number } | null;
  video: { publicId: string; width: number; height: number; durationSec: number | null } | null;
}

export async function loader({ params }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const [stages, featured] = await Promise.all([
    apiGet<{ items: Stage[] }>('/production/stages', locale),
    apiGet<{ items: ProductListItem[] }>('/products/featured', locale),
  ]);
  return { locale, stages: stages.data.items, products: featured.data.items.slice(0, 4) };
}

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    return pageMeta({
      title: titled('How we make lizhnyks, step by step', locale),
      description: 'From raw wool to the finished piece: washing, carding, spinning, weaving, felting, sewing and tanning of hides, in one workshop in Yavoriv, Kosiv district.',
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: titled('Як ми виробляємо ліжники: від вовни до виробу'),
    description: 'Від сирої вовни до готового виробу: миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — в одному цеху в с. Яворів, Косівський р-н.',
    origin: originOf(matches),
  });
}

const stagesLabelEn = (n: number) => `${n} ${n === 1 ? 'stage' : 'stages'}`;
const stagesLabel = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'етап' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'етапи' : 'етапів'}`;

const FACTS: Array<[keyof Stage['facts'], string]> = [['duration', 'Тривалість'], ['temperature', 'Температура'], ['machine', 'Машина'], ['person', 'Хто робить']];
const FACT_EN: Record<keyof Stage['facts'], string> = { duration: 'Duration', temperature: 'Temperature', machine: 'Machine', person: 'Who does it' };

/**
 * A short silent loop of the stage (round 18). Nothing is downloaded until the clip is near the
 * screen (preload none), it plays only while visible, and it never autoplays for visitors who ask for
 * less motion or save data: they get the poster and the player's own controls. Phones get the 480p
 * file, larger screens 720p; both start playing before they finish loading (faststart).
 */
function StageVideo({ s, hidden }: { s: Stage & { video: NonNullable<Stage['video']>; photo: NonNullable<Stage['photo']> }; hidden: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!nav.connection?.saveData || /2g$/.test(nav.connection?.effectiveType ?? '');
    if (quiet) { setManual(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e!.isIntersecting), { rootMargin: '200px 0px', threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  // On desktop the stages' media are stacked and crossfade: only the shown one plays (and loads).
  useEffect(() => {
    const v = ref.current;
    if (!v || manual) return;
    if (inView && !hidden) v.play().catch(() => setManual(true));
    else v.pause();
  }, [inView, hidden, manual]);
  return (
    <video ref={ref} muted loop playsInline preload="none" controls={manual} poster={mediaUrl(s.photo.publicId, 960)}
      width={s.video.width} height={s.video.height} aria-label={s.title} className="size-full object-cover">
      <source src={videoUrl(s.video.publicId, 480)} type="video/mp4" media="(max-width: 640px)" />
      <source src={videoUrl(s.video.publicId, 720)} type="video/mp4" />
    </video>
  );
}

function StageMedia({ s, hidden = false }: { s: Stage; hidden?: boolean }) {
  if (s.video && s.photo) return <StageVideo s={{ ...s, video: s.video, photo: s.photo }} hidden={hidden} />;
  if (s.photo) {
    return <img src={mediaUrl(s.photo.publicId, 960)} alt={s.title} width={s.photo.width} height={s.photo.height} loading="lazy" className="size-full object-cover" />;
  }
  // G076: no placeholder — a stage without photos is text only until the shoot.
  return null;
}
const hasMedia = (s: Stage) => !!s.photo;

function StageText({ s, n, next, en }: { s: Stage; n: number; next?: Stage; en: boolean }) {
  const facts = FACTS.filter(([k]) => s.facts[k]);
  return (
    <>
      <span className="text-overline uppercase text-text-muted">{String(n).padStart(2, '0')}</span>
      <h3 className="text-h2 text-text-primary">{s.title}</h3>
      <p className="max-w-[66ch] text-body-lg text-text-body">{s.body}</p>
      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-md border border-border-hairline bg-bg-surface p-4 text-body">
          {facts.map(([k, label]) => <Fragment key={k}><dt className="text-text-muted">{en ? FACT_EN[k] : label}</dt><dd className="text-text-primary">{s.facts[k]}</dd></Fragment>)}
        </dl>
      )}
      {next && <a href={`#${next.key}`} className="self-start text-body text-text-primary underline">{en ? 'Next' : 'Далі'} → {next.title}</a>}
    </>
  );
}

/**
 * Round 11 #57 / #71: on desktop and tablet the media column stays pinned and the stage changes as
 * the text scrolls (IntersectionObserver, opacity crossfade only); on phones stages stack, each
 * with its own media.
 */
function Chapter({ id, title, lead, stages, offset, en }: { id: string; title: string; lead: string; stages: Stage[]; offset: number; en: boolean }) {
  const [active, setActive] = useState(0);
  const media = stages.some(hasMedia);
  const refs = useRef<Array<HTMLElement | null>>([]);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [stages.length]);

  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32 py-(--section-y-sm)">
      <div className="mx-auto flex max-w-(--container-wide) flex-col gap-3 px-4 lg:px-12">
        <h2 id={`${id}-h`} className="text-h1 text-text-primary">{title}</h2>
        <p className="max-w-[66ch] text-body-lg text-text-body">{lead}</p>
      </div>
      <div className={`mx-auto mt-10 grid max-w-(--container-wide) gap-10 px-4 lg:px-12 ${media ? 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''}`}>
        {media && <div className="sticky top-32 hidden aspect-[4/5] max-h-[calc(100dvh-10rem)] self-start overflow-hidden rounded-md md:block">
          {stages.map((s, i) => (
            <div key={s.key} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}>
              <StageMedia s={s} hidden={i !== active} />
            </div>
          ))}
          <ol className="absolute left-4 top-4 flex flex-col gap-2" aria-hidden="true">
            {stages.map((s, i) => <li key={s.key} className={`size-2.5 rounded-full border border-text-primary ${i === active ? 'bg-text-primary' : 'bg-bg-page'}`} />)}
          </ol>
        </div>}
        <div className="flex flex-col">
          {stages.map((s, i) => (
            <article key={s.key} id={s.key} data-i={i} ref={(el) => { refs.current[i] = el; }} className={`flex scroll-mt-32 flex-col gap-4 py-8 ${media ? 'md:min-h-[70dvh] md:justify-center' : ''}`}>
              {hasMedia(s) && <div className="aspect-[4/5] overflow-hidden rounded-md md:hidden"><StageMedia s={s} /></div>}
              <StageText s={s} n={offset + i + 1} next={stages[i + 1]} en={en} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Production() {
  const biz = useBusiness();
  const { locale, stages, products } = useLoaderData<typeof loader>();
  const wool = stages.filter((s) => s.track === 'WOOL');
  const hide = stages.filter((s) => s.track === 'HIDE');
  const sewing = wool.find((s) => s.key === 'sewing');
  const phone = biz.phones[0];
  const en = locale === 'en';

  return (
    <>
      <section className="bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <span className="text-overline uppercase opacity-80">{en ? 'Production' : 'Виробництво'} · {biz.locality}</span>
          <h1 className="max-w-[18ch] text-display-lg">{en ? 'From raw wool to the finished piece' : 'Від сирої вовни до готового виробу'}</h1>
          <p className="max-w-[48ch] text-body-lg opacity-90">{biz.tagline}</p>
        </div>
      </section>

      {en ? (
        <section className="mx-auto flex max-w-(--container-narrow) flex-col gap-4 px-4 py-(--section-y-sm) text-body-lg text-text-body">
          <p>Everything shown on this page we do ourselves, in one workshop in Yavoriv: we wash, card, spin, weave, felt and sew the wool, and we also tan sheep hides.</p>
          <p>Below is each stage in turn, described in the words used for it in the workshop.</p>
          <div className="border-t border-border-hairline text-body-lg">
            <Fold title="More details: the whole path in one paragraph">
              <p>{biz.brand} makes wool goods in one workshop in Yavoriv village, Kosiv district, Ivano-Frankivsk region. The path of the wool from raw to finished piece has six stages: washing, carding, spinning, weaving, felting and sewing. First we wash the raw wool so the water takes away the dirt and grease. We card the dry wool on a machine into wool roving, a continuous strip of parallel fibres. From the roving we spin yarn of the right thickness, and from the yarn we weave cloth on a loom for lizhnyks, throws, belts or clothing. We felt the woven cloth: the wool becomes denser, the pile rises, and the lizhnyk turns thick and fluffy. Finally we finish the edges and sew hunias, waistcoats, cushions and slippers. Separately, we tan sheep hides, from raw hide to soft sheepskin and leather. Our raw material, raw and dyed wool, we buy in: we do not keep our own flock.</p>
            </Fold>
          </div>
        </section>
      ) : (
        <section className="mx-auto flex max-w-(--container-narrow) flex-col gap-4 px-4 py-(--section-y-sm) text-body-lg text-text-body">
          <p>Усе, що показано на цій сторінці, ми робимо самі, в одному цеху в Яворові: перемо, чешемо, прядемо, тчемо, валяємо й шиємо вовну, а ще вичинюємо овечі шкури.</p>
          <p>Нижче — кожен етап по черзі, тими словами, якими про нього говорять у цеху.</p>
          {/* G153–G154: one passage that can be quoted whole; folded, so the page stays short. */}
          <div className="border-t border-border-hairline text-body-lg">
            <Fold title="Детальніше: увесь шлях одним абзацом">
              <p>Вівчарик виробляє вовняні вироби в одному цеху в селі Яворів Косівського району Івано-Франківської області. Шлях вовни від сирої до готового виробу має шість етапів: миття, чесання, прядіння, ткання, валяння й пошиття. Спершу сиру вовну перемо, щоб вода забрала бруд і жир. Суху вовну чешемо на машині в рівницю — безперервну стрічку паралельних волокон. З рівниці прядемо нитку потрібної товщини, а з неї на ткацькому верстаті тчемо полотно для ліжників, пледів, поясів чи одягу. Виткане полотно валяємо: вовна ущільнюється, ворс піднімається, і ліжник стає густим і пухнастим. Наостанок обробляємо краї й шиємо гуні, камізельки, подушки й капці. Окремо вичинюємо овечі шкури — від сирої шкури до м’якої овчини й шкіри. Сировину — сиру й фарбовану вовну — ми купуємо: власної отари не маємо.</p>
            </Fold>
          </div>
        </section>
      )}

      {/* Track switch: two chapters of one document, never tabs that hide content (20 §20.2). */}
      <nav aria-label={en ? 'Production sections' : 'Розділи виробництва'} className="sticky top-16 z-(--z-sticky) border-y border-border-hairline bg-bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-(--container-wide) gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] lg:px-12">
          <a href="#vovna" className="shrink-0 rounded-full border border-border-control px-4 py-1.5 text-body-sm font-semibold text-text-primary">{en ? 'Wool' : 'Вовна'}<span className="max-sm:hidden"> · {en ? stagesLabelEn(wool.length) : stagesLabel(wool.length)}</span></a>
          {hide.length > 0 && <a href="#shkura" className="shrink-0 rounded-full border border-border-control px-4 py-1.5 text-body-sm font-semibold text-text-primary">{en ? 'Hides' : 'Шкура'}<span className="max-sm:hidden">{en ? ' and sheepskin' : ' та овчина'}</span></a>}
          <a href="#pryizdit" className="shrink-0 rounded-full px-4 py-1.5 text-body-sm text-text-body">{en ? 'Visit us' : 'Приїздіть'}</a>
        </div>
      </nav>

      {wool.length > 0 && (en
        ? <Chapter id="vovna" title="Wool" lead="We use several grades of wool: each piece needs its own fibre thickness. We spin our yarn ourselves. The path of the wool runs from washing to a finished lizhnyk, throw, garment or skein of yarn." stages={wool} offset={0} en />
        : <Chapter id="vovna" title="Вовна" lead="Вовна — кількох сортів: для кожного виробу своя товщина волокна. Пряжу прядемо самі. Шлях вовни — від миття до готового ліжника, пледа, одягу чи мотка пряжі." stages={wool} offset={0} en={false} />)}

      {hide.length > 0 && (
        <>
          {en
            ? <Chapter id="shkura" title="Hides and sheepskin" lead="A separate path for sheep hides: they become sheepskins and leather goods." stages={hide} offset={wool.length} en />
            : <Chapter id="shkura" title="Шкура та овчина" lead="Окремий шлях для овечих шкур: з них виходять овчини та шкіряні вироби." stages={hide} offset={wool.length} en={false} />}
          {sewing && (
            <p className="mx-auto max-w-(--container-wide) px-4 pb-(--section-y-sm) text-body-lg text-text-body lg:px-12">
              {en
                ? <>From there, sheepskin and leather go the same way as the wool: to <a href="#sewing" className="text-text-primary underline">sewing</a>, in the same workshop.</>
                : <>Далі овчина й шкіра йдуть туди ж, куди й вовна, — на <a href="#sewing" className="text-text-primary underline">пошиття</a>, у той самий цех.</>}
            </p>
          )}
        </>
      )}

      {/* Round 9: no separate tour page; visiting and directions live on the contacts page. */}
      <section id="pryizdit" className="scroll-mt-32 bg-bg-inverted text-text-on-inverted">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-5 px-4 py-(--section-y-md) lg:px-12">
          <h2 className="max-w-[22ch] text-h1">{en ? 'Come and visit: the shop and the workshop in one place' : 'Приїздіть: магазин і виробництво в одному місці'}</h2>
          <p className="max-w-[56ch] text-body-lg opacity-90">{en ? 'In Yavoriv there is a shop at the workshop, where you can see and touch the pieces.' : 'У Яворові при цеху працює магазин — вироби можна побачити й помацати.'} {biz.hoursText}</p>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="rounded-lg bg-bg-page px-6 py-3.5 text-body-lg font-semibold text-text-primary">{en ? 'Call' : 'Подзвонити'} {phone}</a>
            <Link to={path.seg(locale, 'contacts')} className="rounded-lg border-2 border-text-on-inverted px-6 py-3 text-body-lg font-semibold">{en ? 'How to get here' : 'Як доїхати'}</Link>
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="py-(--section-y-md)">
          <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 lg:px-12">
            <h2 className="text-h2 text-text-primary">{en ? 'Made here' : 'Зроблено тут'}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} item={p} locale={locale} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

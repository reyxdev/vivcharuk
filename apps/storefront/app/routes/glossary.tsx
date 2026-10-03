import { Link, useParams, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import { brandOf, localeOf, originOf, pageMeta, titled, updatedOn } from '@/lib/seo';
import type { loader as layoutLoader } from './locale-layout';

// Round 24 G095: one glossary page, `/:locale/slovnyk` (the route is registered with the others).
// Short, neutral definitions of the craft's words — no disputed history, nothing the workshop has not
// said about itself. Linked to a category only while it has products.

const GLOSSARY_SEGMENT = 'slovnyk';
const UPDATED = '2026-10-03';

interface Term { id: string; name: string; text: string; category?: string; seg?: 'production' | 'care' }

const TERMS: Term[] = [
  { id: 'lizhnyk', name: 'Ліжник', category: 'lizhnyky', text: 'Вовняне покривало з густим пухнастим ворсом. Полотно тчуть з овечої вовни, а потім валяють: воно ущільнюється, а ворс піднімається. Ліжник — один із найвідоміших виробів гуцульського ткацтва; село Яворів називають столицею ліжникарства.' },
  { id: 'kots', name: 'Коц', text: 'Ворсиста вовняна ковдра або килимок.' },
  { id: 'hunia', name: 'Гуня', category: 'huni', text: 'Гуцульський верхній одяг з грубої вовняної тканини. У нашій майстерні гуні шиють з вовняного полотна, витканого тут же.' },
  { id: 'chuni', name: 'Чуні', category: 'chuni', text: 'Теплі вовняні капці чи короткі чобітки, найчастіше валяні.' },
  { id: 'keptar', name: 'Кептар', category: 'keptari', text: 'Традиційна гуцульська безрукавка з овчини, зазвичай хутром усередину, з оздобленням на лицьовому боці.' },
  { id: 'valiannia', name: 'Валяння', seg: 'production', text: 'Ущільнення вовни вологою, теплом і тертям, коли волокна сплутуються між собою. Після валяння виткане полотно стає щільним, а ворс піднімається; так само валяють і капці.' },
  { id: 'priazha', name: 'Пряжа', category: 'priazha', text: 'Нитка, спрядена з волокна. Вовняну пряжу прядуть з ровниці; з неї тчуть, в’яжуть і вишивають.' },
  { id: 'rovnytsia', name: 'Ровниця (рівниця)', category: 'rovnytsia', text: 'Безперервна стрічка з паралельних волокон, яка виходить після чесання вовни. З ровниці прядуть пряжу.' },
  { id: 'ovchyna', name: 'Овчина', category: 'shkury', text: 'Вичинена овеча шкура разом із вовною. Вичинка робить сиру шкуру м’якою й придатною для виробів.' },
];

// G093: the English page explains the same words; each keeps its Ukrainian form beside the Latin one.
const TERMS_EN: Term[] = [
  { id: 'lizhnyk', name: 'Lizhnyk (ліжник)', category: 'lizhnyky', text: 'A Hutsul wool blanket with a fluffy felted pile. The cloth is woven from sheep’s wool and then felted: it becomes denser and the pile rises. The lizhnyk is one of the best-known pieces of Hutsul weaving; Yavoriv village is called the capital of lizhnyk weaving.' },
  { id: 'kots', name: 'Kots (коц)', text: 'A wool blanket or small rug with a pile.' },
  { id: 'hunia', name: 'Hunia (гуня)', category: 'huni', text: 'Hutsul outerwear made of coarse wool cloth. In our workshop hunias are sewn from wool cloth woven right here.' },
  { id: 'chuni', name: 'Chuni (чуні)', category: 'chuni', text: 'Warm wool slippers or short boots, most often felted.' },
  { id: 'keptar', name: 'Keptar (кептар)', category: 'keptari', text: 'A traditional Hutsul sleeveless jacket made of sheepskin, usually with the fleece inside and decoration on the outer side.' },
  { id: 'valiannia', name: 'Felting (valiannia, валяння)', seg: 'production', text: 'Making wool denser with moisture, heat and friction, so that the fibres tangle together. After felting, woven cloth becomes dense and its pile rises; slippers are felted the same way.' },
  { id: 'priazha', name: 'Yarn (priazha, пряжа)', category: 'priazha', text: 'Thread spun from fibre. Wool yarn is spun from wool roving and is used for weaving, knitting and embroidery.' },
  { id: 'rovnytsia', name: 'Wool roving (rovnytsia, ровниця)', category: 'rovnytsia', text: 'A continuous strip of parallel fibres that comes out of carding the wool. Yarn is spun from roving.' },
  { id: 'ovchyna', name: 'Sheepskin (ovchyna, овчина)', category: 'shkury', text: 'A tanned sheep hide with its wool on. Tanning makes the raw hide soft and fit for making things.' },
];

// Typed without ./+types so the file compiles before the route is registered.
export function meta({ matches }: { matches: Parameters<typeof localeOf>[0] }) {
  const locale = localeOf(matches);
  if (locale === 'en') {
    return pageMeta({
      title: titled('Craft glossary: lizhnyk, hunia, chuni, keptar', locale),
      description: 'What a lizhnyk, kots, hunia, chuni, keptar, felting, yarn, wool roving and sheepskin are, explained simply by our workshop in Yavoriv, Kosiv district.',
      origin: originOf(matches),
      locale,
    });
  }
  return pageMeta({
    title: titled('Словник ремесла: ліжник, гуня, чуні, кептар'),
    description: 'Що таке ліжник, коц, гуня, чуні, кептар, валяння, пряжа, ровниця й овчина — коротко й просто, від майстерні Вівчарика з с. Яворів, Косівський р-н.',
    origin: originOf(matches),
  });
}

function findLive(tree: CategoryNode[], slug: string): { group: CategoryNode | null; node: CategoryNode } | null {
  for (const g of tree) {
    if (g.slug === slug) return { group: null, node: g };
    const c = g.children.find((x) => x.slug === slug);
    if (c) return { group: g, node: c };
  }
  return null;
}

export default function Glossary() {
  const { locale = 'uk' } = useParams();
  const l = locale as Locale;
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const origin = layout?.origin ?? '';
  const tree = layout?.categories ?? [];
  const url = `${origin}/${l}/${GLOSSARY_SEGMENT}`;
  const en = l === 'en';
  const terms = en ? TERMS_EN : TERMS;
  const linkOf = (t: Term) => {
    if (t.seg) return { to: path.seg(l, t.seg), label: en ? 'How we make it' : 'Як ми виробляємо' };
    const hit = t.category ? findLive(tree, t.category) : null;
    if (!hit || (hit.node as CategoryNode & { productCount?: number }).productCount === 0) return null;
    return { to: hit.group ? path.category(l, hit.group.slug, hit.node.slug) : path.category(l, hit.node.slug), label: hit.node.name };
  };
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet', '@id': `${url}#set`, name: en ? `${brandOf(l)} craft glossary` : 'Словник ремесла Вівчарика', url, inLanguage: l,
    hasDefinedTerm: terms.map((t) => ({ '@type': 'DefinedTerm', '@id': `${url}#${t.id}`, name: t.name, description: t.text, url: `${url}#${t.id}`, inDefinedTermSet: { '@id': `${url}#set` } })),
  };
  return (
    <article className="mx-auto flex max-w-(--container-narrow) flex-col gap-6 px-4 py-(--section-y-sm)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted"><Link to={path.home(l)} className="hover:underline">{en ? 'Home' : 'Головна'}</Link> › <span className="text-text-primary">{en ? 'Glossary' : 'Словник'}</span></nav>
      <h1 className="text-h1 text-text-primary">{en ? 'Craft glossary' : 'Словник ремесла'}</h1>
      <p className="text-body-lg text-text-body">{en ? 'The words we use for wool in our workshop in Yavoriv village, Kosiv district, Ivano-Frankivsk region, explained briefly and simply.' : 'Слова, якими говорять про вовну в нашій майстерні в Яворові, — коротко й без зайвого.'}</p>
      <dl className="flex flex-col divide-y divide-border-hairline">
        {terms.map((t) => {
          const link = linkOf(t);
          return (
            <div key={t.id} id={t.id} className="flex scroll-mt-28 flex-col gap-1.5 py-4">
              <dt><h2 className="text-h3 text-text-primary">{t.name}</h2></dt>
              <dd className="flex flex-col gap-1.5 text-body-lg text-text-body">
                <p>{t.text}</p>
                {link && <Link to={link.to} className="self-start text-body text-text-primary underline">{link.label} <span className="vk-arrow" aria-hidden="true">→</span></Link>}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="text-caption text-text-muted">{updatedOn(UPDATED, en ? 'en' : 'uk')}</p>
    </article>
  );
}

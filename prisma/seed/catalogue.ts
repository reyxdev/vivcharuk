// Production reference catalogue: category tree, option types, size libraries, attribute
// definitions, materials and product templates. Business structure only, no invented facts.
//
// Idempotent and create-only: every row is looked up by a stable key (uk slug for categories,
// `key` for option types/values, attributes and templates, uk name for materials) and created
// when missing. Existing rows are never overwritten, so Іван's edits in the admin survive deploys
// (same rule as roles.ts). Colours and patterns are NOT seeded here: the palette is business data
// entered by the owner (00-client-decisions-12 C1, C5; docs/37 §37.3).
import type { Locale, PricingUnit, Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;
type Named = { name: string; slug: string };

// ---------------------------------------------------------------------------------------------
// Categories: round 18's list of product kinds (round 10: subcategories are filters but keep
// indexable URLs).
// uk slugs: KMU 2010 (docs/03 §3.5.4 rule 2); existing slugs from docs/03 §3.3.2 are reused.
// en/pl/de rows only where docs/03 §3.4 gives the name. Овчина and Шкіра get no pl/de rows
// (docs/04 §4.2, hide worlds are uk/en only).
// ---------------------------------------------------------------------------------------------

type CategorySpec = {
  /** Stable machine key; defaults to the uk slug at creation. Kept when a category is renamed. */
  key?: string;
  uk: Named;
  i18n?: Partial<Record<Exclude<Locale, 'uk'>, Named>>;
  isActive?: boolean;
  /** Seed for «Свій розмір» in the product form, kopiykas per m² (round 18 C6). */
  customRateMinor?: number;
  children?: CategorySpec[];
};

// Round 18 (00-client-decisions-18 C7): the owner's own list of product kinds, grouped. Categories
// that were in the round-9 tree but not in the list stay, hidden, so nothing attached to them is lost.
export const CATEGORIES: CategorySpec[] = [
  {
    key: 'lizhnyky-ta-pledy',
    uk: { name: 'Ліжники та килими', slug: 'lizhnyky-ta-kylymy' },
    children: [
      {
        uk: { name: 'Ліжники', slug: 'lizhnyky' },
        customRateMinor: 100_000,
        i18n: {
          en: { name: 'Lizhnyk — Carpathian Wool Blankets', slug: 'carpathian-wool-blankets' },
          pl: { name: 'Liżnyki — koce karpackie', slug: 'koce-karpackie' },
          de: { name: 'Lischnyk — Karpaten-Wolldecken', slug: 'karpaten-wolldecken' },
        },
      },
      { uk: { name: 'Ліжникові доріжки', slug: 'lizhnykovi-dorizhky' } },
      { uk: { name: 'Ліжникові накидки', slug: 'lizhnykovi-nakydky' }, customRateMinor: 150_000 },
      { uk: { name: 'Килими та килимові доріжки', slug: 'kylymy' } },
    ],
  },
  {
    uk: { name: 'Пледи та ковдри', slug: 'pledy-ta-kovdry' },
    children: [
      { uk: { name: 'Пледи', slug: 'pledy' } },
      { uk: { name: 'Ковдри вовняні', slug: 'kovdry' }, customRateMinor: 260_000 },
      { uk: { name: 'Наматрацники вовняні', slug: 'namatratsnyky' } },
      { uk: { name: 'Конверти для немовлят', slug: 'konverty-dlia-nemovliat' } },
    ],
  },
  {
    uk: { name: 'Взуття', slug: 'vzuttia' },
    children: [
      { key: 'kaptsi', uk: { name: 'Тапочки', slug: 'tapochky' } },
      { uk: { name: 'Чуні', slug: 'chuni' } },
      { uk: { name: 'Пінетки', slug: 'pinetky' } },
    ],
  },
  {
    uk: { name: 'Овчина', slug: 'ovchyna' },
    i18n: { en: { name: 'Sheepskin', slug: 'sheepskin' } },
    children: [
      { uk: { name: 'Шкури овечі', slug: 'shkury' } },
      { uk: { name: 'Коврики з овчини', slug: 'kovryky-z-ovchyny' } },
      { uk: { name: 'Автомобільні накидки', slug: 'avtomobilni-nakydky' } },
      { uk: { name: 'Вироби з овчини', slug: 'vyroby-z-ovchyny' }, isActive: false },
    ],
  },
  {
    key: 'vovnianyi-odiah',
    uk: { name: 'Одяг', slug: 'odiah' },
    children: [
      {
        uk: { name: 'Гуні', slug: 'huni' },
        i18n: {
          en: { name: 'Gunia — Hutsul Felted Wool Coats', slug: 'felted-wool-coats' },
          pl: { name: 'Gunia — huculski płaszcz wełniany', slug: 'gunie-huculskie' },
          de: { name: 'Gunia — Hutsulischer Wollmantel', slug: 'wollmaentel' },
        },
      },
      { uk: { name: 'Кептарі', slug: 'keptari' } },
      { uk: { name: 'Шуби', slug: 'shuby' } },
      { uk: { name: 'Пояси', slug: 'poiasy' } },
      { uk: { name: 'Шапки', slug: 'shapky' } },
      {
        uk: { name: 'Камізельки', slug: 'kamizelky' },
        isActive: false,
        i18n: {
          en: { name: 'Wool Vests', slug: 'wool-vests' },
          pl: { name: 'Kamizelki wełniane', slug: 'kamizelki-welniane' },
          de: { name: 'Wollwesten', slug: 'wollwesten' },
        },
      },
      { uk: { name: 'Накидки', slug: 'nakydky' }, isActive: false },
    ],
  },
  {
    uk: { name: 'Подушки та постіль', slug: 'podushky-ta-postil' },
    children: [
      { uk: { name: 'Подушки вовняні', slug: 'podushky' } },
      { uk: { name: 'Подушки з вовняним наповнювачем', slug: 'podushky-z-vovnoiu' } },
      { uk: { name: 'Подушки пух-перо', slug: 'podushky-pukh-pero' } },
      { uk: { name: 'Подушки з антиалергенного волокна', slug: 'podushky-antyalerhenni' } },
      { uk: { name: 'Подушки для сну — рогалики', slug: 'podushky-rohalyky' } },
      { uk: { name: 'Подушки меблеві', slug: 'podushky-meblevi' } },
      { uk: { name: 'Наволочки', slug: 'navolochky' } },
      { uk: { name: 'Постільна білизна', slug: 'postilna-bilyzna' } },
    ],
  },
  {
    key: 'shkarpetky-ta-kaptsi',
    uk: { name: 'Шкарпетки й теплі речі', slug: 'shkarpetky-ta-tepli-rechi' },
    children: [
      { uk: { name: 'Шкарпетки', slug: 'shkarpetky' } },
      { uk: { name: 'Рукавиці', slug: 'rukavytsi' } },
      { uk: { name: 'Гетри', slug: 'hetry' } },
      { uk: { name: 'Наколінники', slug: 'nakolinnyky' } },
    ],
  },
  {
    uk: { name: 'Пряжа та рукоділля', slug: 'priazha-ta-rukodillia' },
    children: [
      { uk: { name: 'Пряжа кручена', slug: 'priazha' } },
      {
        uk: { name: 'Рівниця сучена', slug: 'rovnytsia' },
        i18n: {
          en: { name: 'Wool Roving', slug: 'wool-roving' },
          pl: { name: 'Niedoprzęd wełniany', slug: 'niedoprzed-welniany' },
          de: { name: 'Kammzug — Wollvlies', slug: 'kammzug' },
        },
      },
      {
        uk: { name: 'Вовна для рукоділля', slug: 'vovna-dlia-rukodillia' },
        isActive: false,
        i18n: {
          en: { name: 'Carded Wool for Crafts', slug: 'carded-wool' },
          pl: { name: 'Wełna czesankowa do rękodzieła', slug: 'welna-do-rekodziela' },
          de: { name: 'Bastelwolle — Kardenwolle', slug: 'bastelwolle' },
        },
      },
    ],
  },
  { key: 'shkira', uk: { name: 'Шкіряні сумки', slug: 'shkiriani-sumky' }, i18n: { en: { name: 'Leather', slug: 'leather' } } },
  {
    key: 'derevo',
    uk: { name: 'Дерев\'яні вироби', slug: 'dereviani-vyroby' },
    children: [
      { uk: { name: 'Для кухні', slug: 'dlia-kukhni' } },
      { uk: { name: 'Масажери', slug: 'masazhery' } },
      { uk: { name: 'Іграшки', slug: 'ihrashky' } },
      { uk: { name: 'Скарбнички та сувеніри', slug: 'skarbnychky-ta-suveniry' } },
    ],
  },
  { uk: { name: 'Еко-чаї', slug: 'eko-chai' } },
  {
    // Partner goods sit in their own categories now, marked on the card (round 18 C7).
    uk: { name: 'Від партнерів', slug: 'partnerski-vyroby' },
    isActive: false,
    i18n: {
      en: { name: 'Selected Partners', slug: 'selected-partners' },
      pl: { name: 'Wyroby partnerskie', slug: 'wyroby-partnerskie' },
      de: { name: 'Ausgewählte Partner', slug: 'ausgewaehlte-partner' },
    },
  },
];

// ---------------------------------------------------------------------------------------------
// Option types and per-template size libraries (00-client-decisions-12 S1-S13; docs/37 §37.2-37.3).
// OptionValue has no template link, so the library a size belongs to is encoded as the key prefix
// `<templateKey>-`. Only values the docs state; Іван extends the lists in the admin.
// ---------------------------------------------------------------------------------------------

const OPTION_TYPES = [
  // Size names in all four locales: docs/25 OptionTypeTranslation example.
  { key: 'size', displayAs: 'PILL', position: 0, names: { uk: 'Розмір', en: 'Size', pl: 'Rozmiar', de: 'Größe' } },
  { key: 'color', displayAs: 'SWATCH', position: 1, names: { uk: 'Колір' } },
  { key: 'pattern', displayAs: 'PILL', position: 2, names: { uk: 'Візерунок' } },
] as const;

type SizeSpec = { code: string; label: string; dimensions?: Prisma.InputJsonValue };
const wl = (w: number, l: number) => ({ widthCm: w, lengthCm: l });

export const SIZE_LIBRARIES: Record<string, SizeSpec[]> = {
  // S1 + S2: only 200×220 is given a display name in the docs.
  lizhnyk: [
    { code: '150x200', label: '150×200 см', dimensions: wl(150, 200) },
    { code: '170x210', label: '170×210 см', dimensions: wl(170, 210) },
    { code: '200x220', label: 'Двоспальний · 200×220 см', dimensions: wl(200, 220) },
    { code: '220x240', label: '220×240 см', dimensions: wl(220, 240) },
  ],
  // S9
  podushka: [
    { code: '40x40', label: '40×40 см', dimensions: wl(40, 40) },
    { code: '50x50', label: '50×50 см', dimensions: wl(50, 50) },
    { code: '50x70', label: '50×70 см', dimensions: wl(50, 70) },
    { code: '70x70', label: '70×70 см', dimensions: wl(70, 70) },
  ],
  // S4, S6. Chest/length per size (sizeTable) not given in the docs.
  odyah: [
    { code: 's', label: 'S' },
    { code: 'm', label: 'M' },
    { code: 'l', label: 'L' },
    { code: 'xl', label: 'XL' },
    { code: 'xxl', label: 'XXL' },
    { code: 'universalnyi', label: 'Універсальний' },
  ],
  // S7
  shkarpetky: [
    { code: '36-38', label: '36–38' },
    { code: '39-41', label: '39–41' },
    { code: '42-44', label: '42–44' },
    { code: '45-46', label: '45–46' },
  ],
  // S8: insole length per size is not given in the docs, so dimensions stay empty.
  kaptsi: Array.from({ length: 11 }, (_, i) => ({ code: String(36 + i), label: String(36 + i) })),
  // S10: the docs' example lengths.
  poias: [90, 110, 130].map((cm) => ({ code: String(cm), label: `${cm} см`, dimensions: { lengthCm: cm } })),
};

// ---------------------------------------------------------------------------------------------
// Attribute definitions (docs/37 §37.2; 00-client-decisions-12 M4-M10, S11).
// Weight per size is ProductVariant.weightGrams (M6), composition («Склад») is
// ProductComposition (M2), the clothing size table is ProductTemplate.sizeTable: none are attributes.
// isFilterable per docs/37 §37.7 and round 9/10 facets: yarn thickness (M8) and the sheepskin
// measurements the size-range filter is derived from (S11).
// ---------------------------------------------------------------------------------------------

type AttrSpec = {
  key: string;
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM';
  unit?: string;
  isFilterable?: boolean;
  name: string;
  helpText?: string;
};

export const ATTRIBUTES: AttrSpec[] = [
  { key: 'warp', dataType: 'TEXT', name: 'Основа' },
  { key: 'weft', dataType: 'TEXT', name: 'Уток' },
  { key: 'density_gsm', dataType: 'NUMBER', unit: 'г/м²', name: 'Щільність', helpText: 'Чим більше — тим тепліше' },
  { key: 'filling', dataType: 'ENUM', name: 'Наповнювач' },
  { key: 'sole', dataType: 'TEXT', name: 'Підошва' },
  { key: 'skein_weight_g', dataType: 'NUMBER', unit: 'г', name: 'Вага мотка' },
  { key: 'skein_length_m', dataType: 'NUMBER', unit: 'м', name: 'Метраж' },
  { key: 'yarn_thickness', dataType: 'ENUM', isFilterable: true, name: 'Товщина пряжі' },
  { key: 'ply_count', dataType: 'NUMBER', name: 'Кількість складань' },
  { key: 'needle_size', dataType: 'TEXT', unit: 'мм', name: 'Рекомендовані спиці' },
  { key: 'length_cm', dataType: 'NUMBER', unit: 'см', isFilterable: true, name: 'Довжина' },
  { key: 'width_cm', dataType: 'NUMBER', unit: 'см', isFilterable: true, name: 'Ширина' },
  { key: 'fur_color', dataType: 'TEXT', name: 'Колір хутра' },
  { key: 'pile_length_mm', dataType: 'NUMBER', unit: 'мм', name: 'Довжина ворсу' },
  { key: 'tanning_type', dataType: 'TEXT', name: 'Тип вичинки' },
  { key: 'leather_type', dataType: 'TEXT', name: 'Вид шкіри' },
  { key: 'hardware', dataType: 'TEXT', name: 'Фурнітура' },
  { key: 'dimensions_cm', dataType: 'TEXT', unit: 'см', name: 'Розміри' },
];

// ---------------------------------------------------------------------------------------------
// Materials (00-client-decisions-12 M1, M12). Groups: вовна | овчина | шкіра | змішані.
// Бавовна and льон only occur in blends, so they sit in «змішані».
// ---------------------------------------------------------------------------------------------

export const MATERIALS = [
  { name: 'Овеча вовна', group: 'вовна' },
  { name: 'Овчина', group: 'овчина' },
  { name: 'Шкіра', group: 'шкіра' },
  { name: 'Бавовна', group: 'змішані' },
  { name: 'Льон', group: 'змішані' },
] as const;

// ---------------------------------------------------------------------------------------------
// Product templates (00-client-decisions-12 P2, P8, P13, S3; docs/37 §37.2).
// Story stage keys and the only stages that may be claimed (00-client-decisions-9 §F1):
//   tanning = вичинка шкур, washing = миття, carding = чесання, spinning = прядіння,
//   weaving = ткання, felting = валяння, sewing = пошиття.
// Knitting, shearing and dyeing are not claimed, so they have no key.
// ---------------------------------------------------------------------------------------------

export const STAGE_KEYS = ['tanning', 'washing', 'carding', 'spinning', 'weaving', 'felting', 'sewing'] as const;
type Stage = (typeof STAGE_KEYS)[number];

// P8: required before publishing; size only where the template has sizes, colour only where it
// has colours.
const BASE_REQUIRED = ['name', 'price', 'photos>=3', 'composition', 'description', 'packedWeight'];
const required = (...extra: Array<'size' | 'color'>) => [...BASE_REQUIRED.slice(0, 3), ...extra, ...BASE_REQUIRED.slice(3)];

type TemplateSpec = {
  key: string;
  typePrefix: string;
  category: string; // key of the default category
  axes: Array<'size' | 'color' | 'pattern'>;
  pricingUnits: PricingUnit[];
  requiredFields: string[];
  storyStages: Stage[];
  sizeCalcOverhangCm?: number;
  isHidden?: boolean;
  attributes?: Array<string | { key: string; required: true }>;
};

export const TEMPLATES: TemplateSpec[] = [
  {
    key: 'lizhnyk', // Ліжник / плед / ковдра
    typePrefix: 'Ліжник',
    category: 'lizhnyky-ta-pledy',
    axes: ['size', 'color', 'pattern'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'spinning', 'weaving', 'felting'],
    sizeCalcOverhangCm: 40, // S3 example value («e.g. +40 cm»)
    attributes: ['warp', 'weft', 'density_gsm'],
  },
  {
    key: 'podushka',
    typePrefix: 'Подушка',
    category: 'lizhnyky-ta-pledy',
    axes: ['size', 'color'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'spinning', 'weaving', 'sewing'],
    attributes: ['filling'],
  },
  {
    key: 'odyah', // гуня, камізелька, накидка
    typePrefix: 'Гуня',
    category: 'vovnianyi-odiah',
    axes: ['size', 'color'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'spinning', 'weaving', 'felting', 'sewing'],
  },
  {
    key: 'shkarpetky',
    typePrefix: 'Шкарпетки',
    category: 'shkarpetky-ta-kaptsi',
    axes: ['size', 'color', 'pattern'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'spinning'],
  },
  {
    key: 'kaptsi',
    typePrefix: 'Капці',
    category: 'shkarpetky-ta-kaptsi',
    axes: ['size', 'color'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'felting', 'sewing'],
    attributes: ['sole'],
  },
  {
    key: 'priazha', // пряжа / ровниця / вовна
    typePrefix: 'Пряжа',
    category: 'priazha-ta-rukodillia',
    axes: ['color'],
    pricingUnits: ['SKEIN', 'KILOGRAM'],
    requiredFields: required('color'),
    storyStages: ['washing', 'carding', 'spinning'],
    attributes: ['skein_weight_g', 'skein_length_m', 'yarn_thickness', 'ply_count', 'needle_size'],
  },
  {
    key: 'ovchyna', // one-of-one, stock 1
    typePrefix: 'Овчина',
    category: 'ovchyna',
    axes: [],
    pricingUnits: ['PIECE'],
    requiredFields: required(),
    storyStages: ['tanning'],
    attributes: [
      { key: 'length_cm', required: true },
      { key: 'width_cm', required: true },
      'fur_color',
      'pile_length_mm',
      'tanning_type',
    ],
  },
  {
    key: 'shkiriani-vyroby', // «Size or none»: size is an axis but not required
    typePrefix: '', // no single type noun in the docs; the name is typed in full
    category: 'shkira',
    axes: ['size', 'color'],
    pricingUnits: ['PIECE'],
    requiredFields: required('color'),
    storyStages: ['tanning', 'sewing'],
    attributes: ['leather_type', 'hardware', 'dimensions_cm'],
  },
  {
    key: 'poias',
    typePrefix: 'Пояс',
    category: 'vovnianyi-odiah',
    axes: ['size', 'color'],
    pricingUnits: ['PIECE'],
    requiredFields: required('size', 'color'),
    storyStages: ['washing', 'carding', 'spinning', 'weaving'],
  },
  {
    key: 'derevo', // P13; offered since round 18 (wooden goods are real)
    typePrefix: '',
    category: 'derevo',
    axes: [],
    pricingUnits: ['PIECE'],
    requiredFields: ['name', 'price', 'photos>=3', 'description', 'packedWeight'],
    storyStages: [],
  },
];

// ---------------------------------------------------------------------------------------------

const keyOf = (spec: CategorySpec) => spec.key ?? spec.uk.slug;

async function ensureCategory(tx: Tx, spec: CategorySpec, parentId: string | null, sortOrder: number, n: { created: number }) {
  const found = await tx.categoryTranslation.findUnique({
    where: { locale_slug: { locale: 'uk', slug: spec.uk.slug } },
    select: { categoryId: true },
  });
  const id =
    found?.categoryId ??
    (
      await tx.category.create({
        data: { key: keyOf(spec), parentId, sortOrder, isActive: spec.isActive ?? true, defaultCustomSizeRatePerSqmMinor: spec.customRateMinor },
        select: { id: true },
      })
    ).id;
  if (!found) n.created++;

  const rows = [{ locale: 'uk' as Locale, ...spec.uk }, ...Object.entries(spec.i18n ?? {}).map(([locale, t]) => ({ locale: locale as Locale, ...t }))];
  await tx.categoryTranslation.createMany({
    data: rows.map((r) => ({ categoryId: id, locale: r.locale, name: r.name, slug: r.slug })),
    skipDuplicates: true,
  });

  for (const [i, child] of (spec.children ?? []).entries()) await ensureCategory(tx, child, id, i + 1, n);
  return id;
}

// Round 18: a database seeded with the round-9 tree is brought to the new one once, in place and by
// key (rename, re-slug, move, hide), so products stay attached. After that the tree is Іван's to edit
// in the admin; later seeds only add what is missing. The site was not public yet: no redirects.
const TREE_ROUND = 18;
type FlatNode = { spec: CategorySpec; key: string; parentKey: string | null; sortOrder: number };
const flatten = (specs: CategorySpec[], parentKey: string | null = null): FlatNode[] =>
  specs.flatMap((spec, i) => [{ spec, key: keyOf(spec), parentKey, sortOrder: i + 1 }, ...flatten(spec.children ?? [], keyOf(spec))]);

async function treeRoundDone(tx: Tx) {
  const s = await tx.setting.findUnique({ where: { key: 'catalogue.tree_round' } });
  return typeof s?.value === 'number' && s.value >= TREE_ROUND;
}

async function renameToRound18(tx: Tx) {
  for (const n of flatten(CATEGORIES)) {
    const row = await tx.category.findUnique({ where: { key: n.key }, select: { id: true } });
    if (row) await tx.categoryTranslation.updateMany({ where: { categoryId: row.id, locale: 'uk' }, data: { name: n.spec.uk.name, slug: n.spec.uk.slug } });
  }
}

async function placeToRound18(tx: Tx) {
  const ids = new Map((await tx.category.findMany({ select: { id: true, key: true } })).map((c) => [c.key, c.id]));
  for (const n of flatten(CATEGORIES)) {
    const id = ids.get(n.key);
    if (!id) continue;
    await tx.category.update({ where: { id }, data: { parentId: n.parentKey ? ids.get(n.parentKey) ?? null : null, sortOrder: n.sortOrder, isActive: n.spec.isActive ?? true } });
    if (n.spec.customRateMinor) await tx.category.updateMany({ where: { id, defaultCustomSizeRatePerSqmMinor: null }, data: { defaultCustomSizeRatePerSqmMinor: n.spec.customRateMinor } });
  }
  // Wooden goods are real now (round 18), so their template is offered in the product form.
  await tx.productTemplate.updateMany({ where: { key: 'derevo' }, data: { isHidden: false } });
  await tx.setting.upsert({ where: { key: 'catalogue.tree_round' }, create: { key: 'catalogue.tree_round', value: TREE_ROUND }, update: { value: TREE_ROUND } });
  console.log(`categories: tree brought to round ${TREE_ROUND}`);
}

export async function seedCatalogue(tx: Tx) {
  // Categories
  const cats = { created: 0 };
  const reshape = !(await treeRoundDone(tx));
  if (reshape) await renameToRound18(tx);
  for (const [i, spec] of CATEGORIES.entries()) await ensureCategory(tx, spec, null, i + 1, cats);
  if (reshape) await placeToRound18(tx);
  // Templates name their default category by key, which survives renames (round 18).
  const categoryId = new Map((await tx.category.findMany({ select: { id: true, key: true } })).map((c) => [c.key, c.id]));

  // Option types
  let createdTypes = 0;
  const typeId = new Map<string, string>();
  for (const t of OPTION_TYPES) {
    let row = await tx.optionType.findUnique({ where: { key: t.key }, select: { id: true } });
    if (!row) {
      row = await tx.optionType.create({ data: { key: t.key, displayAs: t.displayAs, position: t.position }, select: { id: true } });
      createdTypes++;
    }
    typeId.set(t.key, row.id);
    await tx.optionTypeTranslation.createMany({
      data: Object.entries(t.names).map(([locale, name]) => ({ optionTypeId: row.id, locale: locale as Locale, name })),
      skipDuplicates: true,
    });
  }

  // Size libraries
  let createdSizes = 0;
  const sizeTypeId = typeId.get('size')!;
  for (const [template, sizes] of Object.entries(SIZE_LIBRARIES)) {
    for (const [i, s] of sizes.entries()) {
      const key = `${template}-${s.code}`;
      let row = await tx.optionValue.findUnique({ where: { optionTypeId_key: { optionTypeId: sizeTypeId, key } }, select: { id: true } });
      if (!row) {
        const sortKey = (i + 1) * 10; // S13: small to large
        row = await tx.optionValue.create({
          data: { optionTypeId: sizeTypeId, key, sortKey, position: sortKey, dimensions: s.dimensions },
          select: { id: true },
        });
        createdSizes++;
      }
      await tx.optionValueTranslation.createMany({ data: [{ optionValueId: row.id, locale: 'uk', label: s.label }], skipDuplicates: true });
    }
  }

  // Attribute definitions
  let createdAttrs = 0;
  const attrId = new Map<string, string>();
  for (const [i, a] of ATTRIBUTES.entries()) {
    let row = await tx.attributeDefinition.findUnique({ where: { key: a.key }, select: { id: true } });
    if (!row) {
      row = await tx.attributeDefinition.create({
        data: { key: a.key, dataType: a.dataType, unit: a.unit, isFilterable: a.isFilterable ?? false, position: (i + 1) * 10 },
        select: { id: true },
      });
      createdAttrs++;
    }
    attrId.set(a.key, row.id);
    await tx.attributeDefinitionTranslation.createMany({
      data: [{ definitionId: row.id, locale: 'uk', name: a.name, helpText: a.helpText }],
      skipDuplicates: true,
    });
  }

  // Materials (no key column: matched on the uk name)
  let createdMaterials = 0;
  for (const m of MATERIALS) {
    const found = await tx.materialTranslation.findFirst({ where: { locale: 'uk', name: m.name }, select: { id: true } });
    if (found) continue;
    await tx.material.create({ data: { group: m.group, translations: { create: { locale: 'uk', name: m.name } } } });
    createdMaterials++;
  }

  // Templates
  let createdTemplates = 0;
  let linkedAttrs = 0;
  for (const t of TEMPLATES) {
    const defaultCategoryId = categoryId.get(t.category);
    if (!defaultCategoryId) throw new Error(`template ${t.key}: category ${t.category} missing`);
    let row = await tx.productTemplate.findUnique({ where: { key: t.key }, select: { id: true } });
    if (!row) {
      row = await tx.productTemplate.create({
        data: {
          key: t.key,
          typePrefix: t.typePrefix,
          defaultCategoryId,
          pricingUnits: t.pricingUnits,
          axes: t.axes,
          requiredFields: t.requiredFields,
          storyStages: t.storyStages,
          sizeCalcOverhangCm: t.sizeCalcOverhangCm,
          isHidden: t.isHidden ?? false,
        },
        select: { id: true },
      });
      createdTemplates++;
    }
    const { count } = await tx.productTemplateAttribute.createMany({
      data: (t.attributes ?? []).map((a, i) => {
        const key = typeof a === 'string' ? a : a.key;
        return { templateId: row.id, attributeId: attrId.get(key)!, isRequired: typeof a !== 'string', sortOrder: (i + 1) * 10 };
      }),
      skipDuplicates: true,
    });
    linkedAttrs += count;
  }

  console.log(
    `catalogue: +${cats.created} categories, +${createdTypes} option types, +${createdSizes} sizes, ` +
      `+${createdAttrs} attributes, +${createdMaterials} materials, +${createdTemplates} templates, +${linkedAttrs} template attribute links`,
  );
}

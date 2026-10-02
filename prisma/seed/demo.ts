// DEVELOPMENT ONLY. Demo colours, patterns and products so the storefront has something to render
// before Іван enters the real catalogue. Runs only with SEED_DEMO=1 (see index.ts) and must never
// run against production. Every description ends in «(демо)». No media rows: the storefront shows
// its placeholder. Create-only, keyed by OptionValue.key and Product.sku, so re-runs are no-ops.
import type { Prisma, PricingUnit, ProductOrigin } from '@prisma/client';

type Tx = Prisma.TransactionClient;

// Colour hex values from packages/tokens/src/primitives/color.ts; families from
// 00-client-decisions-12 C3. isNaturalUndyed only where the shade is plainly undyed wool.
const COLOURS = [
  { key: 'bilyi', label: 'Білий', hex: '#FAF8F4', family: 'білий', undyed: true }, // fleece-100
  { key: 'naturalnyi', label: 'Натуральний', hex: '#D2C4A9', family: 'натуральний', undyed: true }, // fleece-500
  { key: 'siryi', label: 'Сірий', hex: '#9A968D', family: 'сірий', undyed: false }, // stone-400
  { key: 'chornyi', label: 'Чорний', hex: '#1C1B18', family: 'чорний', undyed: false }, // stone-900
  { key: 'chervonyi', label: 'Червоний', hex: '#8C2F22', family: 'червоний', undyed: false }, // danger-light
  { key: 'zelenyi', label: 'Зелений', hex: '#2A4C3C', family: 'зелений', undyed: false }, // forest-700
] as const;

// 00-client-decisions-12 C5 example patterns.
const PATTERNS = [
  { key: 'rombi', label: 'Ромби' },
  { key: 'smuhy', label: 'Смуги' },
  { key: 'yalynka', label: 'Ялинка' },
] as const;

type ColourKey = (typeof COLOURS)[number]['key'];
type PatternKey = (typeof PATTERNS)[number]['key'];

const COLOUR_CODE: Record<ColourKey, string> = { bilyi: 'BI', naturalnyi: 'NA', siryi: 'SI', chornyi: 'CH', chervonyi: 'CR', zelenyi: 'ZE' };

// KMU 2010 transliteration (docs/03 §3.5.4 rule 2) for demo product slugs.
const KMU: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i',
  й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh',
  ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', "'": '', 'ʼ': '', '’': '',
};
const KMU_INITIAL: Record<string, string> = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' };

export function slugify(text: string): string {
  const s = text.toLowerCase().replace(/зг/g, 'zgh');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const initial = i === 0 || !/[\p{L}'ʼ’]/u.test(s[i - 1]);
    out += (initial && KMU_INITIAL[ch]) || (KMU[ch] ?? ch);
  }
  return out.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type VariantSpec = { size?: string; colour?: ColourKey; price: number; stock: number };
type ProductSpec = {
  sku: string; // VCH-<type>-<number>, 00-client-decisions-12 V7
  template: string;
  categories: string[]; // uk slugs; first is primary
  name: string;
  about: string;
  pattern?: PatternKey;
  unit?: PricingUnit;
  origin?: ProductOrigin;
  partnerRegion?: string;
  handmade?: boolean;
  unique?: boolean;
  customSize?: boolean;
  material: 'Овеча вовна' | 'Овчина' | 'Шкіра';
  attrs?: Record<string, string | number>;
  variants: VariantSpec[];
};

const uah = (n: number) => n * 100;
// Price per size, shared by its colours (V2); stock varies per row.
const grid = (sizes: Array<[string, number]>, colours: ColourKey[], stock: number[]): VariantSpec[] =>
  sizes.flatMap(([size, price], i) => colours.map((colour, j) => ({ size, colour, price: uah(price), stock: stock[(i + j) % stock.length] })));

const PRODUCTS: ProductSpec[] = [
  // Ліжники та пледи
  {
    sku: 'VCH-LZ-0101', template: 'lizhnyk', categories: ['lizhnyky'], name: 'Ліжник «Черемош»', about: 'Вовняний ліжник у сірих і натуральних тонах.',
    pattern: 'rombi', handmade: true, customSize: true, material: 'Овеча вовна', attrs: { density_gsm: 1200 },
    variants: grid([['lizhnyk-150x200', 5400], ['lizhnyk-200x220', 11900], ['lizhnyk-220x240', 12300]], ['siryi', 'naturalnyi'], [3, 1, 0, 2]),
  },
  {
    sku: 'VCH-LZ-0102', template: 'lizhnyk', categories: ['lizhnyky'], name: 'Ліжник «Мозаїка»', about: 'Смугастий вовняний ліжник.',
    pattern: 'smuhy', handmade: true, material: 'Овеча вовна',
    variants: grid([['lizhnyk-150x200', 5300], ['lizhnyk-170x210', 7400]], ['chervonyi', 'chornyi'], [2, 4, 1]),
  },
  {
    sku: 'VCH-LZ-0103', template: 'lizhnyk', categories: ['lizhnyky'], name: 'Ліжник «Яворівський»', about: 'Світлий вовняний ліжник з візерунком «ялинка».',
    pattern: 'yalynka', handmade: true, material: 'Овеча вовна',
    variants: grid([['lizhnyk-200x220', 11820]], ['bilyi'], [2]),
  },
  {
    sku: 'VCH-LZ-0104', template: 'lizhnyk', categories: ['lizhnyky'], name: 'Ліжник «Гармонія»', about: 'Зелений вовняний ліжник; зараз немає в наявності.',
    pattern: 'rombi', material: 'Овеча вовна',
    variants: grid([['lizhnyk-150x200', 7280], ['lizhnyk-200x220', 10460]], ['zelenyi'], [0]),
  },
  {
    sku: 'VCH-LZ-0105', template: 'lizhnyk', categories: ['pledy'], name: 'Плед «Полонина»', about: 'Легкий вовняний плед.',
    material: 'Овеча вовна', variants: grid([['lizhnyk-150x200', 2400], ['lizhnyk-200x220', 3000]], ['naturalnyi', 'siryi'], [5, 3]),
  },
  {
    sku: 'VCH-LZ-0106', template: 'lizhnyk', categories: ['pledy'], name: 'Плед «Говерла»', about: 'Смугастий вовняний плед.',
    pattern: 'smuhy', material: 'Овеча вовна', variants: grid([['lizhnyk-150x200', 2400]], ['chervonyi', 'zelenyi'], [4, 2]),
  },
  {
    sku: 'VCH-LZ-0107', template: 'lizhnyk', categories: ['kovdry'], name: 'Ковдра «Кострича»', about: 'Вовняна ковдра для холодних ночей.',
    material: 'Овеча вовна', variants: grid([['lizhnyk-150x200', 3000], ['lizhnyk-200x220', 4000]], ['naturalnyi'], [3, 2]),
  },
  {
    sku: 'VCH-PD-0101', template: 'podushka', categories: ['podushky'], name: 'Подушка «Писанка»', about: 'Вовняна подушка з візерунчастим чохлом.',
    material: 'Овеча вовна', variants: grid([['podushka-50x50', 1200], ['podushka-50x70', 1650]], ['chervonyi', 'naturalnyi'], [6, 2]),
  },
  {
    sku: 'VCH-PD-0102', template: 'podushka', categories: ['podushky'], name: 'Подушка «Синевир»', about: 'Невелика вовняна подушка.',
    material: 'Овеча вовна', variants: grid([['podushka-40x40', 900], ['podushka-70x70', 1800]], ['siryi'], [4, 1]),
  },
  // Пряжа та рукоділля
  {
    sku: 'VCH-PR-0101', template: 'priazha', categories: ['priazha'], name: 'Пряжа «Смерека»', about: 'Вовняна пряжа середньої товщини.',
    unit: 'SKEIN', material: 'Овеча вовна',
    attrs: { skein_weight_g: 100, skein_length_m: 200, yarn_thickness: 'середня', ply_count: 2, needle_size: '4–5' },
    variants: (['naturalnyi', 'siryi', 'zelenyi', 'chervonyi'] as ColourKey[]).map((colour, i) => ({ colour, price: uah(120), stock: [20, 12, 0, 8][i] })),
  },
  {
    sku: 'VCH-PR-0102', template: 'priazha', categories: ['priazha'], name: 'Пряжа «Карпати»', about: 'Товста вовняна пряжа.',
    unit: 'SKEIN', material: 'Овеча вовна', attrs: { skein_weight_g: 100, skein_length_m: 120, yarn_thickness: 'товста' },
    variants: (['bilyi', 'chornyi'] as ColourKey[]).map((colour) => ({ colour, price: uah(160), stock: 15 })),
  },
  {
    sku: 'VCH-PR-0103', template: 'priazha', categories: ['rovnytsia'], name: 'Ровниця «Черногора»', about: 'Вовняна ровниця для прядіння й валяння.',
    unit: 'KILOGRAM', material: 'Овеча вовна', variants: [{ colour: 'naturalnyi', price: uah(840), stock: 10 }],
  },
  {
    sku: 'VCH-PR-0104', template: 'priazha', categories: ['rovnytsia'], name: 'Вовна «Ґорґани»', about: 'Чесана вовна для рукоділля.',
    unit: 'KILOGRAM', material: 'Овеча вовна', variants: [{ colour: 'bilyi', price: uah(460), stock: 25 }, { colour: 'siryi', price: uah(460), stock: 5 }],
  },
  // Овчина: one-of-one skins (00-client-decisions-9 answer 18)
  ...[
    { sku: 'VCH-OV-0101', name: 'Овчина «Сива»', price: 1800, attrs: { length_cm: 110, width_cm: 80, fur_color: 'сірий', pile_length_mm: 60 } },
    { sku: 'VCH-OV-0102', name: 'Овчина «Біла»', price: 2400, attrs: { length_cm: 120, width_cm: 90, fur_color: 'білий', pile_length_mm: 70 } },
    { sku: 'VCH-OV-0103', name: 'Овчина «Руна»', price: 3000, attrs: { length_cm: 130, width_cm: 95, fur_color: 'натуральний', pile_length_mm: 80 } },
  ].map(
    (s): ProductSpec => ({
      sku: s.sku, template: 'ovchyna', categories: ['shkury'], name: s.name, about: 'Окрема овеча шкура, одна в наявності.',
      unique: true, material: 'Овчина', attrs: s.attrs, variants: [{ price: uah(s.price), stock: 1 }],
    }),
  ),
  // Вовняний одяг
  {
    sku: 'VCH-OD-0101', template: 'odyah', categories: ['huni'], name: 'Гуня «Верховина»', about: 'Вовняна гуня гуцульського крою.',
    handmade: true, material: 'Овеча вовна', variants: grid([['odyah-m', 8500], ['odyah-l', 8500], ['odyah-xl', 8500]], ['chornyi', 'bilyi'], [1, 2, 0]),
  },
  {
    sku: 'VCH-OD-0102', template: 'odyah', categories: ['keptari'], name: 'Камізелька «Космач»', about: 'Тепла вовняна камізелька.',
    material: 'Овеча вовна', variants: grid([['odyah-s', 4000], ['odyah-m', 4000], ['odyah-l', 4000], ['odyah-xl', 4000]], ['siryi'], [2, 3, 1, 0]),
  },
  {
    sku: 'VCH-OD-0103', template: 'odyah', categories: ['lizhnykovi-nakydky'], name: 'Накидка «Шешори»', about: 'Вовняна накидка універсального розміру.',
    material: 'Овеча вовна', variants: grid([['odyah-universalnyi', 5300]], ['naturalnyi', 'chervonyi'], [3, 2]),
  },
  {
    sku: 'VCH-PS-0101', template: 'poias', categories: ['poiasy'], name: 'Пояс «Рибниця»', about: 'Тканий вовняний пояс.',
    material: 'Овеча вовна', variants: grid([['poias-90', 600], ['poias-110', 700], ['poias-130', 800]], ['chervonyi'], [5, 4, 2]),
  },
  // Шкарпетки та капці
  {
    sku: 'VCH-SH-0101', template: 'shkarpetky', categories: ['shkarpetky'], name: 'Шкарпетки «Бескид»', about: 'Теплі вовняні шкарпетки.',
    pattern: 'smuhy', material: 'Овеча вовна',
    variants: grid([['shkarpetky-36-38', 240], ['shkarpetky-39-41', 240], ['shkarpetky-42-44', 240], ['shkarpetky-45-46', 240]], ['siryi', 'naturalnyi'], [10, 8, 6, 0]),
  },
  {
    sku: 'VCH-SH-0102', template: 'shkarpetky', categories: ['shkarpetky'], name: 'Шкарпетки «Смерічка»', about: 'Вовняні шкарпетки від партнерів з Косівщини.',
    origin: 'PARTNER_MANUFACTURE', partnerRegion: 'Косівщина', pattern: 'yalynka', material: 'Овеча вовна',
    variants: grid([['shkarpetky-36-38', 220], ['shkarpetky-39-41', 220], ['shkarpetky-42-44', 220]], ['chervonyi'], [6, 4, 3]),
  },
  {
    sku: 'VCH-KP-0101', template: 'kaptsi', categories: ['tapochky'], name: 'Капці «Бистрець»', about: 'Валяні вовняні капці.',
    material: 'Овеча вовна', attrs: { sole: 'шкіряна' },
    variants: grid([['kaptsi-37', 960], ['kaptsi-39', 960], ['kaptsi-41', 960], ['kaptsi-43', 960]], ['siryi'], [2, 3, 1, 2]),
  },
  {
    sku: 'VCH-KP-0102', template: 'kaptsi', categories: ['tapochky'], name: 'Капці «Ужок»', about: 'Вовняні капці від партнерів із Закарпаття.',
    origin: 'PARTNER_MANUFACTURE', partnerRegion: 'Закарпаття', material: 'Овеча вовна',
    variants: grid([['kaptsi-38', 620], ['kaptsi-40', 620], ['kaptsi-42', 620]], ['naturalnyi'], [3, 2, 2]),
  },
  // Шкіра
  {
    sku: 'VCH-SK-0101', template: 'shkiriani-vyroby', categories: ['shkiriani-sumky'], name: 'Сумка «Пістинь»', about: 'Шкіряна сумка через плече.',
    material: 'Шкіра', attrs: { dimensions_cm: '30×25×8' }, variants: [{ colour: 'chornyi', price: uah(3000), stock: 2 }],
  },
  {
    sku: 'VCH-SK-0102', template: 'shkiriani-vyroby', categories: ['shkiriani-sumky'], name: 'Гаманець «Кути»', about: 'Невеликий шкіряний гаманець.',
    material: 'Шкіра', attrs: { dimensions_cm: '12×9' }, variants: [{ colour: 'chornyi', price: uah(960), stock: 4 }, { colour: 'naturalnyi', price: uah(960), stock: 0 }],
  },
];

async function ensureOptionValues(tx: Tx) {
  const colorType = await tx.optionType.findUniqueOrThrow({ where: { key: 'color' }, select: { id: true } });
  const patternType = await tx.optionType.findUniqueOrThrow({ where: { key: 'pattern' }, select: { id: true } });
  let created = 0;
  const upsert = async (optionTypeId: string, key: string, label: string, sortKey: number, extra: Omit<Prisma.OptionValueUncheckedCreateInput, 'optionTypeId' | 'key' | 'sortKey'>) => {
    const found = await tx.optionValue.findUnique({ where: { optionTypeId_key: { optionTypeId, key } }, select: { id: true } });
    if (found) return;
    await tx.optionValue.create({ data: { optionTypeId, key, sortKey, position: sortKey, ...extra, translations: { create: { locale: 'uk', label } } } });
    created++;
  };
  for (const [i, c] of COLOURS.entries())
    await upsert(colorType.id, c.key, c.label, (i + 1) * 10, { hex: c.hex, colorFamily: c.family, isNaturalUndyed: c.undyed });
  for (const [i, p] of PATTERNS.entries()) await upsert(patternType.id, p.key, p.label, (i + 1) * 10, {});
  return created;
}

export async function seedDemo(tx: Tx) {
  const values = await ensureOptionValues(tx);

  const optionId = new Map(
    (await tx.optionValue.findMany({ select: { id: true, key: true, optionType: { select: { key: true } } } })).map((v) => [`${v.optionType.key}:${v.key}`, v.id]),
  );
  const templates = new Map((await tx.productTemplate.findMany({ select: { id: true, key: true, storyStages: true } })).map((t) => [t.key, t]));
  const categoryId = new Map(
    (await tx.categoryTranslation.findMany({ where: { locale: 'uk' }, select: { slug: true, categoryId: true } })).map((t) => [t.slug, t.categoryId]),
  );
  const materialId = new Map(
    (await tx.materialTranslation.findMany({ where: { locale: 'uk' }, select: { name: true, materialId: true } })).map((m) => [m.name, m.materialId]),
  );
  const attrId = new Map((await tx.attributeDefinition.findMany({ select: { id: true, key: true, dataType: true } })).map((a) => [a.key, a]));
  const need = <T>(m: Map<string, T>, k: string, what: string) => {
    const v = m.get(k);
    if (v === undefined) throw new Error(`demo: ${what} ${k} missing; run the catalogue seed first`);
    return v;
  };

  let created = 0;
  const publishedAt = new Date();
  for (const p of PRODUCTS) {
    if (await tx.product.findUnique({ where: { sku: p.sku }, select: { id: true } })) continue;

    const template = need(templates, p.template, 'template');
    const own = (p.origin ?? 'OWN_MANUFACTURE') === 'OWN_MANUFACTURE';
    const prices = p.variants.map((v) => v.price);
    const minPrice = Math.min(...prices);

    await tx.product.create({
      data: {
        sku: p.sku,
        status: 'ACTIVE',
        publishedAt,
        pricingUnit: p.unit ?? 'PIECE',
        origin: p.origin ?? 'OWN_MANUFACTURE',
        partnerName: null, // never rendered; real partner names are entered by the owner
        partnerRegion: p.partnerRegion,
        priceMinMinor: minPrice,
        priceMaxMinor: Math.max(...prices),
        inStock: p.variants.some((v) => v.stock > 0),
        isHandmade: p.handmade ?? false,
        isUniquePiece: p.unique ?? false,
        ...(p.customSize
          ? {
              allowsCustomSize: true,
              madeToOrderDays: 14, // 00-client-decisions-5 §H3b
              customSizeRatePerSqmMinor: uah(2700),
              customSizeMinPriceMinor: minPrice,
              customSizeMinWidthCm: 80,
              customSizeMaxWidthCm: 240,
              customSizeMinLengthCm: 120,
              customSizeMaxLengthCm: 300,
            }
          : {}),
        productionStage: own ? template.storyStages : [], // «Історія виробу»: own manufacture only
        templateId: template.id,
        translations: {
          create: { locale: 'uk', name: p.name, slug: slugify(p.name), description: `${p.about} (демо)` },
        },
        categories: { create: p.categories.map((slug, i) => ({ categoryId: need(categoryId, slug, 'category'), sortOrder: i })) },
        composition: { create: { materialId: need(materialId, p.material, 'material'), role: 'main', percent: 100 } },
        attributes: {
          create: Object.entries(p.attrs ?? {}).map(([key, value]) => {
            const def = need(attrId, key, 'attribute');
            return { definitionId: def.id, ...(def.dataType === 'NUMBER' ? { valueNumber: Number(value) } : { valueText: String(value) }) };
          }),
        },
        variants: {
          create: p.variants.map((v, i) => {
            const size = v.size?.split('-').slice(1).join('').toUpperCase(); // «150X200», «3638», «M»
            const skuParts = [p.sku, size, v.colour && COLOUR_CODE[v.colour]].filter(Boolean);
            const options = [v.size && `size:${v.size}`, v.colour && `color:${v.colour}`, p.pattern && `pattern:${p.pattern}`].filter((o): o is string => !!o);
            return {
              sku: skuParts.join('-'),
              priceMinor: v.price,
              stockQty: v.stock,
              position: i,
              isMainColor: !!v.colour && v.colour === p.variants[0].colour,
              options: { create: options.map((o) => ({ optionValueId: need(optionId, o, 'option value') })) },
            };
          }),
        },
      },
    });
    created++;
  }

  console.log(`demo: +${values} colour/pattern values, +${created} products (${PRODUCTS.length} defined)`);
}

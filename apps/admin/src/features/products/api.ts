import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductDoc } from '@vivcharyk/schemas';
import { api } from '@/lib/api';

export type { ProductDoc };
export type VariantDoc = ProductDoc['variants'][number];
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductRow {
  id: string; sku: string; status: ProductStatus; origin: string; template: string; name: string; slug: string | null; thumb: string | null;
  photoCount: number; category: string | null; priceMinMinor: number; priceMaxMinor: number; pricingUnit: string; stock: number; variantCount: number;
  quick: { variantId: string | null; index: number } | null; madeToOrder: boolean; soldMonth: number; hasDraft: boolean; publishedAt: string | null; updatedAt: string;
}
export type ListTab = 'all' | 'active' | 'draft' | 'hidden' | 'low' | 'out';
export interface ProductsList { items: ProductRow[]; page: { number: number; total: number; hasMore: boolean }; counts: Record<ListTab, number> }

export interface TemplateAttr { id: string; key: string; dataType: string; unit: string | null; isRequired: boolean; name: string; options: Array<{ key: string; label: string }> | null }
export interface TemplateDraft { namePattern: string; description: string; composition: Array<{ materialId: string; role: string; percent: number }>; ratePerSqmMinor: number | null }
export interface Template {
  id: string; key: string; typePrefix: string; axes: string[]; pricingUnits: string[]; requiredFields: string[]; storyStages: string[];
  defaultCategoryId: string | null; isHidden: boolean; skuCode: string; attributes: TemplateAttr[]; draft: TemplateDraft;
}
export interface LibValue {
  id: string; key: string; label: string; hex: string | null; isHidden: boolean; skuCode: string;
  dimensions?: { widthCm?: number; lengthCm?: number } | null;
}
export interface LibCategory { id: string; key: string | null; parentId: string | null; name: string; isActive: boolean; image: string | null; ratePerSqmMinor: number | null }
export interface Libraries {
  sizes: Record<string, LibValue[]>; colors: LibValue[]; patterns: LibValue[];
  materials: Array<{ id: string; group: string; name: string; isHidden: boolean }>;
  categories: LibCategory[];
  collections: Array<{ id: string; name: string; isActive: boolean }>;
  mediaEnabled: boolean;
}
export interface ReadinessItem { key: string; label: string; ok: boolean; blocking: boolean }
export interface Readiness { done: number; total: number; missing: string[]; items: ReadinessItem[] }
export interface Photo { id: string; thumb: string | null; large: string | null; width: number; height: number }
export interface ProductDetail {
  id: string; sku: string; status: ProductStatus; templateKey: string; slug: string | null; publishedAt: string | null;
  hasDraft: boolean; draftUpdatedAt: string | null; photoCount: number; photos: Photo[]; document: ProductDoc; readiness: Readiness;
  revisions: Array<{ id: string; createdAt: string; publishedAt: string | null }>;
}

export const LIST_KEY = ['products'] as const;

export function useProductList(params: URLSearchParams) {
  const qs = params.toString();
  return useInfiniteQuery({
    queryKey: [...LIST_KEY, qs],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<ProductsList>(`/admin/products?${qs}${qs ? '&' : ''}page=${pageParam}`),
    getNextPageParam: (last) => (last.page.hasMore ? last.page.number + 1 : undefined),
    placeholderData: (prev) => prev,
  });
}
export const useTemplates = () => useQuery({ queryKey: ['product-templates'], queryFn: () => api<{ items: Template[] }>('/admin/product-templates'), staleTime: 300_000, select: (d) => d.items });
export const useLibraries = () => useQuery({ queryKey: ['product-libraries'], queryFn: () => api<Libraries>('/admin/product-libraries'), staleTime: 300_000 });
export const useProduct = (id: string | null) => useQuery({ queryKey: ['product', id], queryFn: () => api<ProductDetail>(`/admin/products/${id}`), enabled: !!id });

export function useRefreshProducts() {
  const qc = useQueryClient();
  return (id?: string) => Promise.all([qc.invalidateQueries({ queryKey: LIST_KEY }), id ? qc.invalidateQueries({ queryKey: ['product', id] }) : null]);
}

export const STAGE_LABEL: Record<string, string> = {
  tanning: 'Вичинка шкур', washing: 'Миття', carding: 'Чесання', spinning: 'Прядіння', weaving: 'Ткання', felting: 'Валяння', sewing: 'Пошиття',
};
export const PRODUCT_STATUS: Record<ProductStatus, string> = { DRAFT: 'Чернетка', ACTIVE: 'На сайті', ARCHIVED: 'Прихований' };
export const UNIT_LABEL: Record<string, string> = { PIECE: 'за штуку', KILOGRAM: 'за кілограм', SKEIN: 'за моток', METRE: 'за метр' };
// 37 §37.2 template names.
export const TEMPLATE_LABEL: Record<string, string> = {
  lizhnyk: 'Ліжник / плед / ковдра', podushka: 'Подушка', odyah: 'Одяг (гуня, камізелька, накидка)', shkarpetky: 'Шкарпетки',
  kaptsi: 'Капці', priazha: 'Пряжа / ровниця / вовна', ovchyna: 'Овчина', 'shkiriani-vyroby': 'Шкіряні вироби', poias: 'Пояси', derevo: 'Дерево',
};
export const PRODUCTS_COLOR = '#C77D58';
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://127.0.0.1:5173';

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// What a new product starts with, per template (round 20 #154–156, #127, #160, #163): the name
// pattern, the description draft, the composition and the price per m². Kept in Setting (no schema
// change); edited on «Шаблони товарів». Tokens are filled in the panel: {тип} {колір} {розмір}
// {назва} {склад} {розміри} {виготовлення}. Nothing here states a fact the owner has not given:
// the description is a structure with gaps, the making line is built from the template's real stages.

export const SETTING_KEY = 'products.templateDrafts';

export const templateDraft = z.object({
  namePattern: z.string().trim().max(120),
  description: z.string().max(4000),
  composition: z.array(z.object({ materialId: z.string(), role: z.string().max(20), percent: z.number().int().min(1).max(100) })).max(12),
  ratePerSqmMinor: z.number().int().min(0).max(10_000_000).nullable(),
});
export type TemplateDraft = z.infer<typeof templateDraft>;

const DESCRIPTION = '{назва}.\n\nЧому вам сподобається:\n– \n– \n– \n\nСклад: {склад}.{розміри}\n\n{виготовлення}';
const NAME: Record<string, string> = { lizhnyk: '{тип} вовняний {колір} {розмір}' };
// Templates whose goods are wool through and through; pillows (filling) and the rest start empty.
const MATERIAL: Record<string, string> = {
  lizhnyk: 'Овеча вовна', odyah: 'Овеча вовна', shkarpetky: 'Овеча вовна', kaptsi: 'Овеча вовна', priazha: 'Овеча вовна', poias: 'Овеча вовна',
  ovchyna: 'Овчина', 'shkiriani-vyroby': 'Шкіра',
};

export async function templateDrafts(): Promise<Record<string, TemplateDraft>> {
  const [row, templates, materials] = await Promise.all([
    prisma.setting.findUnique({ where: { key: SETTING_KEY } }),
    prisma.productTemplate.findMany({ select: { key: true } }),
    prisma.materialTranslation.findMany({ where: { locale: 'uk', name: { in: [...new Set(Object.values(MATERIAL))] } }, select: { name: true, materialId: true } }),
  ]);
  const stored = (row?.value ?? {}) as Record<string, Partial<TemplateDraft>>;
  const material = new Map(materials.map((m) => [m.name, m.materialId]));
  return Object.fromEntries(templates.map(({ key }) => {
    const s = stored[key] ?? {};
    const m = MATERIAL[key] && material.get(MATERIAL[key]);
    return [key, {
      namePattern: s.namePattern ?? NAME[key] ?? '{тип} {колір} {розмір}',
      description: s.description ?? DESCRIPTION,
      composition: s.composition ?? (m ? [{ materialId: m, role: 'main', percent: 100 }] : []),
      ratePerSqmMinor: s.ratePerSqmMinor ?? null,
    }];
  }));
}

export async function saveTemplateDraft(key: string, draft: TemplateDraft, actorId: string) {
  const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  const value = { ...((row?.value ?? {}) as Record<string, unknown>), [key]: draft } as Prisma.InputJsonValue;
  await prisma.setting.upsert({ where: { key: SETTING_KEY }, create: { key: SETTING_KEY, value, updatedById: actorId }, update: { value, updatedById: actorId } });
}

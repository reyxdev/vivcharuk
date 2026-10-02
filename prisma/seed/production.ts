// Production stages (docs/20 §20.6), limited to the stages the client claims (round 9 §F1):
// вичинка шкур, миття, чесання, прядіння, ткання, валяння, пошиття. No flock, no shearing, no dyeing.
// Create-only by key, so the owner's later edits survive deploys. The fact slots (duration,
// temperature, machine, person) stay null until the client states them; they are never invented.
import type { Prisma, ProductionTrack } from '@prisma/client';

const STAGES: Array<{ key: string; track: ProductionTrack; position: number; title: string; body: string }> = [
  { key: 'washing', track: 'WOOL', position: 10, title: 'Миття',
    body: 'Сиру вовну перемо: вода забирає бруд і жир. Після миття вовна сохне, і лише суха йде далі.' },
  { key: 'carding', track: 'WOOL', position: 20, title: 'Чесання',
    body: 'Мита вовна йде на чесальну машину. Сплутане руно розділяється на паралельні волокна й виходить безперервною стрічкою — рівницею.' },
  { key: 'spinning', track: 'WOOL', position: 30, title: 'Прядіння',
    body: 'З рівниці прядемо нитку. Тут задається товщина пряжі: з неї тчемо ліжники й пояси, а частину продаємо мотками.' },
  { key: 'weaving', track: 'WOOL', position: 40, title: 'Ткання',
    body: 'На ткацькому верстаті пряжа стає полотном — ліжником, пледом, поясом чи тканиною для одягу.' },
  { key: 'felting', track: 'WOOL', position: 50, title: 'Валяння',
    body: 'Виткане полотно валяють: вовна ущільнюється, а ворс піднімається. Так ліжник стає густим і пухнастим. Валяємо й капці.' },
  { key: 'sewing', track: 'WOOL', position: 60, title: 'Пошиття',
    body: 'Обробляємо краї, шиємо гуні, камізельки, подушки й капці. Тут же, в тому самому цеху, шиють вироби з овчини та шкіри.' },
  { key: 'tanning', track: 'HIDE', position: 10, title: 'Вичинка шкур',
    body: 'Овечі шкури вичинюємо самі: від сирої шкури до м’якої овчини й шкіри, з яких потім шиємо вироби.' },
];

export async function seedProduction(tx: Prisma.TransactionClient) {
  let created = 0;
  for (const s of STAGES) {
    if (await tx.productionStage.findUnique({ where: { key: s.key } })) continue;
    await tx.productionStage.create({
      data: { key: s.key, track: s.track, position: s.position, translations: { create: { locale: 'uk', title: s.title, body: s.body } } },
    });
    created++;
  }
  console.log(`production stages: ${created} created`);
}

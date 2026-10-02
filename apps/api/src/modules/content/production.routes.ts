import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { locale } from '@vivcharyk/schemas';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';

const media = (m: { id: string; publicId: string; width: number; height: number; kind: string; durationSec: number | null } | null) =>
  m && { id: m.id, publicId: m.publicId, width: m.width, height: m.height, kind: m.kind, durationSec: m.durationSec };

/**
 * Production stages for «Як ми виробляємо» (20 §20.6). The render rule: a stage without a
 * photograph does not reach the page. Outside production the rule is relaxed so the page can be
 * built before the shoot; such stages carry `preview: true`.
 */
export async function productionRoutes(app: FastifyInstance) {
  app.get('/production/stages', async (req, reply) => {
    const { locale: l } = z.object({ locale: locale.default('uk') }).parse(req.query);
    const rows = await prisma.productionStage.findMany({
      where: { isActive: true, ...(config.isProd ? { photoId: { not: null } } : {}) },
      orderBy: [{ track: 'asc' }, { position: 'asc' }],
      include: { translations: true, photo: true, video: true },
    });
    reply.header('cache-control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
    return {
      items: rows.flatMap((s) => {
        const t = s.translations.find((x) => x.locale === l) ?? s.translations.find((x) => x.locale === 'uk');
        if (!t) return [];
        return [{
          key: s.key, track: s.track, title: t.title, body: t.body, fallback: t.locale !== l,
          facts: { duration: t.duration, temperature: t.temperature, machine: t.machine, person: t.person },
          photo: media(s.photo), video: media(s.video), preview: !s.photo,
        }];
      }),
    };
  });
}

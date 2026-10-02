import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { mkdirSync } from 'node:fs';
import { config } from '../config';

// Photos and videos stored as files (round 18: product photos before Cloudinary). Every file name
// carries a hash of its content, so a changed photo gets a new name: the browser and any CDN may keep
// each file for a year. Video files are served with range requests for seeking.
export async function mediaStatic(app: FastifyInstance) {
  // Created at start, so photos uploaded from the panel are served without a restart.
  mkdirSync(config.media.dir, { recursive: true });
  await app.register(fastifyStatic, {
    root: config.media.dir,
    prefix: '/media/',
    decorateReply: false,
    acceptRanges: true,
    cacheControl: false,
    setHeaders: (res) => res.setHeader('cache-control', 'public, max-age=31536000, immutable'),
  });
}

// Production-stage video loops (round 18).
//   npx tsx --env-file=.env scripts/import-stage-videos.ts scripts/data/<batch>.json [folder with the originals]
// Cuts a short silent loop from each original with ffmpeg: H.264 MP4 at 480p and 720p with «faststart»
// (playback starts before the file is complete), plus a poster frame as WebP in three widths. Files go
// to MEDIA_DIR/production/<stage>/, named by a hash of the cut; the stage gets the video and the poster
// as its photo. Converted files are listed in <batch>.media.json, so the server needs no originals.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

interface Clip { stage: string; file: string; start: number; length: number; alt: string }
type Done = { video: string; poster: string; width: number; height: number; bytes: number; durationSec: number };

const [manifestPath, srcDir] = process.argv.slice(2);
if (!manifestPath) throw new Error('usage: import-stage-videos.ts <manifest.json> [originals folder]');
const { stages } = JSON.parse(readFileSync(manifestPath, 'utf8')) as { stages: Clip[] };
const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve('media');
const lockPath = manifestPath.replace(/\.json$/, '.media.json');
const lock: Record<string, Done> = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : {};
const local = (id: string) => path.join(MEDIA_DIR, id.slice('local:'.length));
const filesOf = (d: Done) => [`${local(d.video)}-480.mp4`, `${local(d.video)}-720.mp4`, ...[480, 960, 1600].map((w) => `${local(d.poster)}-${w}.webp`)];
const ff = (args: string[]) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

function cut(c: Clip): Done {
  const src = path.join(srcDir!, c.file);
  const hash = createHash('sha1').update(`${c.file}|${statSync(src).size}|${c.start}|${c.length}`).digest('hex').slice(0, 12);
  const base = `production/${c.stage}/${hash}`;
  mkdirSync(path.dirname(local(`local:${base}`)), { recursive: true });
  for (const h of [480, 720]) {
    const out = `${local(`local:${base}`)}-${h}.mp4`;
    if (!existsSync(out)) {
      ff(['-ss', String(c.start), '-t', String(c.length), '-i', src, '-an', '-vf', `scale=-2:${h},fps=30`, '-c:v', 'libx264', '-preset', 'slow',
        '-crf', h === 480 ? '28' : '26', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
    }
  }
  const frame = `${local(`local:${base}`)}-poster.png`;
  if (!existsSync(frame)) ff(['-ss', String(c.start + 0.5), '-i', src, '-frames:v', '1', '-vf', 'scale=1600:-2', frame]);
  for (const w of [480, 960, 1600]) {
    const out = `${local(`local:${base}`)}-poster-${w}.webp`;
    if (!existsSync(out)) execFileSync('magick', [frame, '-resize', `${w}x`, '-quality', '78', out]);
  }
  const [width, height] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', `${local(`local:${base}`)}-720.mp4`]).toString().trim().split(',').map(Number);
  return { video: `local:${base}`, poster: `local:${base}-poster`, width: width!, height: height!, bytes: statSync(`${local(`local:${base}`)}-720.mp4`).size, durationSec: c.length };
}

const db = new PrismaClient();
for (const c of stages) {
  const key = `${c.stage}/${c.file}/${c.start}/${c.length}`;
  let d = lock[key];
  if (!d || !filesOf(d).every((f) => existsSync(f))) {
    if (!srcDir) throw new Error(`${key}: not converted yet and no originals folder given`);
    d = lock[key] = cut(c);
  }
  const stage = await db.productionStage.findUnique({ where: { key: c.stage }, select: { id: true, videoId: true } });
  if (!stage) throw new Error(`stage ${c.stage} not found`);
  const current = stage.videoId ? await db.media.findUnique({ where: { id: stage.videoId }, select: { publicId: true } }) : null;
  if (current?.publicId === d.video) { console.log(`${c.stage}: already set`); continue; }
  await db.$transaction(async (tx) => {
    const poster = await tx.media.create({ data: { provider: 'local', publicId: d!.poster, format: 'webp', width: d!.width, height: d!.height, bytes: 0, kind: 'IMAGE', translations: { create: { locale: 'uk', alt: c.alt } } } });
    const video = await tx.media.create({ data: { provider: 'local', publicId: d!.video, format: 'mp4', width: d!.width, height: d!.height, bytes: d!.bytes, kind: 'VIDEO', durationSec: d!.durationSec, posterId: poster.id, translations: { create: { locale: 'uk', alt: c.alt } } } });
    await tx.productionStage.update({ where: { key: c.stage }, data: { videoId: video.id, photoId: poster.id } });
  });
  console.log(`${c.stage}: video ${(d.bytes / 1e6).toFixed(1)} MB (720p), poster set`);
}
if (srcDir) writeFileSync(lockPath, JSON.stringify(lock, null, 1) + '\n');
await db.$disconnect();

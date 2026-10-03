// Photo URLs from a Media publicId. «local:<path>» files are stored by the site itself (round 18, before
// Cloudinary); anything else is a Cloudinary id.
// Round 24 (G030–G035): photos made by the new pipeline live under «local:photos/…» and come in seven widths,
// WebP and AVIF, plus <path>-og.jpg (1200×630). Every other local picture has <path>-480/-960/-1600.webp.
const LEGACY_WIDTHS = [480, 960, 1600];
const SET_WIDTHS = [160, 240, 480, 720, 960, 1200, 1600];
const CLOUD_WIDTHS = [400, 800, 1200, 1600];

export const isLocal = (publicId: string) => publicId.startsWith('local:');
/** A photo of the round-24 pipeline: has AVIF, the 160–1200 steps and an og:image file. */
export const isPhotoSet = (publicId: string) => publicId.startsWith('local:photos/');
const widthsOf = (publicId: string) => (!isLocal(publicId) ? CLOUD_WIDTHS : isPhotoSet(publicId) ? SET_WIDTHS : LEGACY_WIDTHS);

/** The smallest file at least `width` wide (the largest there is otherwise). */
export function mediaUrl(publicId: string, width: number, format: 'webp' | 'avif' = 'webp') {
  if (!isLocal(publicId)) return `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
  const all = widthsOf(publicId);
  const w = all.find((x) => x >= width) ?? all[all.length - 1]!;
  return `/media/${publicId.slice('local:'.length)}-${w}.${format === 'avif' && isPhotoSet(publicId) ? 'avif' : 'webp'}`;
}

/** srcset for responsive images: the browser picks the smallest file that fills the slot. `max` caps the widths offered. */
export function mediaSrcSet(publicId: string, format: 'webp' | 'avif' = 'webp', max = Infinity) {
  const all = widthsOf(publicId);
  const widths = all.filter((w) => w <= max);
  return (widths.length ? widths : [all[0]!]).map((w) => `${mediaUrl(publicId, w, format)} ${w}w`).join(', ');
}

/** og:image of a photo (G132): the 1200×630 crop when the photo has one, else its largest WebP (size unknown). */
export function ogImage(publicId: string): { url: string; width?: number; height?: number } {
  if (isPhotoSet(publicId)) return { url: `/media/${publicId.slice('local:'.length)}-og.jpg`, width: 1200, height: 630 };
  return { url: mediaUrl(publicId, 1600) };
}

/** Video loop file of a local video Media: <path>-480.mp4 or -720.mp4 (round 18, production stages). */
export const videoUrl = (publicId: string, height: 480 | 720) => `/media/${publicId.slice('local:'.length)}-${height}.mp4`;

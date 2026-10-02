// Photo URLs from a Media publicId. «local:<path>» files are stored by the site itself in three widths
// (round 18, before Cloudinary): <path>-480.webp, -960.webp, -1600.webp. Anything else is a Cloudinary id.
const LOCAL_WIDTHS = [480, 960, 1600];

export const isLocal = (publicId: string) => publicId.startsWith('local:');

export function mediaUrl(publicId: string, width: number) {
  if (!isLocal(publicId)) return `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
  const w = LOCAL_WIDTHS.find((x) => x >= width) ?? LOCAL_WIDTHS[LOCAL_WIDTHS.length - 1]!;
  return `/media/${publicId.slice('local:'.length)}-${w}.webp`;
}

/** srcset for responsive images: the browser picks the smallest file that fills the slot. */
export function mediaSrcSet(publicId: string) {
  const widths = isLocal(publicId) ? LOCAL_WIDTHS : [400, 800, 1200, 1600];
  return widths.map((w) => `${mediaUrl(publicId, w)} ${w}w`).join(', ');
}

/** Video loop file of a local video Media: <path>-480.mp4 or -720.mp4 (round 18, production stages). */
export const videoUrl = (publicId: string, height: 480 | 720) => `/media/${publicId.slice('local:'.length)}-${height}.mp4`;

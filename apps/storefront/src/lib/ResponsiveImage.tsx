import type { ImgHTMLAttributes } from 'react';
import { isPhotoSet, mediaSrcSet, mediaUrl } from './media';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  publicId: string;
  /** The slot's width in CSS px or a media list, as for <img sizes>. */
  sizes: string;
  /** Width of the fallback `src` (browsers without srcset); defaults to 960. */
  fallback?: number;
  /** Largest file offered (e.g. 240 for a thumbnail). */
  max?: number;
};

/**
 * Round 24 G030: a photo in every width there is, AVIF first where the photo has it (<picture>), WebP
 * otherwise. Pass the same attributes as to <img>; `sizes` is required, so the browser picks the right file.
 */
export function ResponsiveImage({ publicId, sizes, fallback = 960, max, ...img }: Props) {
  const tag = <img src={mediaUrl(publicId, Math.min(fallback, max ?? fallback))} srcSet={mediaSrcSet(publicId, 'webp', max)} sizes={sizes} {...img} />;
  if (!isPhotoSet(publicId)) return tag;
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={mediaSrcSet(publicId, 'avif', max)} sizes={sizes} />
      {tag}
    </picture>
  );
}

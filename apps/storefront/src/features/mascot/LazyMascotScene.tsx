import { lazy, Suspense, type ComponentProps } from 'react';
import type { MascotScene as Scene } from './MascotScene';

const MascotScene = lazy(() => import('./MascotScene').then((m) => ({ default: m.MascotScene })));

/**
 * Round 24 G039: the mascot (≈40 KB of drawings) for places that appear only sometimes — the empty cart,
 * an empty listing, the 404 — so ordinary pages do not download it up front. The page renders it on the
 * server as before; while the file loads in the browser an empty box of the same size holds its place.
 */
export function LazyMascotScene(props: ComponentProps<typeof Scene>) {
  return (
    <Suspense fallback={<svg viewBox="0 0 600 360" className={props.className} aria-hidden="true" />}>
      <MascotScene {...props} />
    </Suspense>
  );
}

import type { ReactNode } from 'react';

// Round 11: each homepage section's top edge is a soft hill in the colour of the section above.
// Decorative, behind the content (z -1 inside an isolated section), so nothing in the hill zone
// loses clicks. Round 10 part 2 #24 / round 11: peach and cream sections alternate.
const HILLS = [
  'M0 0H1440V42Q1180 12 940 44T480 34T0 26Z',
  'M0 0H1440V24Q1260 58 1000 38Q760 18 560 48T0 32Z',
  'M0 0H1440V30Q1300 64 1120 42T760 48T380 30T0 46Z',
];

export type Tone = 'page' | 'alt';

export function Band({ tone, hill, id, className = '', children }: { tone: Tone; hill: number; id?: string; className?: string; children: ReactNode }) {
  const above = tone === 'page' ? 'alt' : 'page';
  return (
    // content-visibility: a section off screen is skipped by style, layout and paint, so the hero's animation
    // does not pay for the whole page on every frame (the hill sits inside the section, nothing is clipped).
    <section id={id} className={`relative isolate ${tone === 'page' ? 'bg-bg-page' : 'bg-bg-alt'} pb-12 pt-20 lg:pb-14 lg:pt-24 [content-visibility:auto] [contain-intrinsic-size:auto_640px]`}>
      <svg viewBox="0 0 1440 66" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[66px] w-full">
        <path d={HILLS[hill % HILLS.length]} fill={`var(--bg-${above})`} />
      </svg>
      <div className={`mx-auto max-w-(--container-wide) px-4 lg:px-12 ${className}`}>{children}</div>
    </section>
  );
}

/** The Hutsul rhombus before homepage headings (canvas board «Головна»). */
export function Rhombus() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
      <path d="M11 1L21 11L11 21L1 11Z" fill="#C9A96A" />
      <path d="M11 5L17 11L11 17L5 11Z" fill="#B3261E" />
      <path d="M11 8.5L13.5 11L11 13.5L8.5 11Z" fill="#FAF8F4" />
    </svg>
  );
}

export function BandTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`flex items-center gap-3.5 text-h2 text-text-primary ${className}`}><Rhombus />{children}</h2>;
}

import type { RefObject } from 'react';

/** The needle that leads a drawn thread (hero title, production path): eye at (0, 0), tip along +x. */
export function Needle({ refEl }: { refEl: RefObject<SVGGElement | null> }) {
  return (
    <g ref={refEl} style={{ visibility: 'hidden' }}>
      <path d="M32 0L5 -1.9Q-1 -2.3 -2.2 0Q-1 2.3 5 1.9Z" fill="#D5DADD" stroke="#1B1712" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M7 -0.7L27 -0.1" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" opacity="0.9" />
      <ellipse cx="1.2" cy="0" rx="2.1" ry="0.75" fill="#1B1712" />
    </g>
  );
}


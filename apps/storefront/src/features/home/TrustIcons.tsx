// Round 11 U4: small illustrations in the mascot's style — колиба (own production), tape measure
// over a blanket (custom size), star with a ribbon (Google rating). «30+» stays typographic.
const ink = '#1B1712';

export const IconHut = () => (
  <svg width="72" height="58" viewBox="0 0 80 64" aria-hidden="true">
    <path d="M47.5 10q-3-4 1-6.5t1-3.5" fill="none" stroke="#9A968D" strokeWidth="2" strokeLinecap="round" />
    <rect x="44" y="14" width="7" height="16" fill="#8A5A33" stroke={ink} strokeWidth="2" />
    <rect x="42.5" y="11.5" width="10" height="3" rx="0.5" fill="#5A3A22" stroke={ink} strokeWidth="1.5" />
    <path d="M10 34L34 14L58 34" fill="#8A5A33" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="14" y="32" width="40" height="26" fill="#E8D3AE" stroke={ink} strokeWidth="2.5" />
    <path d="M14 40h40M14 48h40" stroke="#B0842A" strokeWidth="1.5" />
    <rect x="28" y="42" width="11" height="16" fill="#5A3A22" stroke={ink} strokeWidth="2" />
    <path d="M68 58L68 44M62 50l6-10 6 10zM60 58l8-14 8 14z" fill="#2E7355" stroke={ink} strokeWidth="1.5" />
  </svg>
);

export const IconMeasure = () => (
  <svg width="72" height="58" viewBox="0 0 80 64" aria-hidden="true">
    <rect x="6" y="36" width="60" height="18" rx="3" fill="#B3261E" stroke={ink} strokeWidth="2.5" />
    <path d="M14 45l5-5 5 5-5 5zM44 45l5-5 5 5-5 5z" fill="#FAF8F4" />
    <circle cx="58" cy="22" r="14" fill="#E0B33A" stroke={ink} strokeWidth="2.5" />
    <circle cx="58" cy="22" r="4" fill="#FAF8F4" stroke={ink} strokeWidth="1.5" />
    <path d="M44 26L10 30L10 22L46 18" fill="#FFF3D6" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 22v4M22 21v6M28 21v4M34 20v6M40 19v4" stroke={ink} strokeWidth="1.3" />
  </svg>
);

export const IconStar = () => (
  <svg width="72" height="58" viewBox="0 0 80 64" aria-hidden="true">
    <path d="M30 40L22 60L30 56L34 62L38 42M50 40L58 60L50 56L46 62L42 42" fill="#B3261E" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <path d="M40 4l7.6 15.4 17 2.5-12.3 12 2.9 16.9L40 43l-15.2 8 2.9-16.9-12.3-12 17-2.5z" fill="#E0B33A" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M34 26q6 5 12 0" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

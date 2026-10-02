import shepherd from './art/shepherd.symbol.svg?raw';
import sheep from './art/sheep.symbol.svg?raw';
// The right arm is drawn with the staff in the hero; here it is its own symbol so it can hold a lantern.
import armStaff from './art/shepherd-arm-staff.symbol.svg?raw';

// Mascot surfaces beyond the hero (round 10 part 3 #22, part 5 #4, part 8 #16; round 11 #27, #39):
// the same shepherd and sheep as the hero, in short scenes played once, then a resting pose; a still
// frame under reduced motion.
//   search — the shepherd looks for a sheep with a lantern; it peeks from behind a bush (404, empty
//            search or filter result);
//   cart   — a sheep peers into the empty basket while the shepherd stands by.
const ink = '#1B1712';

const css = `
.m-swing{transform-box:view-box;transform-origin:203px 194px;animation:m-swing 2.2s ease-in-out 1 both}
.m-glow{animation:m-glow 2.4s ease-in-out infinite alternate}
.m-peek{animation:m-peek 2s cubic-bezier(.3,1.3,.5,1) .6s 1 both}
.m-lean{transform-box:view-box;transform-origin:182px 336px;animation:m-lean 1.6s ease-in-out .3s 1 both}
@keyframes m-swing{0%{transform:rotate(0)}30%{transform:rotate(9deg)}60%{transform:rotate(-6deg)}100%{transform:rotate(0)}}
@keyframes m-glow{from{opacity:.45}to{opacity:.8}}
@keyframes m-peek{0%{transform:translateX(60px)}60%{transform:translateX(0)}100%{transform:translateX(0)}}
@keyframes m-lean{0%{transform:rotate(0)}100%{transform:rotate(5deg)}}
.m-wave{transform-box:view-box;transform-origin:327px 140px;animation:m-wave 1.8s ease-in-out .2s 1 both}
.m-hop{transform-box:view-box;animation:m-hop .5s cubic-bezier(.3,1.4,.5,1) 3 both}
.m-hop2{animation-delay:.25s}
@keyframes m-wave{0%{transform:rotate(-100deg)}20%{transform:rotate(-78deg)}40%{transform:rotate(-104deg)}60%{transform:rotate(-78deg)}80%{transform:rotate(-104deg)}100%{transform:rotate(-92deg)}}
@keyframes m-hop{0%,100%{transform:translateY(0)}45%{transform:translateY(-26px)}}
@media (prefers-reduced-motion:reduce){.m-swing,.m-glow,.m-peek,.m-lean,.m-hop{animation:none}.m-wave{animation:none;transform:rotate(-92deg)}}
`;

function Ground() {
  return (
    <>
      <ellipse cx="300" cy="338" rx="280" ry="16" fill="#8DB580" opacity=".45" />
      <path d="M40 338q4-14 8 0M60 338q2-10 6 0M470 338q4-14 8 0M500 338q3-12 6 0M520 338q4-15 8 0M120 338q3-11 6 0" fill="none" stroke="#4E9A6A" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Lantern() {
  return (
    <g transform="translate(203 194)">
      <g className="m-swing">
        <circle cx="0" cy="32" r="40" fill="url(#m-light)" className="m-glow" />
        <path d="M0 0v10" stroke={ink} strokeWidth="2.5" />
        <path d="M-6 12a6 6 0 0 1 12 0" fill="none" stroke={ink} strokeWidth="2.5" />
        <path d="M-10 18h20l-3-6h-14z" fill="#8A5A33" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <rect x="-11" y="18" width="22" height="28" rx="3" fill="#FFE39A" stroke={ink} strokeWidth="2.5" />
        <path d="M-4 22v20M4 22v20" stroke="#B0842A" strokeWidth="1.5" />
        <path d="M0 26q-4 6 0 11q4-5 0-11z" fill="#E0B33A" stroke="#B0842A" strokeWidth="1" />
        <rect x="-13" y="45" width="26" height="5" rx="1.5" fill="#8A5A33" stroke={ink} strokeWidth="2" />
      </g>
    </g>
  );
}

function Bush() {
  return (
    <g stroke={ink} strokeWidth="2.5">
      <circle cx="462" cy="292" r="48" fill="#2E7355" />
      <circle cx="518" cy="270" r="60" fill="#2E7355" />
      <circle cx="564" cy="302" r="34" fill="#2E7355" />
      <circle cx="478" cy="276" r="3.5" fill="#E0B33A" stroke="none" /><circle cx="528" cy="238" r="3.5" fill="#FAF8F4" stroke="none" /><circle cx="556" cy="296" r="3.5" fill="#6C7FC4" stroke="none" /><circle cx="504" cy="312" r="3" fill="#FAF8F4" stroke="none" />
    </g>
  );
}

function Basket() {
  return (
    <g stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M262 262q48-70 96 0" fill="none" stroke="#8A5A33" strokeWidth="7" />
      <path d="M262 262q48-70 96 0" fill="none" />
      <path d="M244 262h132l-12 64a8 8 0 0 1-8 6h-92a8 8 0 0 1-8-6z" fill="#C9A96A" />
      <path d="M252 282h116M256 302h108" stroke="#8A5A33" strokeWidth="2" />
      <path d="M276 266v62M300 266v64M324 266v64M348 266v62" stroke="#8A5A33" strokeWidth="2" />
      <path d="M240 262h140" strokeWidth="5" />
    </g>
  );
}

export function MascotScene({ kind, className = '' }: { kind: 'search' | 'cart' | 'thanks'; className?: string }) {
  return (
    <svg viewBox="0 0 600 360" role="img" aria-label={kind === 'search' ? 'Пастух з ліхтарем шукає вівцю, а вона ховається за кущем' : kind === 'thanks' ? 'Пастух махає рукою, вівці радісно підстрибують' : 'Вівця заглядає в порожній кошик'} className={className}>
      <defs dangerouslySetInnerHTML={{ __html: `${shepherd}${sheep}${armStaff}<radialGradient id="m-light"><stop offset="0" stop-color="#FFE39A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE39A" stop-opacity="0"/></radialGradient>` }} />
      <style>{css}</style>
      <Ground />
      {kind === 'thanks' ? (
        <>
          {/* Round 11 #49: the shepherd waves, the sheep hop with joy (plays once, soft overshoot). */}
          <g className="m-hop"><use href="#m-sheep" x="10" y="198" width="205" height="140" /></g>
          <use href="#m-shepbody" x="207" y="28" width="180" height="336" />
          <g className="m-wave"><use href="#m-sheparm" x="207" y="28" width="180" height="336" /></g>
          <g className="m-hop m-hop2"><use href="#m-sheep" transform="translate(590 198) scale(-1 1)" width="205" height="140" /></g>
        </>
      ) : kind === 'search' ? (
        <>
          {/* Feet on the grass (y 28 puts the soles at the ground line); the lantern hangs from the fist. */}
          <use href="#m-shepbody" x="60" y="28" width="180" height="336" />
          <Lantern />
          <use href="#m-sheparm" x="60" y="28" width="180" height="336" />
          {/* The sheep faces the shepherd from behind the bush (the art faces right, so it is mirrored). */}
          <g className="m-peek"><use href="#m-sheep" transform="translate(598 198) scale(-1 1)" width="205" height="140" /></g>
          <Bush />
        </>
      ) : (
        <>
          <use href="#m-shepbody" x="400" y="28" width="180" height="336" />
          <use href="#m-shepstaff" x="400" y="28" width="180" height="336" />
          <use href="#m-sheparm" x="400" y="28" width="180" height="336" />
          <g className="m-lean"><use href="#m-sheep" x="40" y="198" width="205" height="140" /></g>
          <Basket />
        </>
      )}
    </svg>
  );
}

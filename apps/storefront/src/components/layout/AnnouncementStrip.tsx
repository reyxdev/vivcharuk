import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useT } from '@/lib/i18n';

/**
 * Round 11 «Announcement strip: slow ticker» (round 10 part 2 #25: one strip, the seasonal message
 * joins it while active). ~40 px/s, pauses on hover, a visible pause button (WCAG 2.2.2),
 * close ×; the first message stands still under reduced motion; screen readers get the list once.
 * Round 24: the text fades out at both edges instead of being cut (G164); the buttons answer a 44 px touch
 * area with the same look (G165); the looping copy is hidden from screen readers on its own as well (G048).
 */
export interface StripMessage { text: string; href?: string | null }

const SPEED = 40; // px per second
// 44 px wide, and 44 px tall through a transparent pseudo-element over the 36 px strip.
const HIT = "relative grid h-9 w-11 shrink-0 place-items-center hover:opacity-80 after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']";
const KEY = 'vk_strip_closed';

function Rhombus() {
  return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="mx-5 shrink-0"><path d="M5 0L10 5L5 10L0 5Z" fill="#C9A96A" /></svg>;
}

// The moving copies are hidden from assistive tech, so their links take no keyboard focus; every
// target is also in the menu or the footer.
function Item({ m }: { m: StripMessage }) {
  return m.href
    ? <Link to={m.href} tabIndex={-1} className="shrink-0 whitespace-nowrap underline-offset-2 hover:underline">{m.text}</Link>
    : <span className="shrink-0 whitespace-nowrap">{m.text}</span>;
}

export function AnnouncementStrip({ messages }: { messages: StripMessage[] }) {
  const tr = useT();
  const sig = messages.map((m) => m.text).join('|');
  const [closed, setClosed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(60);
  const run = useRef<HTMLDivElement>(null);

  // Closing hides this set of messages for the visit; a new seasonal message shows again.
  useEffect(() => { try { setClosed(sessionStorage.getItem(KEY) === sig); } catch { /* storage blocked */ } }, [sig]);
  useEffect(() => {
    const w = run.current ? run.current.scrollWidth / 2 : 0;
    if (w) setDuration(Math.max(20, w / SPEED));
  }, [sig]);

  if (closed || !messages.length) return null;
  const close = () => { setClosed(true); try { sessionStorage.setItem(KEY, sig); } catch { /* storage blocked */ } };

  return (
    <div className="relative flex h-9 items-center bg-bg-inverted text-body-sm text-text-on-inverted">
      <ul className="sr-only">{messages.map((m) => <li key={m.text}>{m.text}</li>)}</ul>
      <div className="group relative flex h-full min-w-0 flex-1 items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)]" aria-hidden="true">
        {/* Two copies side by side; the track moves by exactly one copy and loops seamlessly. */}
        <div ref={run} className="vk-strip-run flex w-max items-center group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s`, animationPlayState: paused ? 'paused' : undefined }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy === 1 || undefined}>
              {messages.map((m) => <span key={m.text} className="flex items-center"><Item m={m} /><Rhombus /></span>)}
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? tr('strip.resume') : tr('strip.pause')} aria-pressed={paused}
        className={`vk-strip-pause ${HIT}`}>
        {paused
          ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7-4.5z" fill="currentColor" /></svg>
          : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" /></svg>}
      </button>
      <button type="button" onClick={close} aria-label={tr('strip.close')} className={`${HIT} text-body`}>×</button>
      <style>{`
        .vk-strip-run{animation:vk-strip linear infinite}
        @keyframes vk-strip{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.vk-strip-run{animation:none;transform:none;padding-left:1rem}.vk-strip-pause{display:none}}
      `}</style>
    </div>
  );
}

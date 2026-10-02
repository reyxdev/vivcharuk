import { contactLinks } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { BRAND } from './brandIcons';

// Viber, Telegram, WhatsApp on the messenger number (round 9 part 5 #18, #5), each with its logo
// beside the name (2026-10-02). Shown dashed and inert while the number is still a placeholder.
export function Messengers({ tone = 'page', compact = false }: { tone?: 'page' | 'inverted'; compact?: boolean }) {
  const biz = useBusiness();
  const l = contactLinks(biz.messengerPhone);
  const items = [['Viber', l?.viber], ['Telegram', l?.telegram], ['WhatsApp', l?.whatsapp]] as const;
  // Filled, raised, with hover and press states, so they read as buttons on the page and in the footer.
  const look = tone === 'inverted'
    ? 'border-transparent bg-[#FAF8F4] text-[#1F3A2E] shadow-md hover:bg-white hover:shadow-lg'
    : 'border-border-control bg-bg-surface text-text-primary shadow-sm hover:bg-bg-alt hover:shadow';
  const border = tone === 'inverted' ? 'border-text-on-inverted/40' : 'border-border-control';
  const size = compact ? 'gap-1.5 px-2.5 py-1 text-body-sm' : 'gap-2 px-4 py-2.5 text-body';
  const icon = compact ? 'size-4' : 'size-5';
  const mark = (label: keyof typeof BRAND) => (
    <svg viewBox="0 0 24 24" className={`${icon} shrink-0`} aria-hidden="true"><path d={BRAND[label].path} fill={BRAND[label].color} /></svg>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, href]) => href
        ? <a key={label} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noreferrer" className={`inline-flex cursor-pointer items-center rounded-lg border ${look} ${size} font-semibold transition active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2`}>{mark(label)}{label}</a>
        // Dashed and not bold marks "not set yet"; no opacity, so the text keeps AA contrast (axe, 2026-10-01).
        : <span key={label} className={`inline-flex items-center rounded-lg border border-dashed ${border} ${size}`} title="Номер ще не вказано">{mark(label)}{label}</span>)}
    </div>
  );
}

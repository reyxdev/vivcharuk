import { kyivDate, nearSpecialDay, type Locale } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { t } from '@/lib/i18n';

// 2026-10-03: a holiday or shorter hours from the panel's «Особливі дні», shown beside the hours on the
// day itself and the day before. The note («Різдво») is typed in Ukrainian, so English pages leave it out.
export function useSpecialDayText(locale: Locale) {
  const biz = useBusiness();
  const near = nearSpecialDay(biz.specialDays, kyivDate());
  if (!near) return null;
  const { day } = near;
  const date = new Date(`${day.date}T12:00:00Z`).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const when = t(locale, near.when === 'today' ? 'hours.today' : 'hours.tomorrow');
  const text = day.closed ? t(locale, 'hours.specialClosed', { when, date }) : t(locale, 'hours.specialOpen', { when, date, opens: day.opens ?? '', closes: day.closes ?? '' });
  return `${text}${locale === 'uk' && day.note ? ` (${day.note})` : ''}.`;
}

export function SpecialDayNote({ locale, className = '' }: { locale: Locale; className?: string }) {
  const text = useSpecialDayText(locale);
  return text ? <strong className={`font-semibold text-text-primary ${className}`}>{text}</strong> : null;
}

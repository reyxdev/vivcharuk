import { upcomingSpecialDays, type DayHours, type SpecialDay } from '@vivcharyk/schemas';

// Our week and special days in the shapes of the Business Information API v1 Location resource
// (developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations):
// regularHours = BusinessHours { periods: TimePeriod[] }, TimePeriod { openDay, openTime, closeDay,
// closeTime } with DayOfWeek MONDAY…SUNDAY and TimeOfDay { hours, minutes };
// specialHours = SpecialHours { specialHourPeriods: SpecialHourPeriod[] }, SpecialHourPeriod
// { startDate: Date, openTime, endDate, closeTime, closed } — with closed = true the times and endDate
// are ignored. Pure functions: tested without a network (tests/unit/googleBusiness.test.ts).

export const GOOGLE_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
type GoogleDay = (typeof GOOGLE_DAYS)[number];

export interface TimeOfDay { hours?: number; minutes?: number; seconds?: number; nanos?: number }
export interface GDate { year: number; month: number; day: number }
export interface TimePeriod { openDay: GoogleDay; openTime: TimeOfDay; closeDay: GoogleDay; closeTime: TimeOfDay }
export interface SpecialHourPeriod { startDate: GDate; openTime?: TimeOfDay; endDate?: GDate; closeTime?: TimeOfDay; closed?: boolean }
export interface HoursPayload { regularHours: { periods: TimePeriod[] }; specialHours?: { specialHourPeriods: SpecialHourPeriod[] } }

/** The fields one sync writes (locations.patch `updateMask`). */
export const UPDATE_MASK = 'regularHours,specialHours';

const tod = (hhmm: string): TimeOfDay => { const [h, m] = hhmm.split(':').map(Number); return { hours: h!, minutes: m! }; };
const gdate = (iso: string): GDate => { const [y, m, d] = iso.split('-').map(Number); return { year: y!, month: m!, day: d! }; };

/**
 * The body of locations.patch. One TimePeriod per open day (closed days are simply absent — Google reads
 * a day with no period as closed). Special days only from `today` on. With no special days the
 * `specialHours` field is left out while `updateMask` still names it, which clears Google's list
 * (FieldMask update semantics, AIP-134: a masked field absent from the body is reset).
 */
export function hoursPayload(c: { week: DayHours[]; specialDays?: SpecialDay[] }, today: string): HoursPayload {
  const periods = c.week.flatMap((d, i) => (d.open ? [{ openDay: GOOGLE_DAYS[i]!, openTime: tod(d.opens), closeDay: GOOGLE_DAYS[i]!, closeTime: tod(d.closes) }] : []));
  const special = upcomingSpecialDays(c.specialDays, today).map((s): SpecialHourPeriod => (s.closed
    ? { startDate: gdate(s.date), closed: true }
    : { startDate: gdate(s.date), openTime: tod(s.opens!), endDate: gdate(s.date), closeTime: tod(s.closes!) }));
  return { regularHours: { periods }, ...(special.length ? { specialHours: { specialHourPeriods: special } } : {}) };
}

// Comparison. Google's JSON leaves out zero fields (00:00 comes back as {}), so both sides are reduced
// to plain strings first.
const hm = (t: TimeOfDay | undefined) => `${String(t?.hours ?? 0).padStart(2, '0')}:${String(t?.minutes ?? 0).padStart(2, '0')}`;
const ymd = (d: Partial<GDate> | undefined) => `${d?.year ?? 0}-${String(d?.month ?? 0).padStart(2, '0')}-${String(d?.day ?? 0).padStart(2, '0')}`;

export function hoursFingerprint(h: { regularHours?: { periods?: TimePeriod[] }; specialHours?: { specialHourPeriods?: SpecialHourPeriod[] } }, today: string) {
  const regular = (h.regularHours?.periods ?? []).map((p) => `${p.openDay} ${hm(p.openTime)}-${p.closeDay} ${hm(p.closeTime)}`).sort();
  // Past special days stay in Google's profile; only today and later are compared.
  const special = (h.specialHours?.specialHourPeriods ?? []).filter((p) => ymd(p.startDate) >= today)
    .map((p) => (p.closed ? `${ymd(p.startDate)} closed` : `${ymd(p.startDate)} ${hm(p.openTime)}-${hm(p.closeTime)}`)).sort();
  return JSON.stringify({ regular, special });
}

/** Does Google's location show the same hours as ours (from today on)? */
export const sameHours = (ours: HoursPayload, google: Parameters<typeof hoursFingerprint>[0], today: string) => hoursFingerprint(ours, today) === hoursFingerprint(google, today);

/** A PostalAddress as one line for the panel. */
export function addressLine(a: { addressLines?: string[]; locality?: string; administrativeArea?: string; postalCode?: string } | undefined) {
  return [...(a?.addressLines ?? []), a?.locality, a?.administrativeArea, a?.postalCode].filter(Boolean).join(', ');
}

export type GoogleFailure = { kind: 'awaiting_api_access' | 'transient' | 'fatal' | 'reauth'; code: string; message: string };

/**
 * What a failed call means. Error bodies follow AIP-193 ({ error: { code, message, status, details[] } }).
 * - 429 RESOURCE_EXHAUSTED: Google's limits page says a project whose quota is 0 has not been granted
 *   access yet; the 429 for it carries an ErrorInfo with metadata.quota_limit_value = "0".
 *   TODO(developers.google.com/my-business/content/limits): Google does not document the ErrorInfo keys
 *   for this API; `quota_limit_value` is the key Google Cloud quota errors carry. Any other 429 is the
 *   per-minute limit and is retried.
 * - 5xx: retried. 401: the access token is refreshed on the retry.
 * - 400/403/404 and the rest: stored with Google's own message, not retried.
 */
export function classifyFailure(httpStatus: number, body: unknown): GoogleFailure {
  const e = (body as { error?: { status?: string; message?: string; details?: Array<{ '@type'?: string; reason?: string; metadata?: Record<string, string> }> } } | null)?.error;
  const status = e?.status ?? `HTTP_${httpStatus}`;
  const message = (e?.message ?? '').slice(0, 300);
  if (httpStatus === 429) {
    const zero = (e?.details ?? []).some((d) => d.metadata?.quota_limit_value === '0');
    return zero ? { kind: 'awaiting_api_access', code: 'API_ACCESS_NOT_APPROVED', message } : { kind: 'transient', code: 'RATE_LIMITED', message };
  }
  if (httpStatus >= 500) return { kind: 'transient', code: status, message };
  if (httpStatus === 401) return { kind: 'transient', code: 'UNAUTHENTICATED', message };
  return { kind: 'fatal', code: status, message };
}

import { describe, expect, it } from 'vitest';
import { addDays, DEFAULT_SITE_CONTACT, kyivDate, nearSpecialDay, siteContactSchema, specialOpeningHoursSpecification, type DayHours } from '@vivcharyk/schemas';
import { classifyFailure, hoursPayload, sameHours } from '../../src/modules/google-business/payload';

// 2026-10-03, hours sync with Google: the special-days schema, the Business Profile payload and error
// classification. No network, no database (the OAuth state is tested in integration/googleBusiness.test.ts).

const today = kyivDate();
const base = { ...DEFAULT_SITE_CONTACT };

describe('specialDays in site.contact', () => {
  it('defaults to an empty list (older stored values)', () => {
    const { specialDays: _s, ...old } = base;
    expect(siteContactSchema.parse(old).specialDays).toEqual([]);
  });

  it('drops the times of a closed day and an empty note', () => {
    const r = siteContactSchema.parse({ ...base, specialDays: [{ date: addDays(today, 3), closed: true, opens: '10:00', closes: '12:00', note: ' ' }] });
    expect(r.specialDays).toEqual([{ date: addDays(today, 3), closed: true }]);
  });

  it('needs hours on an open day, the end after the start', () => {
    expect(siteContactSchema.safeParse({ ...base, specialDays: [{ date: addDays(today, 1), closed: false }] }).success).toBe(false);
    expect(siteContactSchema.safeParse({ ...base, specialDays: [{ date: addDays(today, 1), closed: false, opens: '15:00', closes: '11:00' }] }).success).toBe(false);
    expect(siteContactSchema.parse({ ...base, specialDays: [{ date: addDays(today, 1), closed: false, opens: '11:00', closes: '15:00', note: 'Святвечір' }] }).specialDays)
      .toEqual([{ date: addDays(today, 1), closed: false, opens: '11:00', closes: '15:00', note: 'Святвечір' }]);
  });

  it('rejects impossible dates and duplicates', () => {
    expect(siteContactSchema.safeParse({ ...base, specialDays: [{ date: '2027-02-30', closed: true }] }).success).toBe(false);
    expect(siteContactSchema.safeParse({ ...base, specialDays: [{ date: addDays(today, 2), closed: true }, { date: addDays(today, 2), closed: true }] }).success).toBe(false);
  });

  it('prunes days more than 30 days past and sorts by date', () => {
    const r = siteContactSchema.parse({ ...base, specialDays: [
      { date: addDays(today, 5), closed: true }, { date: addDays(today, -31), closed: true }, { date: addDays(today, -30), closed: true },
    ] });
    expect(r.specialDays.map((d) => d.date)).toEqual([addDays(today, -30), addDays(today, 5)]);
  });

  it('keeps at most 60', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => ({ date: addDays(today, i + 1), closed: true }));
    expect(siteContactSchema.safeParse({ ...base, specialDays: many(60) }).success).toBe(true);
    expect(siteContactSchema.safeParse({ ...base, specialDays: many(61) }).success).toBe(false);
  });

  it('finds today or tomorrow for the site line, and only upcoming days for JSON-LD', () => {
    const days = [{ date: addDays(today, -1), closed: true }, { date: addDays(today, 1), closed: false, opens: '11:00', closes: '15:00' }];
    expect(nearSpecialDay(days, today)).toEqual({ when: 'tomorrow', day: days[1] });
    expect(nearSpecialDay([{ date: today, closed: true }], today)?.when).toBe('today');
    expect(nearSpecialDay([{ date: addDays(today, 2), closed: true }], today)).toBeNull();
    expect(specialOpeningHoursSpecification([...days, { date: addDays(today, 3), closed: true }], today)).toEqual([
      { '@type': 'OpeningHoursSpecification', validFrom: addDays(today, 1), validThrough: addDays(today, 1), opens: '11:00', closes: '15:00' },
      { '@type': 'OpeningHoursSpecification', validFrom: addDays(today, 3), validThrough: addDays(today, 3), opens: '00:00', closes: '00:00' },
    ]);
  });
});

describe('Business Profile payload', () => {
  const open = (opens: string, closes: string): DayHours => ({ open: true, opens, closes });
  const off: DayHours = { open: false, opens: '11:00', closes: '19:00' };
  const week = [open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('09:30', '17:45'), open('10:00', '14:00'), off];

  it('one TimePeriod per open day; closed days are absent', () => {
    const p = hoursPayload({ week }, '2026-12-20');
    expect(p.regularHours.periods).toHaveLength(6);
    expect(p.regularHours.periods.map((x) => x.openDay)).toEqual(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);
    expect(p.regularHours.periods[4]).toEqual({ openDay: 'FRIDAY', openTime: { hours: 9, minutes: 30 }, closeDay: 'FRIDAY', closeTime: { hours: 17, minutes: 45 } });
    expect(p.specialHours).toBeUndefined();
  });

  it('special days: closed, or open with times; past days left out', () => {
    const p = hoursPayload({ week, specialDays: [
      { date: '2026-12-19', closed: true },
      { date: '2026-12-24', closed: false, opens: '11:00', closes: '15:00', note: 'Святвечір' },
      { date: '2026-12-25', closed: true, note: 'Різдво' },
    ] }, '2026-12-20');
    expect(p.specialHours).toEqual({ specialHourPeriods: [
      { startDate: { year: 2026, month: 12, day: 24 }, openTime: { hours: 11, minutes: 0 }, endDate: { year: 2026, month: 12, day: 24 }, closeTime: { hours: 15, minutes: 0 } },
      { startDate: { year: 2026, month: 12, day: 25 }, closed: true },
    ] });
  });

  it('compares with Google ignoring omitted zero fields, order and past special days', () => {
    const ours = hoursPayload({ week, specialDays: [{ date: '2026-12-25', closed: true }] }, '2026-12-20');
    const google = {
      regularHours: { periods: [...ours.regularHours.periods].reverse().map((p) => ({ ...p, openTime: p.openTime.minutes ? p.openTime : { hours: p.openTime.hours } })) },
      specialHours: { specialHourPeriods: [{ startDate: { year: 2026, month: 1, day: 7 }, closed: true }, { startDate: { year: 2026, month: 12, day: 25 }, closed: true }] },
    };
    expect(sameHours(ours, google, '2026-12-20')).toBe(true);
    expect(sameHours(ours, { ...google, specialHours: undefined }, '2026-12-20')).toBe(false);
    expect(sameHours(ours, { ...google, regularHours: { periods: google.regularHours.periods.slice(1) } }, '2026-12-20')).toBe(false);
  });
});

describe('Google error classification', () => {
  const err = (code: number, status: string, details: unknown[] = []) => ({ error: { code, status, message: 'm', details } });

  it('429 with a zero quota means API access is not approved yet', () => {
    const body = err(429, 'RESOURCE_EXHAUSTED', [{ '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason: 'RATE_LIMIT_EXCEEDED', metadata: { quota_limit_value: '0' } }]);
    expect(classifyFailure(429, body).kind).toBe('awaiting_api_access');
  });
  it('any other 429 and 5xx are retried', () => {
    expect(classifyFailure(429, err(429, 'RESOURCE_EXHAUSTED', [{ metadata: { quota_limit_value: '300' } }]))).toMatchObject({ kind: 'transient', code: 'RATE_LIMITED' });
    expect(classifyFailure(503, null).kind).toBe('transient');
  });
  it('PERMISSION_DENIED and NOT_FOUND are stored, not retried', () => {
    expect(classifyFailure(403, err(403, 'PERMISSION_DENIED'))).toMatchObject({ kind: 'fatal', code: 'PERMISSION_DENIED' });
    expect(classifyFailure(404, err(404, 'NOT_FOUND'))).toMatchObject({ kind: 'fatal', code: 'NOT_FOUND' });
  });
});

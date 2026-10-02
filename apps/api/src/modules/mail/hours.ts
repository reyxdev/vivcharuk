// Working hours (round 18 C2): Monday–Friday 11:00–19:00, Kyiv time. Used for the out-of-hours
// auto-reply and the «no reply for 24 working hours» highlight (round 19 D1 #38–39).
const OPEN_H = 11;
const CLOSE_H = 19;

function kyivParts(d: Date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return { weekday: get('weekday'), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const isWorkday = (weekday: string) => weekday !== 'Sat' && weekday !== 'Sun';

export function isWorkingTime(d = new Date()) {
  const { weekday, minutes } = kyivParts(d);
  return isWorkday(weekday) && minutes >= OPEN_H * 60 && minutes < CLOSE_H * 60;
}

/** Working minutes between two instants, counted in 15-minute steps (precise enough for a highlight). */
export function workingMinutesBetween(from: Date, to: Date) {
  const STEP = 15 * 60_000;
  let n = 0;
  for (let t = from.getTime(); t < to.getTime(); t += STEP) if (isWorkingTime(new Date(t))) n += 15;
  return n;
}

export const OVERDUE_WORKING_MINUTES = 24 * 60;

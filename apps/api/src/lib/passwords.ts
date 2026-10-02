import { createHash } from 'node:crypto';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as common from '@zxcvbn-ts/language-common';
import { BUSINESS } from '@vivcharyk/schemas';
import { AppError } from './errors';

/**
 * Staff password policy (24 §24.10, 32 §32.6): 12–128 characters, no composition rules, zxcvbn
 * score ≥ 3 with the brand, the place, the person and Ukrainian keyboard runs in the dictionary,
 * and the Have I Been Pwned range check (k-anonymity: only the first five characters of the SHA-1
 * leave the server). The breach check fails open — a third party being down must not lock staff out.
 */

// Ukrainian words and keyboard runs people reach for, and the same words typed on a Latin layout.
const UK_COMMON = [
  'пароль', 'парольчик', 'йцукен', 'йцукенг', 'йцукенгшщзхї', 'фівапролджє', 'ячсмитьбю', 'привіт', 'кохання', 'україна',
  'славаукраїні', 'сонечко', 'котик', 'зайчик', 'кицюня', 'любов', 'мама', 'тато', 'карпати', 'гуцул', 'гуцулка', 'вовна',
  'ліжник', 'овчина', 'вівця', 'вівчар', 'пастух', 'полонина', 'говерла', 'черемош', 'верховина',
  'gfhjkm', 'qwerty', 'ukraine', 'slavaukraini', 'karpaty', 'hutsul',
];
const PLACE = ['vivcharyk', 'vivcharik', 'vivchar', 'яворів', 'yavoriv', 'javoriv', 'косів', 'kosiv', 'botey', 'shkury', BUSINESS.domain];

const zxcvbn = new ZxcvbnFactory({
  dictionary: { ...common.dictionary, ukCommon: UK_COMMON },
  graphs: common.adjacencyGraphs,
});

const weak = (code: 'PASSWORD_WEAK' | 'PASSWORD_BREACHED') => new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'password', code }]);

// The person's name typed in Latin letters too: «Оксана» is guessed as «oksana» (KMU 2010, simplified).
const LAT: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', "'": '', '’': '' };
const latin = (s: string) => [...s.toLowerCase()].map((c) => LAT[c] ?? c).join('');

export function strength(password: string, user: { email: string; firstName: string; lastName: string }) {
  const names = [user.firstName, user.lastName].flatMap((n) => [n, latin(n), latin(n).replace(/kh/g, 'h').replace(/h/g, 'g')]);
  const inputs = [BUSINESS.brand, ...PLACE, user.email, user.email.split('@')[0]!, ...names].filter((x) => x.length >= 3).map((x) => x.toLowerCase());
  const r = zxcvbn.check(password, inputs);
  // A password built on the person's name, the brand or the village needs the top score: an attacker
  // who targets this shop starts exactly there («Oksana2026!!» scores 3 on its own).
  const personal = r.sequence.some((m) => 'dictionaryName' in m && m.dictionaryName === 'userInputs');
  return personal ? Math.max(0, r.score - 1) : r.score;
}

/** Times the password appears in known breaches; null when the service could not be reached. */
export async function breachCount(password: string): Promise<number | null> {
  const sha = createHash('sha1').update(password).digest('hex').toUpperCase();
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${sha.slice(0, 5)}`, { headers: { 'Add-Padding': 'true', 'user-agent': 'vivcharyk-admin' }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const line = (await res.text()).split('\n').find((l) => l.startsWith(sha.slice(5)));
    return line ? Number(line.split(':')[1]) || 0 : 0;
  } catch {
    return null;
  }
}

export async function assertPassword(password: string, user: { email: string; firstName: string; lastName: string }) {
  if (password.length < 12 || password.length > 128 || strength(password, user) < 3) throw weak('PASSWORD_WEAK');
  if (process.env.HIBP_ENABLED !== 'false' && (await breachCount(password))) throw weak('PASSWORD_BREACHED');
}

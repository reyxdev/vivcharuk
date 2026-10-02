import { describe, expect, it } from 'vitest';
import { strength } from '../../src/lib/passwords';

// 24 §24.10: zxcvbn ≥ 3 with the brand, place, person and Ukrainian keyboard runs in the dictionary.
const ivan = { email: 'gif19601@gmail.com', firstName: 'Іван', lastName: 'Гондурак' };

describe('staff password strength', () => {
  it('rejects the guessable ones', () => {
    for (const p of ['Vivcharyk2026!', 'пароль123456', 'йцукенгшщзхї1', 'qwertyuiop12', 'Гондурак1960!', 'gif19601gmail', 'Ivan2026!!!!', 'Hondurak2026!']) expect(strength(p, ivan), p).toBeLessThan(3);
  });
  it('accepts passphrases', () => {
    for (const p of ['Кочерга вовна ліжник гора', 'correct horse battery staple', 'бабця пряде синю нитку ввечері']) expect(strength(p, ivan), p).toBeGreaterThanOrEqual(3);
  });
});

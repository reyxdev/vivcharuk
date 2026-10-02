import { describe, expect, it } from 'vitest';
import { parseInt0, parseMoney } from '../../src/modules/products/excel';

// 23 §23.6.9: money is parsed strictly; a mis-parsed price is worse than a failed import.
describe('Excel import parsing', () => {
  it('accepts the four spellings of a price', () => {
    for (const s of ['5 300', '5300', '5300.00', '5300,00', '5 300,5']) expect(parseMoney(s)).toBe(s.includes(',5') ? 530050 : 530000);
    expect(parseMoney(960)).toBe(96000);
    expect(parseMoney(12.5)).toBe(1250);
  });
  it('rejects anything else', () => {
    for (const s of ['5.300,00', '5,300.00', '53 00', '1e3', '-5', '5300.001', 'п’ять']) expect(parseMoney(s)).toBeNull();
    expect(parseMoney(-1)).toBeNull();
    expect(parseMoney(1.234)).toBeNull();
  });
  it('reads whole numbers only for stock and sizes', () => {
    expect(parseInt0('7')).toBe(7);
    expect(parseInt0(12)).toBe(12);
    expect(parseInt0('1,5')).toBeNull();
    expect(parseInt0('-2')).toBeNull();
  });
});

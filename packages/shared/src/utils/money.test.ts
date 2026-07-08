import { describe, expect, it } from 'vitest';
import { formatPaise } from './money';

describe('formatPaise', () => {
  it('formats whole rupees without decimals', () => {
    expect(formatPaise(118000)).toBe('₹1,180');
  });

  it('uses Indian digit grouping (2,2,...,3)', () => {
    expect(formatPaise(12345600)).toBe('₹1,23,456');
    expect(formatPaise(123456789 * 100)).toBe('₹12,34,56,789');
  });

  it('keeps paise when non-zero, zero-padded', () => {
    expect(formatPaise(118050)).toBe('₹1,180.50');
    expect(formatPaise(105)).toBe('₹1.05');
  });

  it('handles small and zero amounts', () => {
    expect(formatPaise(0)).toBe('₹0');
    expect(formatPaise(99)).toBe('₹0.99');
    expect(formatPaise(52200)).toBe('₹522');
  });

  it('handles negatives (refunds)', () => {
    expect(formatPaise(-118000)).toBe('-₹1,180');
  });

  it('is defensive about bad input', () => {
    expect(formatPaise(NaN)).toBe('₹—');
  });
});

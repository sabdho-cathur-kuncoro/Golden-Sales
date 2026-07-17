import { currencyFormat } from './currencyFormat';

// ICU builds differ on the space (regular vs non-breaking) after "Rp", so
// assert on the whitespace-stripped output.
const strip = (s: string) => s.replace(/\s/g, '');

describe('currencyFormat', () => {
  it('formats IDR with dot grouping and no fraction digits', () => {
    expect(strip(currencyFormat(10000))).toBe('Rp10.000');
    expect(strip(currencyFormat(1500000))).toBe('Rp1.500.000');
  });
  it('defaults to 0', () => {
    expect(strip(currencyFormat())).toBe('Rp0');
    expect(strip(currencyFormat(0))).toBe('Rp0');
  });
  it('handles negatives', () => {
    expect(strip(currencyFormat(-2500))).toBe('-Rp2.500');
  });
  it('rounds fractions away (IDR has 0 minor units, so maxFractionDigits defaults to 0)', () => {
    // currency style forces maximumFractionDigits to IDR's 0 units, so
    // fractional input is rounded to whole rupiah.
    expect(strip(currencyFormat(1000.6))).toBe('Rp1.001');
    expect(strip(currencyFormat(1000.4))).toBe('Rp1.000');
  });
});

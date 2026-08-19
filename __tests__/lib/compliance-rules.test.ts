import { describe, it, expect } from 'vitest';
import { checkLayoffCompliance } from '@/lib/compliance-rules';

describe('checkLayoffCompliance', () => {
  it('returns no warnings when headcount is unchanged or increasing', () => {
    expect(checkLayoffCompliance(20, 20)).toEqual([]);
    expect(checkLayoffCompliance(20, 25)).toEqual([]);
  });

  it('returns no warnings for a small reduction well below any threshold', () => {
    expect(checkLayoffCompliance(20, 18)).toEqual([]);
  });

  it('flags the WARN Act for a 100+ employer cutting 50+ staff', () => {
    const warnings = checkLayoffCompliance(150, 90); // cuts 60
    expect(warnings).toHaveLength(1);
    expect(warnings[0].law).toBe('WARN Act (federal)');
    expect(warnings[0].severity).toBe('warning');
  });

  it('flags the WARN Act via the 33% ratio threshold even when the absolute cut is under 50', () => {
    // 120 -> 75 cuts 45 people (under the 50-person absolute threshold) but
    // that's 37.5% of a 120-person workforce, over the 33% ratio threshold.
    const warnings = checkLayoffCompliance(120, 75);
    expect(warnings.some((w) => w.law === 'WARN Act (federal)')).toBe(true);
  });

  it('does not flag WARN Act for a sub-100 employer below the 33% ratio, even with a large-looking cut', () => {
    // 60 employees, cut to 45 = 15 people = 25% — below the 33% ratio threshold and below the 50-person absolute threshold.
    const warnings = checkLayoffCompliance(60, 45);
    expect(warnings.some((w) => w.law === 'WARN Act (federal)')).toBe(false);
  });

  it('gives a softer general-guidance note for a meaningful but sub-WARN reduction', () => {
    const warnings = checkLayoffCompliance(80, 68); // cuts 12, under 100-employee/50-person/33% thresholds
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('every warning message says this is guidance, not legal advice, or tells the reader to check further', () => {
    const warnings = checkLayoffCompliance(150, 90);
    expect(warnings[0].message).toMatch(/not legal advice|consult|check/i);
  });
});

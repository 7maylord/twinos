import { describe, it, expect } from 'vitest';
import { diffScenarioInputs } from '@/lib/scenario-diff';

const BASE = {
  priceIncrease: 10,
  employeeCount: 12,
  marketingBudget: 20000,
  supplierDelay: 'none',
  priceElasticityOverride: null,
  marketingElasticityOverride: null,
};

describe('diffScenarioInputs', () => {
  it('marks identical fields as unchanged', () => {
    const rows = diffScenarioInputs(BASE, { ...BASE });
    expect(rows.every((r) => !r.changed)).toBe(true);
  });

  it('flags a changed price increase', () => {
    const rows = diffScenarioInputs(BASE, { ...BASE, priceIncrease: 15 });
    const row = rows.find((r) => r.label === 'Price Increase');
    expect(row?.changed).toBe(true);
    expect(row?.valueA).toBe('10%');
    expect(row?.valueB).toBe('15%');
  });

  it('flags a changed elasticity override and shows "Industry default" for null', () => {
    const rows = diffScenarioInputs(BASE, { ...BASE, priceElasticityOverride: 0.6 });
    const row = rows.find((r) => r.label === 'Price Elasticity Override');
    expect(row?.changed).toBe(true);
    expect(row?.valueA).toBe('Industry default');
    expect(row?.valueB).toBe('0.60');
  });

  it('does not flag a change when both sides are null (no override on either)', () => {
    const rows = diffScenarioInputs(BASE, { ...BASE, priceElasticityOverride: undefined });
    const row = rows.find((r) => r.label === 'Price Elasticity Override');
    expect(row?.changed).toBe(false);
  });
});

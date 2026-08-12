import { describe, it, expect } from 'vitest';
import { getScenarioTemplates, applyScenarioTemplate, DEFAULT_TEMPLATES } from '@/lib/scenario-templates';

describe('getScenarioTemplates', () => {
  it('returns industry-specific templates for a known industry', () => {
    const templates = getScenarioTemplates('Restaurant');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some((t) => t.name === 'Menu Price Adjustment')).toBe(true);
  });

  it('falls back to defaults for an unrecognized industry', () => {
    expect(getScenarioTemplates('Nonexistent Sector')).toEqual(DEFAULT_TEMPLATES);
  });

  it('falls back to defaults when industry is null or missing', () => {
    expect(getScenarioTemplates(null)).toEqual(DEFAULT_TEMPLATES);
    expect(getScenarioTemplates(undefined)).toEqual(DEFAULT_TEMPLATES);
  });
});

describe('applyScenarioTemplate', () => {
  it('resolves relative levers into absolute values scaled to the business baseline', () => {
    const template = { name: 'Growth Push', description: '', priceIncrease: 10, headcountDelta: 3, marketingBudgetMultiplier: 1.5, supplierDelay: 'none' as const };

    const result = applyScenarioTemplate(template, { currentHeadcount: 10, baselineMarketing: 20000 });

    expect(result).toEqual({
      priceIncrease: 10,
      employeeCount: 13,
      marketingBudget: 30000,
      supplierDelay: 'none',
    });
  });

  it('clamps employee count to the 5-50 range enforced by the manual sliders', () => {
    const bigCut = { name: 'Cut', description: '', priceIncrease: 0, headcountDelta: -20, marketingBudgetMultiplier: 1, supplierDelay: 'none' as const };
    expect(applyScenarioTemplate(bigCut, { currentHeadcount: 10, baselineMarketing: 10000 }).employeeCount).toBe(5);

    const bigHire = { name: 'Hire', description: '', priceIncrease: 0, headcountDelta: 60, marketingBudgetMultiplier: 1, supplierDelay: 'none' as const };
    expect(applyScenarioTemplate(bigHire, { currentHeadcount: 10, baselineMarketing: 10000 }).employeeCount).toBe(50);
  });

  it('clamps marketing budget to the $0-100K range enforced by the manual slider', () => {
    const bigSpend = { name: 'Spend', description: '', priceIncrease: 0, headcountDelta: 0, marketingBudgetMultiplier: 10, supplierDelay: 'none' as const };
    expect(applyScenarioTemplate(bigSpend, { currentHeadcount: 10, baselineMarketing: 20000 }).marketingBudget).toBe(100000);
  });

  it('clamps price increase to the 0-50 range enforced by the manual slider', () => {
    const overshoot = { name: 'Overshoot', description: '', priceIncrease: 75, headcountDelta: 0, marketingBudgetMultiplier: 1, supplierDelay: 'none' as const };
    expect(applyScenarioTemplate(overshoot, { currentHeadcount: 10, baselineMarketing: 10000 }).priceIncrease).toBe(50);
  });
});

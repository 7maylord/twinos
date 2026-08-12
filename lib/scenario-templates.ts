// Vertical-specific starter scenarios (keyed by the same industry strings as
// the onboarding form's dropdown and lib/industry-profiles.ts). Levers are
// expressed relative to the business's own baseline — a headcount delta and a
// marketing budget multiplier — rather than absolute numbers, since a
// hardcoded "15 employees" makes no sense across wildly different business
// sizes. "Other"/unrecognized industries fall back to DEFAULT_TEMPLATES.
export interface ScenarioTemplate {
  name: string;
  description: string;
  priceIncrease: number; // absolute percent, matches the scenario builder's 0-50 slider
  headcountDelta: number; // employees to add(+)/remove(-) from the business's current headcount
  marketingBudgetMultiplier: number; // applied to the business's current baseline marketing budget
  supplierDelay: 'none' | 'minor' | 'moderate' | 'severe';
}

export const DEFAULT_TEMPLATES: ScenarioTemplate[] = [
  { name: 'Price Increase', description: 'Raise prices across the board', priceIncrease: 10, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
  { name: 'Growth Push', description: 'Hire and spend more on marketing', priceIncrease: 0, headcountDelta: 2, marketingBudgetMultiplier: 1.5, supplierDelay: 'none' },
];

export const SCENARIO_TEMPLATES: Record<string, ScenarioTemplate[]> = {
  'Software / SaaS': [
    { name: 'Annual Price Increase', description: 'Typical yearly subscription price bump', priceIncrease: 8, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Growth Sprint', description: 'Add engineers, ramp acquisition spend', priceIncrease: 0, headcountDelta: 3, marketingBudgetMultiplier: 1.5, supplierDelay: 'none' },
  ],
  'Restaurant': [
    { name: 'Menu Price Adjustment', description: 'Reprice the menu for rising input costs', priceIncrease: 10, headcountDelta: 0, marketingBudgetMultiplier: 1.2, supplierDelay: 'none' },
    { name: 'Weekend Rush Staffing', description: 'Add staff to handle peak demand', priceIncrease: 0, headcountDelta: 4, marketingBudgetMultiplier: 1.3, supplierDelay: 'none' },
  ],
  'E-commerce': [
    { name: 'Holiday Marketing Push', description: 'Ramp ad spend for the seasonal peak', priceIncrease: 0, headcountDelta: 2, marketingBudgetMultiplier: 2.0, supplierDelay: 'minor' },
    { name: 'Margin Recovery', description: 'Raise prices and trim ad spend', priceIncrease: 12, headcountDelta: 0, marketingBudgetMultiplier: 0.8, supplierDelay: 'none' },
  ],
  'Logistics': [
    { name: 'Fuel Surcharge Pass-Through', description: 'Pass rising fuel costs on to customers', priceIncrease: 8, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'moderate' },
    { name: 'Fleet Expansion', description: 'Add drivers to grow capacity', priceIncrease: 0, headcountDelta: 5, marketingBudgetMultiplier: 1.1, supplierDelay: 'none' },
  ],
  'Professional Services': [
    { name: 'Rate Card Increase', description: 'Raise billing rates', priceIncrease: 10, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Add Senior Hire', description: 'Bring on a senior consultant', priceIncrease: 0, headcountDelta: 1, marketingBudgetMultiplier: 1.1, supplierDelay: 'none' },
  ],
  'Manufacturing': [
    { name: 'Input Cost Pass-Through', description: 'Reprice products for rising material costs', priceIncrease: 9, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'moderate' },
    { name: 'Production Line Expansion', description: 'Add production staff', priceIncrease: 0, headcountDelta: 6, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
  ],
  'Healthcare': [
    { name: 'Service Fee Adjustment', description: 'Modest fee increase', priceIncrease: 5, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Add Clinical Staff', description: 'Expand appointment capacity', priceIncrease: 0, headcountDelta: 2, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
  ],
  'Real Estate': [
    { name: 'Commission Rate Increase', description: 'Raise commission rates', priceIncrease: 7, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Listing Marketing Push', description: 'Spend more to generate leads', priceIncrease: 0, headcountDelta: 1, marketingBudgetMultiplier: 1.6, supplierDelay: 'none' },
  ],
  'Education': [
    { name: 'Tuition Adjustment', description: 'Raise tuition/course fees', priceIncrease: 6, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Enrollment Campaign', description: 'Spend to grow enrollment', priceIncrease: 0, headcountDelta: 1, marketingBudgetMultiplier: 1.4, supplierDelay: 'none' },
  ],
  'Financial Services': [
    { name: 'Fee Schedule Increase', description: 'Raise fees/rates', priceIncrease: 5, headcountDelta: 0, marketingBudgetMultiplier: 1.0, supplierDelay: 'none' },
    { name: 'Advisor Team Growth', description: 'Hire additional advisors', priceIncrease: 0, headcountDelta: 2, marketingBudgetMultiplier: 1.2, supplierDelay: 'none' },
  ],
};

export function getScenarioTemplates(industry: string | null | undefined): ScenarioTemplate[] {
  if (!industry) return DEFAULT_TEMPLATES;
  return SCENARIO_TEMPLATES[industry] || DEFAULT_TEMPLATES;
}

export interface AppliedScenarioValues {
  priceIncrease: number;
  employeeCount: number;
  marketingBudget: number;
  supplierDelay: 'none' | 'minor' | 'moderate' | 'severe';
}

// Resolves a template's relative levers into absolute scenario-builder values
// for a specific business, clamped to the same bounds the manual sliders
// enforce (0-50% price, 5-50 staff, $0-100K marketing).
export function applyScenarioTemplate(
  template: ScenarioTemplate,
  business: { currentHeadcount: number; baselineMarketing: number }
): AppliedScenarioValues {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  return {
    priceIncrease: clamp(template.priceIncrease, 0, 50),
    employeeCount: clamp(business.currentHeadcount + template.headcountDelta, 5, 50),
    marketingBudget: clamp(Math.round(business.baselineMarketing * template.marketingBudgetMultiplier), 0, 100000),
    supplierDelay: template.supplierDelay,
  };
}

// Directional elasticity starting points per industry sector (values from the
// onboarding form's "Industry Sector" dropdown). Grounded in general demand
// intuition — comparison-shopped/commoditized goods are price-elastic;
// relationship- or contract-driven B2B and essential/insurance-mediated
// services are inelastic — not fitted from real data. Replace with
// per-business calibration from synced transaction history when that lands
// (roadmap Phase 4a). "Other" and any unrecognized/missing industry keep the
// original universal constants so existing behavior is unaffected.
export interface IndustryProfile {
  priceElasticityCoefficient: number;
  marketingElasticityCoefficient: number;
}

export const DEFAULT_INDUSTRY_PROFILE: IndustryProfile = {
  priceElasticityCoefficient: 0.45,
  marketingElasticityCoefficient: 0.1,
};

export const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  'Software / SaaS': { priceElasticityCoefficient: 0.2, marketingElasticityCoefficient: 0.08 },
  'Restaurant': { priceElasticityCoefficient: 0.6, marketingElasticityCoefficient: 0.12 },
  'E-commerce': { priceElasticityCoefficient: 0.65, marketingElasticityCoefficient: 0.15 },
  'Logistics': { priceElasticityCoefficient: 0.25, marketingElasticityCoefficient: 0.06 },
  'Professional Services': { priceElasticityCoefficient: 0.3, marketingElasticityCoefficient: 0.08 },
  'Manufacturing': { priceElasticityCoefficient: 0.35, marketingElasticityCoefficient: 0.07 },
  'Healthcare': { priceElasticityCoefficient: 0.15, marketingElasticityCoefficient: 0.06 },
  'Real Estate': { priceElasticityCoefficient: 0.35, marketingElasticityCoefficient: 0.1 },
  'Education': { priceElasticityCoefficient: 0.25, marketingElasticityCoefficient: 0.09 },
  'Financial Services': { priceElasticityCoefficient: 0.2, marketingElasticityCoefficient: 0.07 },
};

export function getIndustryProfile(industry: string | null | undefined): IndustryProfile {
  if (!industry) return DEFAULT_INDUSTRY_PROFILE;
  return INDUSTRY_PROFILES[industry] || DEFAULT_INDUSTRY_PROFILE;
}

export interface ScenarioInputs {
  priceIncrease: number;
  employeeCount: number;
  marketingBudget: number;
  supplierDelay: string;
  priceElasticityOverride?: number | null;
  marketingElasticityOverride?: number | null;
}

export interface ScenarioDiffRow {
  label: string;
  valueA: string;
  valueB: string;
  changed: boolean;
}

function formatElasticity(value: number | null | undefined): string {
  return value != null ? value.toFixed(2) : 'Industry default';
}

// Row-by-row diff of two scenarios' input levers, for the compare page's
// "What Changed" panel — the counterpart to the existing output comparison,
// which shows resulting revenue/profit but never what actually differs
// between the two configurations that produced them.
export function diffScenarioInputs(a: ScenarioInputs, b: ScenarioInputs): ScenarioDiffRow[] {
  return [
    {
      label: 'Price Increase',
      valueA: `${a.priceIncrease}%`,
      valueB: `${b.priceIncrease}%`,
      changed: a.priceIncrease !== b.priceIncrease,
    },
    {
      label: 'Simulated Headcount',
      valueA: `${a.employeeCount}`,
      valueB: `${b.employeeCount}`,
      changed: a.employeeCount !== b.employeeCount,
    },
    {
      label: 'Marketing Budget',
      valueA: `$${a.marketingBudget.toLocaleString()}`,
      valueB: `$${b.marketingBudget.toLocaleString()}`,
      changed: a.marketingBudget !== b.marketingBudget,
    },
    {
      label: 'Supplier Delay',
      valueA: a.supplierDelay,
      valueB: b.supplierDelay,
      changed: a.supplierDelay !== b.supplierDelay,
    },
    {
      label: 'Price Elasticity Override',
      valueA: formatElasticity(a.priceElasticityOverride),
      valueB: formatElasticity(b.priceElasticityOverride),
      changed: (a.priceElasticityOverride ?? null) !== (b.priceElasticityOverride ?? null),
    },
    {
      label: 'Marketing Elasticity Override',
      valueA: formatElasticity(a.marketingElasticityOverride),
      valueB: formatElasticity(b.marketingElasticityOverride),
      changed: (a.marketingElasticityOverride ?? null) !== (b.marketingElasticityOverride ?? null),
    },
  ];
}

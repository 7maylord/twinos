// General guidance, not legal advice. This checks headcount reductions
// against the headline thresholds of one well-documented, stable U.S.
// federal statute (WARN Act, 1988) — not a general "labor law compliance"
// engine. Deliberately does NOT attempt industry-specific minimum-staffing
// rules (healthcare ratios, etc.): those vary by state/locality in ways that
// can't be responsibly reduced to a static table without real legal research,
// and getting them wrong would be worse than not offering them. Always
// surface these as "check with counsel," never as a compliance guarantee.
export interface ComplianceWarning {
  law: string;
  severity: 'info' | 'warning';
  message: string;
}

// WARN Act: employers with 100+ full-time employees must give 60 days'
// advance notice before a "mass layoff" — a reduction of 50+ employees at a
// single site within a 30-day period, or 33%+ of the workforce when the site
// has 50-499 employees. Many states have their own stricter "mini-WARN" laws
// (California, New York, New Jersey, and others) with lower thresholds.
export function checkLayoffCompliance(currentHeadcount: number, targetHeadcount: number): ComplianceWarning[] {
  const warnings: ComplianceWarning[] = [];
  const reduction = currentHeadcount - targetHeadcount;
  if (reduction <= 0) return warnings;

  const reductionRatio = reduction / currentHeadcount;
  const meetsEmployerSizeThreshold = currentHeadcount >= 100;
  const meetsMassLayoffThreshold =
    reduction >= 50 || (currentHeadcount >= 50 && currentHeadcount <= 499 && reductionRatio >= 0.33);

  if (meetsEmployerSizeThreshold && meetsMassLayoffThreshold) {
    warnings.push({
      law: 'WARN Act (federal)',
      severity: 'warning',
      message: `Cutting ${reduction} of ${currentHeadcount} staff may trigger the federal WARN Act's 60-day advance notice requirement for mass layoffs. Many states have stricter "mini-WARN" laws with lower thresholds. This is general guidance, not legal advice — consult employment counsel before proceeding.`,
    });
  } else if (reduction >= 10) {
    warnings.push({
      law: 'General guidance',
      severity: 'info',
      message: `A reduction of ${reduction} staff is a significant workforce change. Even below federal WARN Act thresholds, check state and local notice requirements before proceeding.`,
    });
  }

  return warnings;
}

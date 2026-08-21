// Singapore CPF Data (2026, updated 2026-08-21)
// Source: cpf.gov.sg — rates effective 1 Jan 2026; 2027 changes announced May 2026

export interface CPFAgeBand {
  label: string
  minAge: number
  maxAge: number
  totalRate: number    // employer + employee
  oa: number           // Ordinary Account %
  sa: number           // Special Account % (age <55) or RA % (age ≥55, SA closed since 2025-01)
  ma: number           // MediSave Account %
}

// Contribution & allocation rates for SC/PR (3rd year+), 1 Jan 2026
// Source: https://www.cpf.gov.sg
export const CPF_RATES: CPFAgeBand[] = [
  { label: '35岁及以下', minAge: 0, maxAge: 35, totalRate: 0.37, oa: 0.23, sa: 0.06, ma: 0.08 },
  { label: '35-45岁', minAge: 36, maxAge: 45, totalRate: 0.37, oa: 0.21, sa: 0.07, ma: 0.09 },
  { label: '45-50岁', minAge: 46, maxAge: 50, totalRate: 0.37, oa: 0.19, sa: 0.08, ma: 0.10 },
  { label: '50-55岁', minAge: 51, maxAge: 55, totalRate: 0.37, oa: 0.15, sa: 0.115, ma: 0.105 },
  { label: '55-60岁', minAge: 56, maxAge: 60, totalRate: 0.34, oa: 0.12, sa: 0.115, ma: 0.105 },
  { label: '60-65岁', minAge: 61, maxAge: 65, totalRate: 0.25, oa: 0.035, sa: 0.11, ma: 0.105 },
  { label: '65-70岁', minAge: 66, maxAge: 70, totalRate: 0.165, oa: 0.01, sa: 0.05, ma: 0.105 },
  { label: '70岁以上', minAge: 71, maxAge: 99, totalRate: 0.125, oa: 0.01, sa: 0.01, ma: 0.105 }
]

// 2027-01-01 rate changes for senior workers (announced May 2026).
// Only 55+ bands change; the increments go entirely to RA (sa field).
// Source: https://www.cpf.gov.sg/service/article/what-are-the-changes-to-the-cpf-contribution-rates-for-senior-workers
export const CPF_RATES_2027_OVERRIDES: CPFAgeBand[] = [
  { label: '55-60岁', minAge: 56, maxAge: 60, totalRate: 0.355, oa: 0.12, sa: 0.13, ma: 0.105 },
  { label: '60-65岁', minAge: 61, maxAge: 65, totalRate: 0.26, oa: 0.035, sa: 0.12, ma: 0.105 }
]

// Interest rates (2026, floor rates; SMRA 4% floor extended to 2026-12-31)
// Note: age 55+ get extra 2% on first $30k + extra 1% on next $30k (not modelled in calc)
export const CPF_INTEREST = {
  oa: 0.025,         // up to 3.5% with extra
  sa: 0.04,          // up to 5% with extra
  ma: 0.04,
  ra: 0.04,
  extraFirst60k: 0.01 // extra 1% on first $60k combined
}

// Retirement Sums — 2026 cohort
export const RETIREMENT_SUMS = { brs: 110200, frs: 220400, ers: 440800 }

// Retirement Sums — 2027 cohort (official 2023-2027 +3.5%/yr trajectory)
export const RETIREMENT_SUMS_2027 = { brs: 114100, frs: 228200, ers: 456400 }

// CPF LIFE monthly payout estimates for different RA balances at 65
// Based on CPF LIFE Standard Plan (2026 estimates)
export function estimateCPFLIFE(raBalance: number): number {
  // Rough formula: ~$720-790/month per $100k in RA at 65
  const per100k = 750
  return Math.round((raBalance / 100000) * per100k)
}

// Monthly salary ceiling for CPF contributions
export const CPF_SALARY_CEILING = 8000  // OW ceiling 2026

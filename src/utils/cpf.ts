import { CPF_RATES, CPF_RATES_2027_OVERRIDES, CPF_INTEREST, RETIREMENT_SUMS, RETIREMENT_SUMS_2027, estimateCPFLIFE, CPF_SALARY_CEILING, type CPFAgeBand } from '../data/cpf'

export interface CPFInput {
  age: number             // current age
  salary: number          // monthly salary
  oaBalance: number       // current OA balance
  saBalance: number       // current SA balance
  maBalance: number       // current MA balance
  retireAt: number        // target retirement age (default 65)
}

export interface CPFResult {
  oaFinal: number         // OA at retirement
  maFinal: number         // MA at retirement
  raBalance: number       // RA at retirement (from SA at 55, plus post-55 RA contributions)
  monthlyPayout: number   // CPF LIFE monthly
  totalRetirement: number // RA + OA
  meetsFRS: boolean       // meets Full Retirement Sum?
  meetsBRS: boolean
}

/** 当前年份（2026）作为模拟基准年 */
const BASE_YEAR = 2026

function getBand(age: number, year: number): CPFAgeBand {
  const band = CPF_RATES.find(b => age >= b.minAge && age <= b.maxAge) || CPF_RATES[CPF_RATES.length - 1]
  // 2027-01-01 起 55+ 档费率上调（增量全入 RA）
  if (year >= 2027) {
    const override = CPF_RATES_2027_OVERRIDES.find(b => age >= b.minAge && age <= b.maxAge)
    if (override) return override
  }
  return band
}

export function calcCPF(input: CPFInput): CPFResult {
  const { age, salary, oaBalance, saBalance, maBalance, retireAt } = input
  const cappedSalary = Math.min(salary, CPF_SALARY_CEILING)

  // Three accounts pre-55, RA created at 55
  let oa = oaBalance
  let sa = saBalance
  let ma = maBalance
  let ra = 0 // Retirement Account, created at age 55

  const retireYear = BASE_YEAR + (retireAt - age)

  for (let a = age; a < retireAt; a++) {
    const year = BASE_YEAR + (a - age)
    const band = getBand(a, year)

    if (a < 55) {
      // Pre-55: OA / SA / MA
      oa = oa * (1 + CPF_INTEREST.oa) + cappedSalary * band.oa * 12
      sa = sa * (1 + CPF_INTEREST.sa) + cappedSalary * band.sa * 12
      ma = ma * (1 + CPF_INTEREST.ma) + cappedSalary * band.ma * 12
    } else {
      // Post-55: OA / RA (SA closed, contributions go to RA) / MA
      oa = oa * (1 + CPF_INTEREST.oa) + cappedSalary * band.oa * 12
      ra = ra * (1 + CPF_INTEREST.ra) + cappedSalary * band.sa * 12
      ma = ma * (1 + CPF_INTEREST.ma) + cappedSalary * band.ma * 12
    }

    // At exactly age 55: SA closes, its balance transfers into RA.
    // Must ADD to ra, not overwrite: the branch above already credited this
    // year's RA-allocated contribution (band.sa) to ra.
    if (a === 55) {
      ra = ra + sa
      sa = 0
    }
  }

  const monthlyPayout = estimateCPFLIFE(ra)

  // 按退休年份选择退休金全额（2027 起用 2027 队列）
  const sums = retireYear >= 2027 ? RETIREMENT_SUMS_2027 : RETIREMENT_SUMS

  return {
    oaFinal: Math.round(oa),
    maFinal: Math.round(ma),
    raBalance: Math.round(ra),
    monthlyPayout,
    totalRetirement: Math.round(oa + ra),
    meetsFRS: ra >= sums.frs,
    meetsBRS: ra >= sums.brs
  }
}

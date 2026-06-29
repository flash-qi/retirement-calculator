import { CPF_RATES, CPF_INTEREST, RETIREMENT_SUMS, estimateCPFLIFE, CPF_SALARY_CEILING, type CPFAgeBand } from '../data/cpf'

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

function getBand(age: number): CPFAgeBand {
  return CPF_RATES.find(b => age >= b.minAge && age <= b.maxAge) || CPF_RATES[CPF_RATES.length - 1]
}

export function calcCPF(input: CPFInput): CPFResult {
  const { age, salary, oaBalance, saBalance, maBalance, retireAt } = input
  const cappedSalary = Math.min(salary, CPF_SALARY_CEILING)

  // Three accounts pre-55, RA created at 55
  let oa = oaBalance
  let sa = saBalance
  let ma = maBalance
  let ra = 0 // Retirement Account, created at age 55

  for (let a = age; a < retireAt; a++) {
    const band = getBand(a)

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

    // At exactly age 55: transfer SA balance → RA
    if (a === 55) {
      ra = sa // SA moves to RA at 55
      sa = 0
    }
  }

  const monthlyPayout = estimateCPFLIFE(ra)

  return {
    oaFinal: Math.round(oa),
    maFinal: Math.round(ma),
    raBalance: Math.round(ra),
    monthlyPayout,
    totalRetirement: Math.round(oa + ra),
    meetsFRS: ra >= RETIREMENT_SUMS.frs,
    meetsBRS: ra >= RETIREMENT_SUMS.brs
  }
}

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
  saFinal: number         // SA at retirement (becomes RA at 55)
  maFinal: number         // MA at retirement
  raBalance: number       // RA at retirement
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

  let oa = oaBalance, sa = saBalance, ma = maBalance

  for (let a = age; a < retireAt; a++) {
    const band = getBand(a)
    const monthlyContrib = cappedSalary * band.totalRate
    const monthlyOA = cappedSalary * band.oa
    const monthlySA = cappedSalary * band.sa
    const monthlyMA = cappedSalary * band.ma

    // Compound
    oa = oa * (1 + CPF_INTEREST.oa) + monthlyOA * 12
    sa = sa * (1 + CPF_INTEREST.sa) + monthlySA * 12
    ma = ma * (1 + CPF_INTEREST.ma) + monthlyMA * 12

    // At 55, SA moves to RA
    if (a === 55) {
      // SA savings above FRS? Can withdraw above FRS/BRS
      sa = 0
    }
  }

  // At retirement: SA=0 (moved to RA at 55), balance forms RA
  const raBalance = sa // SA has been accumulating as "RA" post-55
  const monthlyPayout = estimateCPFLIFE(raBalance)

  return {
    oaFinal: Math.round(oa),
    saFinal: Math.round(sa), // should be 0 at retirement
    maFinal: Math.round(ma),
    raBalance: Math.round(raBalance),
    monthlyPayout,
    totalRetirement: Math.round(oa + raBalance),
    meetsFRS: raBalance >= RETIREMENT_SUMS.frs,
    meetsBRS: raBalance >= RETIREMENT_SUMS.brs
  }
}

export interface SavingsInput {
  currentAge: number
  retireAge: number
  currentSavings: number
  monthlyDeposit: number
  annualReturn: number  // 年化收益率，如 0.05 = 5%
  lifeExpectancy: number
}

export interface SavingsResult {
  workingYears: number
  totalAtRetirement: number
  monthlyWithdrawal: number
  retirementYears: number
}

/** 计算退休储蓄 */
export function calcSavings(input: SavingsInput): SavingsResult {
  const { currentAge, retireAge, currentSavings, monthlyDeposit, annualReturn, lifeExpectancy } = input

  const workingYears = retireAge - currentAge
  const retirementYears = lifeExpectancy - retireAge
  const monthlyRate = annualReturn / 12

  // 现有储蓄的复利终值
  const fvCurrent = currentSavings * Math.pow(1 + annualReturn, workingYears)

  // 每月定投的复利终值
  const periods = workingYears * 12
  let fvMonthly = 0
  if (monthlyRate > 0) {
    fvMonthly = monthlyDeposit * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate)
  } else {
    fvMonthly = monthlyDeposit * periods
  }

  const totalAtRetirement = Math.round(fvCurrent + fvMonthly)

  // 退休后每月可支配（简化：总资产除以退休后总月数）
  const monthlyWithdrawal = retirementYears > 0
    ? Math.round(totalAtRetirement / (retirementYears * 12))
    : 0

  return {
    workingYears,
    totalAtRetirement,
    monthlyWithdrawal,
    retirementYears
  }
}

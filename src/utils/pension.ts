import { MONTHS_TABLE } from '../constants'

export interface PensionInput {
  baseAmount: number       // 计发基数
  avgIndex: number         // 平均缴费指数 (0.6~3.0)
  contributionYears: number // 累计缴费年限（含视同）
  deemedYears: number       // 视同缴费年限
  accountBalance: number    // 个人账户储存额
  retireAge: number         // 退休年龄
  transitionRatio: number   // 过渡系数
}

export interface PensionResult {
  basicPension: number      // 基础养老金
  accountPension: number    // 个人账户养老金
  transitionPension: number // 过渡性养老金
  totalPension: number      // 月养老金合计
}

export function calcPension(input: PensionInput): PensionResult {
  const { baseAmount, avgIndex, contributionYears, deemedYears, accountBalance, retireAge, transitionRatio } = input

  // 基础养老金
  const basicPension = Math.round(
    baseAmount * (1 + avgIndex) / 2 * contributionYears * 0.01
  )

  // 计发月数（取最近的值，默认139）
  const months = MONTHS_TABLE[retireAge] || 139

  // 个人账户养老金
  const accountPension = Math.round(accountBalance / months)

  // 过渡性养老金（仅"中人"有视同缴费年限）
  const transitionPension = deemedYears > 0
    ? Math.round(baseAmount * avgIndex * deemedYears * transitionRatio)
    : 0

  return {
    basicPension,
    accountPension,
    transitionPension,
    totalPension: basicPension + accountPension + transitionPension
  }
}

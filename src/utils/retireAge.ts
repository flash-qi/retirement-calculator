export type JobType = 'male_worker' | 'female_cadre' | 'female_worker'

interface RetireAgeResult {
  originalAge: number
  originalDate: string
  delayMonths: number
  actualAge: string
  actualDate: string
  minContributionYears: number
}

const POLICY_START = new Date('2025-01-01')

const config: Record<JobType, { originalAge: number; delayStep: number; maxDelay: number }> = {
  male_worker: { originalAge: 60, delayStep: 4, maxDelay: 36 },
  female_cadre: { originalAge: 55, delayStep: 4, maxDelay: 36 },
  female_worker: { originalAge: 50, delayStep: 2, maxDelay: 60 }
}

function getOriginalRetireDate(birthDate: Date, originalAge: number): Date {
  const d = new Date(birthDate)
  d.setFullYear(d.getFullYear() + originalAge)
  return d
}

function getMinContributionYears(retireYear: number): number {
  if (retireYear <= 2029) return 15
  if (retireYear >= 2039) return 20
  return 15 + (retireYear - 2029) * 0.5
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}年${m}月`
}

function ageToDisplay(ageYears: number, extraMonths: number): string {
  if (extraMonths === 0) return `${ageYears}周岁`
  return `${ageYears}岁${extraMonths}个月`
}

export function calcRetireAge(birthDate: Date, jobType: JobType): RetireAgeResult {
  const cfg = config[jobType]
  const originalDate = getOriginalRetireDate(birthDate, cfg.originalAge)

  let delayMonths = 0

  if (originalDate >= POLICY_START) {
    const monthsPast = (originalDate.getFullYear() - POLICY_START.getFullYear()) * 12
      + (originalDate.getMonth() - POLICY_START.getMonth())

    delayMonths = Math.min(
      Math.floor(monthsPast / cfg.delayStep) + 1,
      cfg.maxDelay
    )
  }

  const actualDate = new Date(originalDate)
  actualDate.setMonth(actualDate.getMonth() + delayMonths)

  const ageDiff = actualDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = actualDate.getMonth() - birthDate.getMonth()
  const totalMonths = ageDiff * 12 + monthDiff
  const actualAgeYears = Math.floor(totalMonths / 12)
  const actualAgeMonths = totalMonths % 12

  return {
    originalAge: cfg.originalAge,
    originalDate: formatDate(originalDate),
    delayMonths,
    actualAge: ageToDisplay(actualAgeYears, actualAgeMonths),
    actualDate: formatDate(actualDate),
    minContributionYears: getMinContributionYears(actualDate.getFullYear())
  }
}

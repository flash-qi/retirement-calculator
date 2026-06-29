import { useState, useEffect, useMemo, useRef } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CityPicker, { type SelectedCity } from '../../components/CityPicker'
import ShareCard from '../../components/ShareCard'
import ChartCard from '../../components/ChartCard'
import { calcPension, type PensionResult } from '../../utils/pension'
import { hasErrors } from '../../utils/validation'
import { drawDonutChart } from '../../utils/chart'
import './index.scss'

const indexOptions = ['0.6 (60%)', '0.8 (80%)', '1.0 (100%)', '1.5 (150%)', '2.0 (200%)', '3.0 (300%)']
const indexValues = [0.6, 0.8, 1.0, 1.5, 2.0, 3.0]
const annuityCompanyOptions = ['4%', '5%', '6%', '7%', '8%（上限）']
const annuityCompanyValues = [0.04, 0.05, 0.06, 0.07, 0.08]
const annuityPersonalOptions = ['1%', '2%', '3%', '4%（上限）']
const annuityPersonalValues = [0.01, 0.02, 0.03, 0.04]

export default function Pension() {
  Taro.useShareAppMessage(() => ({
    title: '退休计算器',
    path: '/pages/index/index'
  }))
  const [city, setCity] = useState<SelectedCity | null>(null)
  const [salary, setSalary] = useState('')
  const [conYears, setConYears] = useState('')
  const [deemedYears, setDeemedYears] = useState('0')
  const [indexIdx, setIndexIdx] = useState(2)
  const [accountBal, setAccountBal] = useState('')
  const [retireAge, setRetireAge] = useState('60')
  const [result, setResult] = useState<PensionResult | null>(null)

  // P1-3: Scenario comparison (in-memory only)
  interface Scenario { label: string; pension: number; replacementRate: number; basic: number; account: number }
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [showAnnuity, setShowAnnuity] = useState(false)
  const [annuityCompanyIdx, setAnnuityCompanyIdx] = useState(4) // default 8%
  const [annuityPersonalIdx, setAnnuityPersonalIdx] = useState(3) // default 4%

  // Validation
  const s = Number(salary), c = Number(conYears), d = Number(deemedYears), a = Number(accountBal), r = Number(retireAge)
  const errors = {
    salary: s && (s < 1000 || s > 500000) ? '请输入 1,000 - 500,000 元' : '',
    conYears: c && (c < 1 || c > 50) ? '请输入 1 - 50 年' : '',
    deemedYears: d && (d < 0 || d > (c || 0)) ? `请输入 0 - ${c || 0} 年` : '',
    accountBal: a && (a < 0 || a > 5000000) ? '请输入 0 - 5,000,000 元' : '',
    retireAge: r && (r < 40 || r > 70) ? '请输入 40 - 70 岁' : ''
  }
  const error = hasErrors(errors)

  useEffect(() => {
    if (!city || !salary || !conYears || !accountBal || error) {
      setResult(null)
      return
    }
    const avgIndex = indexValues[indexIdx]
    const nc = Number(conYears), nd = Number(deemedYears), na = Number(accountBal), nr = Number(retireAge)
    const baseResult = calcPension({
      baseAmount: city.base,
      avgIndex,
      contributionYears: nc,
      deemedYears: nd,
      accountBalance: na,
      retireAge: nr,
      transitionRatio: city.transitionRatio
    })
    // Enterprise annuity
    let annuityMonthly = 0
    if (showAnnuity) {
      const sal = Number(salary)
      const annualDeposit = sal * (annuityCompanyValues[annuityCompanyIdx] + annuityPersonalValues[annuityPersonalIdx]) * 12
      const interest = 0.03 // default 3% assumed return
      const workYears = Math.min(nc, nr - 22) // working years, assume starts at 22
      const fv = workYears > 0 ? annualDeposit * ((Math.pow(1 + interest, workYears) - 1) / interest) : annualDeposit
      const months = nr >= 60 ? 139 : nr >= 55 ? 170 : 195 // payout months
      annuityMonthly = Math.round(fv / months)
    }
    setResult({ ...baseResult, totalPension: baseResult.totalPension + annuityMonthly, annuityMonthly } as any)
  }, [city, salary, conYears, deemedYears, indexIdx, accountBal, retireAge, error, showAnnuity, annuityCompanyIdx, annuityPersonalIdx])

  // Auto-scroll — debounced, only after user stops typing
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!result) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      Taro.pageScrollTo({ scrollTop: 9999, duration: 300 })
    }, 800)
    return () => clearTimeout(scrollTimer.current)
  }, [result])

  const shareRows = result ? [
    { label: '基础养老金', value: `¥${result.basicPension.toLocaleString()}` },
    { label: '个人账户养老金', value: `¥${result.accountPension.toLocaleString()}` },
    ...(result.transitionPension > 0
      ? [{ label: '过渡性养老金', value: `¥${result.transitionPension.toLocaleString()}` }]
      : []),
    { label: '月养老金合计', value: `¥${result.totalPension.toLocaleString()}/月`, highlight: true },
  ] : []

  const interpretation = result && salary ? (() => {
    const replacementRate = Math.round(result.totalPension / Number(salary) * 100)
    const level = replacementRate >= 70 ? '良好' : replacementRate >= 50 ? '一般' : '偏低'
    return `养老金替代率约 ${replacementRate}%（${level}）。国际劳工组织建议退休后收入不低于退休前的 70%，你可通过提高缴费基数和延长缴费年限来提升。`
  })() : ''

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>社保养老金计算</Text>
        <Text className='page-desc'>选择城市、填写信息，实时估算退休后每月养老金</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>省/市</Text>
          <CityPicker value={city} onChange={setCity} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>月工资（元）</Text>
          <Input className='form-input' type='digit'
            value={salary} onInput={(e) => setSalary(e.detail.value)} />
          {errors.salary && <Text className='form-error'>{errors.salary}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>缴费年限（年）</Text>
          <Input className='form-input' type='digit'
            value={conYears} onInput={(e) => setConYears(e.detail.value)} />
          {errors.conYears && <Text className='form-error'>{errors.conYears}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>视同缴费年限 / 1998年前工龄（年）</Text>
          <Input className='form-input' type='digit'
            value={deemedYears} onInput={(e) => setDeemedYears(e.detail.value)} />
          {errors.deemedYears && <Text className='form-error'>{errors.deemedYears}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>平均缴费指数</Text>
          <Picker mode='selector' range={indexOptions}
            value={indexIdx} onChange={(e) => setIndexIdx(Number(e.detail.value))}>
            <View className='form-picker'>
              <Text>{indexOptions[indexIdx]}</Text>
              <Text className='picker-arr'>›</Text>
            </View>
          </Picker>
        </View>
        <View className='form-item'>
          <Text className='form-label'>个人账户余额（元）</Text>
          <Input className='form-input' type='digit'
            value={accountBal} onInput={(e) => setAccountBal(e.detail.value)} />
          {errors.accountBal && <Text className='form-error'>{errors.accountBal}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>退休年龄</Text>
          <Input className='form-input' type='number'
            value={retireAge} onInput={(e) => setRetireAge(e.detail.value)} />
          {errors.retireAge && <Text className='form-error'>{errors.retireAge}</Text>}
        </View>
      </View>

      {/* Enterprise Annuity Toggle */}
      <View className='annuity-toggle' onClick={() => setShowAnnuity(!showAnnuity)}>
        <View className={`toggle-switch ${showAnnuity ? 'on' : ''}`}>
          {showAnnuity && <View className='toggle-knob' />}
          {!showAnnuity && <View className='toggle-knob off' />}
        </View>
        <Text className='toggle-label'>我有企业年金/职业年金</Text>
      </View>

      {showAnnuity && (
        <View className='form-card' style='margin-top: 16rpx;'>
          <View className='form-item'>
            <Text className='form-label'>单位缴费比例</Text>
            <Picker mode='selector' range={annuityCompanyOptions}
              value={annuityCompanyIdx} onChange={(e) => setAnnuityCompanyIdx(Number(e.detail.value))}>
              <View className='form-picker'>
                <Text>{annuityCompanyOptions[annuityCompanyIdx]}</Text>
                <Text className='picker-arr'>›</Text>
              </View>
            </Picker>
          </View>
          <View className='form-item'>
            <Text className='form-label'>个人缴费比例</Text>
            <Picker mode='selector' range={annuityPersonalOptions}
              value={annuityPersonalIdx} onChange={(e) => setAnnuityPersonalIdx(Number(e.detail.value))}>
              <View className='form-picker'>
                <Text>{annuityPersonalOptions[annuityPersonalIdx]}</Text>
                <Text className='picker-arr'>›</Text>
              </View>
            </Picker>
          </View>
        </View>
      )}

      <Text className='form-note'>当前数据为2025年各省人社厅公布数据，2026年计发基数将在下半年陆续更新</Text>

      {result && (
        <>
          <View className='result-card'>
            <Text className='result-label'>月养老金合计</Text>
            <Text className='result-amount'>¥{result.totalPension.toLocaleString()}</Text>
            <Text className='result-unit'>/月</Text>
            <View className='result-breakdown'>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>¥{result.basicPension.toLocaleString()}</Text>
                <Text className='breakdown-lbl'>基础养老金</Text>
              </View>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>¥{result.accountPension.toLocaleString()}</Text>
                <Text className='breakdown-lbl'>个人账户</Text>
              </View>
              {result.transitionPension > 0 && (
                <View className='breakdown-item'>
                  <Text className='breakdown-val'>¥{result.transitionPension.toLocaleString()}</Text>
                  <Text className='breakdown-lbl'>过渡性</Text>
                </View>
              )}
              {(result as any).annuityMonthly > 0 && (
                <View className='breakdown-item'>
                  <Text className='breakdown-val'>¥{(result as any).annuityMonthly.toLocaleString()}</Text>
                  <Text className='breakdown-lbl'>企业年金</Text>
                </View>
              )}
            </View>
          </View>

          {salary && (
            <View className='gauge-card'>
              <Text className='gauge-label'>养老金替代率</Text>
              <View className='gauge-row'>
                <Text className='gauge-pct'>{Math.round(result.totalPension / Number(salary) * 100)}%</Text>
                <Text className='gauge-level'>
                  {Math.round(result.totalPension / Number(salary) * 100) >= 70 ? '优秀' :
                   Math.round(result.totalPension / Number(salary) * 100) >= 50 ? '一般' : '偏低'}
                </Text>
              </View>
              <View className='gauge-track'>
                <View className='gauge-fill' style={{
                  width: `${Math.min(Math.round(result.totalPension / Number(salary) * 100), 100)}%`,
                  background: Math.round(result.totalPension / Number(salary) * 100) >= 70 ? '#10B981' :
                    Math.round(result.totalPension / Number(salary) * 100) >= 50 ? '#F59E0B' : '#FF6B6B'
                }} />
              </View>
              <View className='gauge-scale'>
                <Text className='gauge-tick'>0%</Text>
                <Text className='gauge-tick'>50%</Text>
                <Text className='gauge-tick t70'>70%</Text>
                <Text className='gauge-tick'>100%</Text>
              </View>
              <Text className='gauge-hint'>70% 为国际劳工组织建议的最低替代率</Text>
            </View>
          )}

          {interpretation && (
            <View className='tip-card'>{interpretation}</View>
          )}

          {salary && result && (
            <View className='compare-section'>
              {scenarios.length < 3 && (
                <View
                  className='btn-save-scenario'
                  onClick={() => {
                    const rate = Math.round(result.totalPension / Number(salary) * 100)
                    setScenarios([...scenarios, {
                      label: `方案${scenarios.length + 1}`,
                      pension: result.totalPension,
                      replacementRate: rate,
                      basic: result.basicPension,
                      account: result.accountPension
                    }])
                  }}
                >
                  保存当前参数（{3 - scenarios.length} 次可用）
                </View>
              )}

              {scenarios.length > 0 && (
                <View className='scenario-compare'>
                  <View className='scenario-header'>
                    <Text className='scenario-title'>
                      {scenarios.length === 1 ? '已保存方案' : '方案对比'}
                    </Text>
                    <Text className='scenario-clear' onClick={() => setScenarios([])}>清除</Text>
                  </View>
                  <View className='scenario-table'>
                    <View className='scenario-row hdr'>
                      <Text className='scenario-cell'>指标</Text>
                      {scenarios.map((s) => (
                        <Text key={s.label} className='scenario-cell'>{s.label}</Text>
                      ))}
                    </View>
                    <View className='scenario-row'>
                      <Text className='scenario-cell'>月养老金</Text>
                      {scenarios.map((s) => (
                        <Text key={s.label} className='scenario-cell val'>¥{s.pension.toLocaleString()}</Text>
                      ))}
                    </View>
                    <View className='scenario-row'>
                      <Text className='scenario-cell'>替代率</Text>
                      {scenarios.map((s) => (
                        <Text key={s.label} className='scenario-cell val' style={{ color: s.replacementRate >= 70 ? '#10B981' : s.replacementRate >= 50 ? '#F59E0B' : '#FF6B6B' }}>
                          {s.replacementRate}%
                        </Text>
                      ))}
                    </View>
                    <View className='scenario-row'>
                      <Text className='scenario-cell'>基础养老金</Text>
                      {scenarios.map((s) => (
                        <Text key={s.label} className='scenario-cell val'>¥{s.basic.toLocaleString()}</Text>
                      ))}
                    </View>
                    <View className='scenario-row'>
                      <Text className='scenario-cell'>个人账户</Text>
                      {scenarios.map((s) => (
                        <Text key={s.label} className='scenario-cell val'>¥{s.account.toLocaleString()}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {result && !previewVisible && (
            <ChartCard id='pensionDonut' draw={(ctx: any, w: number, h: number, dpr: number) => {
              const segments = [
                { label: '基础养老金', value: result.basicPension, color: '#C2A56B' },
                { label: '个人账户', value: result.accountPension, color: '#8B7340' },
                ...(result.transitionPension > 0
                  ? [{ label: '过渡性', value: result.transitionPension, color: '#B89B5E' }]
                  : [])
              ]
              drawDonutChart(ctx, segments, { width: w, height: h, dpr })
            }} />
          )}

          <ShareCard title='社保养老金计算结果' rows={shareRows} tip='估算结果供参考' onPreviewChange={setPreviewVisible} />
        </>
      )}
    </View>
  )
}

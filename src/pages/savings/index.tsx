import { useState, useEffect, useMemo, useRef } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import ShareCard from '../../components/ShareCard'
import ChartCard from '../../components/ChartCard'
import { calcSavings, type SavingsResult } from '../../utils/savings'
import { drawGrowthChart } from '../../utils/chart'
import './index.scss'

const returnOptions = ['保守 2%', '稳健 4%', '平衡 6%', '进取 8%']
const returnValues = [0.02, 0.04, 0.06, 0.08]
const inflationOptions = ['0% (不考虑)', '2% (低通胀)', '3% (温和通胀)', '4% (较高通胀)', '5% (高通胀)']
const inflationValues = [0, 0.02, 0.03, 0.04, 0.05]

export default function Savings() {
  Taro.useShareAppMessage(() => ({
    title: '退休计算器',
    path: '/pages/index/index'
  }))
  const [currentAge, setCurrentAge] = useState('')
  const [retireAge, setRetireAge] = useState('')
  const [currentSavings, setCurrentSavings] = useState('')
  const [monthlyDeposit, setMonthlyDeposit] = useState('')
  const [returnIdx, setReturnIdx] = useState(1)
  const [inflationIdx, setInflationIdx] = useState(2) // default 3%
  const [lifeExpectancy, setLifeExpectancy] = useState('85')
  const [result, setResult] = useState<SavingsResult | null>(null)

  useEffect(() => {
    const cAge = Number(currentAge)
    const rAge = Number(retireAge)
    if (!currentAge || !retireAge || !currentSavings || !monthlyDeposit || rAge <= cAge) {
      setResult(null)
      return
    }
    setResult(calcSavings({
      currentAge: cAge, retireAge: rAge,
      currentSavings: Number(currentSavings),
      monthlyDeposit: Number(monthlyDeposit),
      annualReturn: returnValues[returnIdx],
      lifeExpectancy: Number(lifeExpectancy)
    }))
  }, [currentAge, retireAge, currentSavings, monthlyDeposit, returnIdx, lifeExpectancy])

  const scrolledRef = useRef(false)
  useEffect(() => {
    if (!result) { scrolledRef.current = false; return }
    if (scrolledRef.current) return
    scrolledRef.current = true
    setTimeout(() => Taro.pageScrollTo({ scrollTop: 9999, duration: 300 }), 300)
  }, [result])

  const shareRows = result ? [
    { label: '退休时总资产', value: `¥${result.totalAtRetirement.toLocaleString()}`, highlight: true },
    { label: '退休后每月可支配', value: `¥${result.monthlyWithdrawal.toLocaleString()}`, highlight: true },
    { label: '距离退休', value: `${result.workingYears}年` },
  ] : []

  const inflRate = inflationValues[inflationIdx]
  const interpretation = result && inflRate > 0 ? (() => {
    const effectiveMonthly = Math.round(result.monthlyWithdrawal * Math.pow(1 - inflRate, result.workingYears))
    return `${result.workingYears} 年后 ¥${result.monthlyWithdrawal.toLocaleString()}（名义值）的实际购买力约相当于今天的 ¥${effectiveMonthly.toLocaleString()}。`
  })() : ''
  const realValue = result && inflRate > 0
    ? Math.round(result.monthlyWithdrawal * Math.pow(1 - inflRate, result.workingYears))
    : null

  const growthPoints = useMemo(() => {
    if (!result) return []
    const cAge = Number(currentAge)
    const rAge = Number(retireAge)
    const lAge = Number(lifeExpectancy)
    const r = returnValues[returnIdx]
    const mDep = Number(monthlyDeposit) || 0
    const cSav = Number(currentSavings) || 0
    const pts: { age: number; amount: number }[] = []
    let bal = cSav
    for (let age = cAge; age <= lAge; age++) {
      if (age <= rAge) bal = bal * (1 + r) + mDep * 12
      else { bal -= result.monthlyWithdrawal * 12; if (bal < 0) bal = 0 }
      if (age === cAge || age % 3 === 0 || age === rAge || age === lAge)
        pts.push({ age, amount: Math.round(bal) })
    }
    return pts
  }, [result, currentAge, retireAge, lifeExpectancy, returnIdx, monthlyDeposit, currentSavings])

  const drawSavingsChart = useMemo(() =>
    growthPoints.length > 0
      ? (ctx: any, w: number, h: number, dpr: number) => {
          drawGrowthChart(ctx, growthPoints, Number(retireAge), { width: w, height: h, dpr })
        }
      : null,
    [growthPoints, retireAge])

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>退休储蓄规划</Text>
        <Text className='page-desc'>填写信息，实时评估退休后每月可支配金额</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>当前年龄</Text>
          <Input className='form-input' type='digit'
            value={currentAge} onInput={(e) => setCurrentAge(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>退休年龄</Text>
          <Input className='form-input' type='digit'
            value={retireAge} onInput={(e) => setRetireAge(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>当前储蓄（元）</Text>
          <Input className='form-input' type='digit'
            value={currentSavings} onInput={(e) => setCurrentSavings(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>每月存入（元）</Text>
          <Input className='form-input' type='digit'
            value={monthlyDeposit} onInput={(e) => setMonthlyDeposit(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>预期年化收益率</Text>
          <Picker mode='selector' range={returnOptions}
            value={returnIdx} onChange={(e) => setReturnIdx(Number(e.detail.value))}>
            <View className='form-picker'>
              <Text>{returnOptions[returnIdx]}</Text>
              <Text className='picker-arr'>›</Text>
            </View>
          </Picker>
        </View>
        <View className='form-item'>
          <Text className='form-label'>预期年通胀率</Text>
          <Picker mode='selector' range={inflationOptions}
            value={inflationIdx} onChange={(e) => setInflationIdx(Number(e.detail.value))}>
            <View className='form-picker'>
              <Text>{inflationOptions[inflationIdx]}</Text>
              <Text className='picker-arr'>›</Text>
            </View>
          </Picker>
        </View>
        <View className='form-item'>
          <Text className='form-label'>预期寿命（岁）</Text>
          <Input className='form-input' type='digit'
            value={lifeExpectancy} onInput={(e) => setLifeExpectancy(e.detail.value)} />
        </View>
      </View>

      {result && (
        <>
          <View className='result-card'>
            <Text className='result-label'>退休时总资产</Text>
            <Text className='result-amount'>¥{result.totalAtRetirement.toLocaleString()}</Text>
            <View className='result-breakdown'>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>¥{result.monthlyWithdrawal.toLocaleString()}</Text>
                <Text className='breakdown-lbl'>名义每月可支配</Text>
              </View>
              {realValue && (
                <View className='breakdown-item'>
                  <Text className='breakdown-val' style='color:#FF6B6B'>¥{realValue.toLocaleString()}</Text>
                  <Text className='breakdown-lbl'>相当今天购买力</Text>
                </View>
              )}
              <View className='breakdown-item'>
                <Text className='breakdown-val'>{result.workingYears}年</Text>
                <Text className='breakdown-lbl'>距离退休</Text>
              </View>
            </View>
          </View>

          {interpretation && (
            <View className='tip-card'>{interpretation}</View>
          )}

          {drawSavingsChart && (
            <ChartCard id='savingsChart' draw={drawSavingsChart} />
          )}

          <ShareCard title='退休储蓄规划结果' rows={shareRows} tip='简化估算供参考' />
        </>
      )}
    </View>
  )
}

import { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CityPicker, { type SelectedCity } from '../../components/CityPicker'
import ShareCard from '../../components/ShareCard'
import { calcPension, type PensionResult } from '../../utils/pension'
import './index.scss'

const indexOptions = ['0.6 (60%)', '0.8 (80%)', '1.0 (100%)', '1.5 (150%)', '2.0 (200%)', '3.0 (300%)']
const indexValues = [0.6, 0.8, 1.0, 1.5, 2.0, 3.0]

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

  // Instant calc when all required fields are filled
  useEffect(() => {
    if (!city || !salary || !conYears || !accountBal) {
      setResult(null)
      return
    }
    const avgIndex = indexValues[indexIdx]
    setResult(calcPension({
      baseAmount: city.base,
      avgIndex,
      contributionYears: Number(conYears),
      deemedYears: Number(deemedYears),
      accountBalance: Number(accountBal),
      retireAge: Number(retireAge),
      transitionRatio: city.transitionRatio
    }))
  }, [city, salary, conYears, deemedYears, indexIdx, accountBal, retireAge])

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
        </View>
        <View className='form-item'>
          <Text className='form-label'>缴费年限（年）</Text>
          <Input className='form-input' type='digit'
            value={conYears} onInput={(e) => setConYears(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>视同缴费年限 / 1998年前工龄（年）</Text>
          <Input className='form-input' type='digit'
            value={deemedYears} onInput={(e) => setDeemedYears(e.detail.value)} />
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
        </View>
        <View className='form-item'>
          <Text className='form-label'>退休年龄</Text>
          <Input className='form-input' type='number'
            value={retireAge} onInput={(e) => setRetireAge(e.detail.value)} />
        </View>
      </View>

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
            </View>
          </View>

          {interpretation && (
            <View className='tip-card'>{interpretation}</View>
          )}

          <ShareCard title='社保养老金计算结果' rows={shareRows} tip='估算结果供参考' />
        </>
      )}
    </View>
  )
}

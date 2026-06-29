import { useState, useEffect, useRef } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { calcPension } from '../../utils/pension'
import { calcCPF } from '../../utils/cpf'
import { hasErrors } from '../../utils/validation'
import { RETIREMENT_SUMS } from '../../data/cpf'
import './index.scss'

const CNY_PER_SGD = 5.3 // approximate exchange rate
const BEIJING_BASE = 12049

export default function Compare() {
  Taro.useShareAppMessage(() => ({ title: '退休计算器', path: '/pages/index/index' }))

  const [age, setAge] = useState('')
  const [salaryCNY, setSalary] = useState('')
  const [workYears, setWorkYears] = useState('')
  const [showResult, setShowResult] = useState(false)

  const a = Number(age), s = Number(salaryCNY), w = Number(workYears)
  const errors = {
    age: a && (a < 22 || a > 65) ? '22 - 65' : '',
    salaryCNY: s && (s < 3000 || s > 200000) ? '3,000 - 200,000' : '',
    workYears: w && (w < 1 || w > a - 22) ? `1 - ${a - 22}` : ''
  }
  const error = hasErrors(errors)

  const cnResult = age && salaryCNY && workYears && !error ? calcPension({
    baseAmount: BEIJING_BASE,
    avgIndex: 1.0,
    contributionYears: w,
    deemedYears: 0,
    accountBalance: s * 0.08 * 12 * w, // 8% personal contribution
    retireAge: 60,
    transitionRatio: 0.013
  }) : null

  const sgResult = age && salaryCNY && !error ? calcCPF({
    age: a,
    salary: Math.round(s / CNY_PER_SGD),
    oaBalance: 0,
    saBalance: 0,
    maBalance: 0,
    retireAt: 65
  }) : null

  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!cnResult && !sgResult) return
    setShowResult(true)
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => Taro.pageScrollTo({ scrollTop: 9999, duration: 300 }), 800)
    return () => clearTimeout(scrollTimer.current)
  }, [cnResult, sgResult])

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>中新退休对比</Text>
        <Text className='page-desc'>同一组参数，对比北京社保 vs 新加坡CPF退休收入</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>当前年龄</Text>
          <Input className='form-input' type='digit' value={age}
            onInput={(e) => setAge(e.detail.value)} />
          {errors.age && <Text className='form-error'>{errors.age}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>月薪（人民币）</Text>
          <Input className='form-input' type='digit' value={salaryCNY}
            onInput={(e) => setSalary(e.detail.value)} />
          {errors.salaryCNY && <Text className='form-error'>{errors.salaryCNY}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>缴费/工作年限（年）</Text>
          <Input className='form-input' type='digit' value={workYears}
            onInput={(e) => setWorkYears(e.detail.value)} />
          {errors.workYears && <Text className='form-error'>{errors.workYears}</Text>}
        </View>
      </View>

      <Text className='form-note'>北京社保（计发基数 ¥12,049）vs 新加坡CPF（汇率 1 SGD ≈ 5.3 CNY），月薪自动换算</Text>

      {showResult && cnResult && sgResult && (
        <View className='dual-compare'>
          {/* China */}
          <View className='dual-card'>
            <View className='dual-flag'>中国 北京</View>
            <Text className='dual-amount'>¥{cnResult.totalPension.toLocaleString()}</Text>
            <Text className='dual-unit'>/月</Text>
            <View className='dual-detail'>
              <Text className='dual-item'>基础 ¥{cnResult.basicPension.toLocaleString()}</Text>
              <Text className='dual-item'>个账 ¥{cnResult.accountPension.toLocaleString()}</Text>
            </View>
            <View className='dual-bar'>
              <View className='dual-fill' style={{ width: `${Math.min(cnResult.totalPension / s * 100, 100)}%` }} />
            </View>
            <Text className='dual-rate'>替代率 {Math.round(cnResult.totalPension / s * 100)}%</Text>
          </View>

          {/* Singapore */}
          <View className='dual-card sg'>
            <View className='dual-flag'>新加坡</View>
            <Text className='dual-amount'>
              S${sgResult.monthlyPayout.toLocaleString()}
            </Text>
            <Text className='dual-unit'>/月 ≈ ¥{Math.round(sgResult.monthlyPayout * CNY_PER_SGD).toLocaleString()}</Text>
            <View className='dual-detail'>
              <Text className='dual-item'>RA S${sgResult.raBalance.toLocaleString()}</Text>
              <Text className='dual-item'>
                FRS {sgResult.meetsFRS ? '达标' : '未达标'}
              </Text>
            </View>
            <View className='dual-bar'>
              <View className='dual-fill' style={{ width: `${Math.min(sgResult.monthlyPayout * CNY_PER_SGD / s * 100, 100)}%` }} />
            </View>
            <Text className='dual-rate'>约 {Math.round(sgResult.monthlyPayout * CNY_PER_SGD / s * 100)}% 替代率</Text>
          </View>

          <Text className='dual-note'>以上为简化估算，实际金额受政策、汇率、缴费基数等多因素影响</Text>
        </View>
      )}
    </View>
  )
}

import { useState, useEffect, useRef } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { calcCPF, type CPFResult } from '../../utils/cpf'
import { hasErrors } from '../../utils/validation'
import { RETIREMENT_SUMS } from '../../data/cpf'
import './index.scss'

export default function CPF() {
  Taro.useShareAppMessage(() => ({ title: '退休计算器', path: '/pages/index/index' }))

  const [age, setAge] = useState('')
  const [salary, setSalary] = useState('')
  const [oaBal, setOaBal] = useState('')
  const [saBal, setSaBal] = useState('')
  const [maBal, setMaBal] = useState('')
  const [retireAt, setRetireAt] = useState('65')
  const [result, setResult] = useState<CPFResult | null>(null)

  // Validation
  const a = Number(age), s = Number(salary), oa = Number(oaBal), sa = Number(saBal), ma = Number(maBal), r = Number(retireAt)
  const errors = {
    age: a && (a < 18 || a > 75) ? '请输入 18 - 75 岁' : '',
    salary: s && (s < 500 || s > 100000) ? '请输入 500 - 100,000 SGD' : '',
    oaBal: oa && (oa < 0 || oa > 5000000) ? '请输入 0 - 5,000,000 SGD' : '',
    retireAt: r && (r <= a || r > 75) ? `请输入 ${Math.max(a + 1, 55)} - 75 岁` : ''
  }
  const error = hasErrors(errors)

  useEffect(() => {
    if (!age || !salary || error) { setResult(null); return }
    setResult(calcCPF({
      age: a, salary: s,
      oaBalance: Number(oaBal) || 0,
      saBalance: Number(saBal) || 0,
      maBalance: Number(maBal) || 0,
      retireAt: r
    }))
  }, [age, salary, oaBal, saBal, maBal, retireAt, error])

  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!result) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => Taro.pageScrollTo({ scrollTop: 9999, duration: 300 }), 800)
    return () => clearTimeout(scrollTimer.current)
  }, [result])

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>CPF 退休计算</Text>
        <Text className='page-desc'>预估 CPF 账户增长，计算退休月收入 (SGD)</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>当前年龄</Text>
          <Input className='form-input' type='digit' value={age}
            onInput={(e) => setAge(e.detail.value)} />
          {errors.age && <Text className='form-error'>{errors.age}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>月薪 (SGD)</Text>
          <Input className='form-input' type='digit' value={salary}
            onInput={(e) => setSalary(e.detail.value)} />
          {errors.salary && <Text className='form-error'>{errors.salary}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>OA 账户余额 (SGD)</Text>
          <Input className='form-input' type='digit' value={oaBal}
            onInput={(e) => setOaBal(e.detail.value)} />
          {errors.oaBal && <Text className='form-error'>{errors.oaBal}</Text>}
        </View>
        <View className='form-item'>
          <Text className='form-label'>SA 账户余额 (SGD)</Text>
          <Input className='form-input' type='digit' value={saBal}
            onInput={(e) => setSaBal(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>MA 账户余额 (SGD)</Text>
          <Input className='form-input' type='digit' value={maBal}
            onInput={(e) => setMaBal(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>退休年龄</Text>
          <Input className='form-input' type='number' value={retireAt}
            onInput={(e) => setRetireAt(e.detail.value)} />
          {errors.retireAt && <Text className='form-error'>{errors.retireAt}</Text>}
        </View>
      </View>

      {result && (
        <View className='result-card'>
          <Text className='result-label'>CPF LIFE 月付</Text>
          <Text className='result-amount'>S${result.monthlyPayout.toLocaleString()}</Text>
          <Text className='result-unit'>/月</Text>
          <View className='result-breakdown'>
            <View className='breakdown-item'>
              <Text className='breakdown-val'>S${result.raBalance.toLocaleString()}</Text>
              <Text className='breakdown-lbl'>RA 退休账户</Text>
            </View>
            <View className='breakdown-item'>
              <Text className='breakdown-val'>S${result.oaFinal.toLocaleString()}</Text>
              <Text className='breakdown-lbl'>OA 普通账户</Text>
            </View>
            <View className='breakdown-item'>
              <Text className='breakdown-val' style={{ color: result.meetsFRS ? '#10B981' : '#F59E0B' }}>
                {result.meetsFRS ? '达标' : '未达标'}
              </Text>
              <Text className='breakdown-lbl'>FRS S${RETIREMENT_SUMS.frs.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

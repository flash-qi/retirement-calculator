import { useState } from 'react'
import { View, Text, Input, Picker, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CityPicker, { type SelectedCity } from '../../components/CityPicker'
import ShareCard from '../../components/ShareCard'
import { calcPension, type PensionResult } from '../../utils/pension'
import './index.scss'

const indexOptions = ['0.6 (60%)', '0.8 (80%)', '1.0 (100%)', '1.5 (150%)', '2.0 (200%)', '3.0 (300%)']
const indexValues = [0.6, 0.8, 1.0, 1.5, 2.0, 3.0]

export default function Pension() {
  const [city, setCity] = useState<SelectedCity | null>(null)
  const [salary, setSalary] = useState('')
  const [conYears, setConYears] = useState('')
  const [deemedYears, setDeemedYears] = useState('0')
  const [indexIdx, setIndexIdx] = useState(2)
  const [accountBal, setAccountBal] = useState('')
  const [retireAge, setRetireAge] = useState('60')
  const [result, setResult] = useState<PensionResult | null>(null)

  const shareRows = result ? [
    { label: '基础养老金', value: `¥${result.basicPension.toLocaleString()}` },
    { label: '个人账户养老金', value: `¥${result.accountPension.toLocaleString()}` },
    ...(result.transitionPension > 0
      ? [{ label: '过渡性养老金', value: `¥${result.transitionPension.toLocaleString()}` }]
      : []),
    { label: '月养老金合计', value: `¥${result.totalPension.toLocaleString()}/月`, highlight: true },
  ] : []

  const handleCalc = () => {
    if (!city) { Taro.showToast({ title: '请选择省/市', icon: 'none' }); return }
    if (!salary) { Taro.showToast({ title: '请输入月工资', icon: 'none' }); return }
    if (!conYears) { Taro.showToast({ title: '请输入缴费年限', icon: 'none' }); return }
    if (!accountBal) { Taro.showToast({ title: '请输入个人账户余额', icon: 'none' }); return }

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
  }

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>社保养老金计算</Text>
        <Text className='page-desc'>选择城市、填写信息，估算退休后每月养老金</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>省/市</Text>
          <CityPicker value={city} onChange={setCity} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>月工资（元）</Text>
          <Input className='form-input' type='digit' placeholder='请输入税前月工资'
            value={salary} onInput={(e) => setSalary(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>缴费年限（年）</Text>
          <Input className='form-input' type='digit' placeholder='累计缴费年限，含视同缴费'
            value={conYears} onInput={(e) => setConYears(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>视同缴费年限 / 1998年前工龄（年）</Text>
          <Input className='form-input' type='digit' placeholder='1998年后参加工作填0即可'
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
          <Input className='form-input' type='digit' placeholder='社保个人账户累计储存额'
            value={accountBal} onInput={(e) => setAccountBal(e.detail.value)} />
        </View>
        <View className='form-item'>
          <Text className='form-label'>退休年龄</Text>
          <Input className='form-input' type='number' placeholder='如不确定可先用延迟退休查询'
            value={retireAge} onInput={(e) => setRetireAge(e.detail.value)} />
        </View>
      </View>

      <Button className='btn-primary' onClick={handleCalc}>计算养老金</Button>
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
          <View className='tip-card'>
            以上为估算结果，实际金额以当地社保机构核定为准。养老金遵循"多缴多得、长缴多得"原则。
          </View>
          <ShareCard title='社保养老金计算结果' rows={shareRows} tip='估算结果供参考' />
        </>
      )}
    </View>
  )
}

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
    { label: '基础养老金（统筹账户）', value: `¥${result.basicPension.toLocaleString()}/月` },
    { label: '个人账户养老金', value: `¥${result.accountPension.toLocaleString()}/月` },
    ...(result.transitionPension > 0
      ? [{ label: '过渡性养老金', value: `¥${result.transitionPension.toLocaleString()}/月` }]
      : []),
    { label: '月养老金合计', value: `¥${result.totalPension.toLocaleString()}/月`, highlight: true },
  ] : []

  const handleCalc = () => {
    if (!city) { Taro.showToast({ title: '请选择城市', icon: 'none' }); return }
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
      <View className='card'>
        <View className='card-title'>社保养老金计算</View>

        <View className='form-item'>
          <Text className='label'>城市</Text>
          <CityPicker value={city} onChange={setCity} />
          <Text className='data-source-note'>
            当前数据为2025年各省人社厅公布数据，2026年计发基数将在下半年陆续更新
          </Text>
        </View>

        <View className='form-item'>
          <Text className='label'>月工资（元）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='请输入税前月工资'
            value={salary}
            onInput={(e) => setSalary(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>缴费年限（年）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='累计缴费年限，含视同缴费'
            value={conYears}
            onInput={(e) => setConYears(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>视同缴费年限 / 1998年前工龄（年）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='1998年后参加工作填0即可'
            value={deemedYears}
            onInput={(e) => setDeemedYears(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>平均缴费指数</Text>
          <Picker
            mode='selector'
            range={indexOptions}
            value={indexIdx}
            onChange={(e) => setIndexIdx(Number(e.detail.value))}
          >
            <View className='picker'>{indexOptions[indexIdx]}</View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='label'>个人账户余额（元）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='社保个人账户累计储存额'
            value={accountBal}
            onInput={(e) => setAccountBal(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>退休年龄</Text>
          <Input
            className='input'
            type='number'
            placeholder='如不确定可先用延迟退休查询'
            value={retireAge}
            onInput={(e) => setRetireAge(e.detail.value)}
          />
        </View>

        <Button className='btn-calc' onClick={handleCalc}>
          计算养老金
        </Button>
      </View>

      {result && (
        <View className='card result-card'>
          <View className='card-title'>计算结果</View>
          <View className='result-row'>
            <Text className='result-label'>基础养老金（统筹账户）</Text>
            <Text className='result-value'>¥{result.basicPension.toLocaleString()}/月</Text>
          </View>
          <View className='result-row'>
            <Text className='result-label'>个人账户养老金</Text>
            <Text className='result-value'>¥{result.accountPension.toLocaleString()}/月</Text>
          </View>
          {result.transitionPension > 0 && (
            <View className='result-row'>
              <Text className='result-label'>过渡性养老金</Text>
              <Text className='result-value'>¥{result.transitionPension.toLocaleString()}/月</Text>
            </View>
          )}
          <View className='result-row total'>
            <Text className='result-label'>月养老金合计</Text>
            <Text className='result-value accent'>¥{result.totalPension.toLocaleString()}</Text>
          </View>

          <View className='result-tip'>
            以上为估算结果，实际金额以当地社保机构核定为准。
            养老金遵循"多缴多得、长缴多得"原则。
          </View>

          <ShareCard
            title='社保养老金计算结果'
            rows={shareRows}
            tip='以上为估算结果，实际金额以当地社保机构核定为准'
          />
        </View>
      )}
    </View>
  )
}

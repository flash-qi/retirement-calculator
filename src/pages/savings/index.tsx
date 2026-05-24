import { useState } from 'react'
import { View, Text, Input, Picker, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { calcSavings, type SavingsResult } from '../../utils/savings'
import './index.scss'

const returnOptions = ['保守 2%', '稳健 4%', '平衡 6%', '进取 8%']
const returnValues = [0.02, 0.04, 0.06, 0.08]

export default function Savings() {
  const [currentAge, setCurrentAge] = useState('')
  const [retireAge, setRetireAge] = useState('')
  const [currentSavings, setCurrentSavings] = useState('')
  const [monthlyDeposit, setMonthlyDeposit] = useState('')
  const [returnIdx, setReturnIdx] = useState(1) // 默认稳健4%
  const [lifeExpectancy, setLifeExpectancy] = useState('85')
  const [result, setResult] = useState<SavingsResult | null>(null)

  const handleCalc = () => {
    if (!currentAge) { Taro.showToast({ title: '请输入当前年龄', icon: 'none' }); return }
    if (!retireAge) { Taro.showToast({ title: '请输入退休年龄', icon: 'none' }); return }
    if (!currentSavings) { Taro.showToast({ title: '请输入当前储蓄', icon: 'none' }); return }
    if (!monthlyDeposit) { Taro.showToast({ title: '请输入每月存入', icon: 'none' }); return }

    const cAge = Number(currentAge)
    const rAge = Number(retireAge)
    if (rAge <= cAge) {
      Taro.showToast({ title: '退休年龄需大于当前年龄', icon: 'none' })
      return
    }

    setResult(calcSavings({
      currentAge: cAge,
      retireAge: rAge,
      currentSavings: Number(currentSavings),
      monthlyDeposit: Number(monthlyDeposit),
      annualReturn: returnValues[returnIdx],
      lifeExpectancy: Number(lifeExpectancy)
    }))
  }

  const handleShare = () => {
    Taro.showShareMenu({ showShareItems: ['wechatFriends', 'wechatMoment'] })
  }

  return (
    <View className='page'>
      <View className='card'>
        <View className='card-title'>退休储蓄规划</View>

        <View className='form-item'>
          <Text className='label'>当前年龄</Text>
          <Input
            className='input'
            type='digit'
            placeholder='请输入当前年龄'
            value={currentAge}
            onInput={(e) => setCurrentAge(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>退休年龄</Text>
          <Input
            className='input'
            type='digit'
            placeholder='可先用"延迟退休查询"确认'
            value={retireAge}
            onInput={(e) => setRetireAge(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>当前储蓄（元）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='现金、理财、存款等可投资资产'
            value={currentSavings}
            onInput={(e) => setCurrentSavings(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>每月存入（元）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='每月固定存储或定投金额'
            value={monthlyDeposit}
            onInput={(e) => setMonthlyDeposit(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>预期年化收益率</Text>
          <Picker
            mode='selector'
            range={returnOptions}
            value={returnIdx}
            onChange={(e) => setReturnIdx(Number(e.detail.value))}
          >
            <View className='picker'>{returnOptions[returnIdx]}</View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='label'>预期寿命（岁）</Text>
          <Input
            className='input'
            type='digit'
            placeholder='参考值：中国目前人均寿命约78岁'
            value={lifeExpectancy}
            onInput={(e) => setLifeExpectancy(e.detail.value)}
          />
        </View>

        <Button className='btn-calc' onClick={handleCalc}>
          开始规划
        </Button>
      </View>

      {result && (
        <View className='card result-card'>
          <View className='card-title'>规划结果</View>

          <View className='result-row'>
            <Text className='result-label'>距离退休</Text>
            <Text className='result-value'>{result.workingYears}年</Text>
          </View>
          <View className='result-row'>
            <Text className='result-label'>退休生活时长</Text>
            <Text className='result-value'>{result.retirementYears}年</Text>
          </View>
          <View className='result-row highlight'>
            <Text className='result-label'>退休时总资产</Text>
            <Text className='result-value accent'>¥{result.totalAtRetirement.toLocaleString()}</Text>
          </View>
          <View className='result-row highlight'>
            <Text className='result-label'>退休后每月可支配</Text>
            <Text className='result-value accent'>¥{result.monthlyWithdrawal.toLocaleString()}</Text>
          </View>

          <View className='result-tip'>
            以上为简化估算，未扣除通货膨胀影响。
            建议退休后每月支出不超过退休前收入的70%-80%。
          </View>

          <Button className='btn-share' openType='share' onClick={handleShare}>
            分享给朋友
          </Button>
        </View>
      )}
    </View>
  )
}

import { useState } from 'react'
import { View, Text, Picker, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { calcRetireAge, type JobType, type RetireAgeResult } from '../../utils/retireAge'
import ShareCard from '../../components/ShareCard'
import './index.scss'

const jobOptions: { label: string; value: JobType }[] = [
  { label: '男职工（原60岁退休）', value: 'male_worker' },
  { label: '女干部/管理技术岗（原55岁退休）', value: 'female_cadre' },
  { label: '女工人/生产操作岗（原50岁退休）', value: 'female_worker' }
]

export default function RetireAge() {
  const [birthDate, setBirthDate] = useState('')
  const [jobType, setJobType] = useState<JobType>('male_worker')
  const [jobIndex, setJobIndex] = useState(0)
  const [result, setResult] = useState<RetireAgeResult | null>(null)

  const handleCalc = () => {
    if (!birthDate) {
      Taro.showToast({ title: '请选择出生日期', icon: 'none' })
      return
    }
    const d = new Date(birthDate)
    if (isNaN(d.getTime())) {
      Taro.showToast({ title: '日期格式不正确', icon: 'none' })
      return
    }
    setResult(calcRetireAge(d, jobType))
  }

  return (
    <View className='page'>
      <View className='card'>
        <View className='card-title'>延迟退休年龄查询</View>

        <View className='form-item'>
          <Text className='label'>出生日期</Text>
          <Picker
            mode='date'
            value={birthDate}
            start='1960-01-01'
            end='2010-12-31'
            onChange={(e) => setBirthDate(e.detail.value)}
          >
            <View className={`picker ${birthDate ? '' : 'placeholder'}`}>
              {birthDate || '请选择出生日期'}
            </View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='label'>岗位类型</Text>
          <Picker
            mode='selector'
            range={jobOptions}
            rangeKey='label'
            value={jobIndex}
            onChange={(e) => {
              const idx = Number(e.detail.value)
              setJobIndex(idx)
              setJobType(jobOptions[idx].value)
            }}
          >
            <View className='picker'>{jobOptions[jobIndex].label}</View>
          </Picker>
        </View>

        <Button className='btn-calc' onClick={handleCalc}>
          计算退休年龄
        </Button>
      </View>

      {result && (
        <View className='card result-card'>
          <View className='card-title'>计算结果</View>
          <View className='result-row'>
            <Text className='result-label'>原法定退休年龄</Text>
            <Text className='result-value'>{result.originalAge}周岁</Text>
          </View>
          <View className='result-row'>
            <Text className='result-label'>原退休时间</Text>
            <Text className='result-value'>{result.originalDate}</Text>
          </View>
          <View className='result-row highlight'>
            <Text className='result-label'>延迟月数</Text>
            <Text className='result-value accent'>{result.delayMonths}个月</Text>
          </View>
          <View className='result-row highlight'>
            <Text className='result-label'>实际退休年龄</Text>
            <Text className='result-value accent'>{result.actualAge}</Text>
          </View>
          <View className='result-row highlight'>
            <Text className='result-label'>实际退休时间</Text>
            <Text className='result-value accent'>{result.actualDate}</Text>
          </View>
          <View className='result-row'>
            <Text className='result-label'>最低缴费年限</Text>
            <Text className='result-value'>{result.minContributionYears}年</Text>
          </View>
          <View className='result-tip'>
            符合条件可选择弹性提前退休（最多提前3年）或弹性延迟退休（最多延迟3年）
          </View>
          <ShareCard
            title='延迟退休年龄查询结果'
            rows={[
              { label: '原法定退休年龄', value: `${result.originalAge}周岁` },
              { label: '原退休时间', value: result.originalDate },
              { label: '延迟月数', value: `${result.delayMonths}个月`, highlight: true },
              { label: '实际退休年龄', value: result.actualAge, highlight: true },
              { label: '实际退休时间', value: result.actualDate, highlight: true },
              { label: '最低缴费年限', value: `${result.minContributionYears}年` },
            ]}
            tip='符合条件可选择弹性提前退休或延迟退休'
          />
        </View>
      )}
    </View>
  )
}

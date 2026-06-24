import { useState, useEffect, useRef } from 'react'
import { View, Text, Picker } from '@tarojs/components'
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
  Taro.useShareAppMessage(() => ({
    title: '退休计算器',
    path: '/pages/index/index'
  }))
  const [birthDate, setBirthDate] = useState('')
  const [jobType, setJobType] = useState<JobType>('male_worker')
  const [jobIndex, setJobIndex] = useState(0)
  const [result, setResult] = useState<RetireAgeResult | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  const shareRows = result ? [
    { label: '原法定退休年龄', value: `${result.originalAge}周岁` },
    { label: '延迟月数', value: `${result.delayMonths}个月`, highlight: true },
    { label: '实际退休年龄', value: result.actualAge, highlight: true },
    { label: '实际退休时间', value: result.actualDate, highlight: true },
    { label: '最低缴费年限', value: `${result.minContributionYears}年` },
  ] : []

  useEffect(() => {
    if (!birthDate) {
      setResult(null)
      return
    }
    setResult(calcRetireAge(new Date(birthDate), jobType))
  }, [birthDate, jobType])

  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!result) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      Taro.pageScrollTo({ scrollTop: 9999, duration: 300 })
    }, 800)
    return () => clearTimeout(scrollTimer.current)
  }, [result])

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>延迟退休年龄查询</Text>
        <Text className='page-desc'>根据渐进式延迟退休政策，查看你的实际退休时间</Text>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='form-label'>出生日期</Text>
          <Picker mode='date' value={birthDate} start='1960-01-01' end='2010-12-31'
            onChange={(e) => setBirthDate(e.detail.value)}>
            <View className='form-picker'>
              <Text style={birthDate ? '' : 'color: #CBD5E1'}>
                {birthDate || '请选择出生日期'}
              </Text>
              <Text className='picker-arr'>›</Text>
            </View>
          </Picker>
        </View>
        <View className='form-item'>
          <Text className='form-label'>岗位类型</Text>
          <Picker mode='selector' range={jobOptions} rangeKey='label'
            value={jobIndex} onChange={(e) => {
              const idx = Number(e.detail.value)
              setJobIndex(idx)
              setJobType(jobOptions[idx].value)
            }}>
            <View className='form-picker'>
              <Text>{jobOptions[jobIndex].label}</Text>
              <Text className='picker-arr'>›</Text>
            </View>
          </Picker>
        </View>
      </View>

      <Text className='form-note'>选择出生日期和岗位类型后自动计算</Text>

      {result && (
        <>
          <View className='result-card'>
            <Text className='result-label'>实际退休年龄</Text>
            <Text className='result-main'>{result.actualAge}</Text>
            <Text className='result-sub'>{result.actualDate} 退休</Text>
            <View className='result-breakdown'>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>{result.originalAge}岁</Text>
                <Text className='breakdown-lbl'>原法定年龄</Text>
              </View>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>+{result.delayMonths}月</Text>
                <Text className='breakdown-lbl'>延迟</Text>
              </View>
              <View className='breakdown-item'>
                <Text className='breakdown-val'>{result.minContributionYears}年</Text>
                <Text className='breakdown-lbl'>最低缴费年限</Text>
              </View>
            </View>
          </View>
          <View className='tip-card'>
            符合条件可选择弹性提前退休（最多提前3年）或弹性延迟退休（最多延迟3年）
          </View>
          <ShareCard title='延迟退休年龄查询结果' rows={shareRows} tip='弹性退休政策请参考当地人社部门' onPreviewChange={setPreviewVisible} />
        </>
      )}
    </View>
  )
}

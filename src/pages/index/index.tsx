import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  const navTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  return (
    <View className='home'>
      <View className='hero'>
        <Text className='hero-title'>退休计算器</Text>
        <Text className='hero-sub'>算算你退休后能领多少钱</Text>
      </View>

      <View className='menu'>
        <View className='menu-item' onClick={() => navTo('/pages/retire-age/index')}>
          <Text className='menu-icon'>📅</Text>
          <View className='menu-text'>
            <Text className='menu-title'>延迟退休年龄查询</Text>
            <Text className='menu-desc'>输入出生日期，查看实际退休年龄</Text>
          </View>
          <Text className='menu-arrow'>›</Text>
        </View>

        <View className='menu-item' onClick={() => navTo('/pages/pension/index')}>
          <Text className='menu-icon'>💰</Text>
          <View className='menu-text'>
            <Text className='menu-title'>社保养老金计算</Text>
            <Text className='menu-desc'>估算退休后每月能领多少养老金</Text>
          </View>
          <Text className='menu-arrow'>›</Text>
        </View>

        <View className='menu-item' onClick={() => navTo('/pages/savings/index')}>
          <Text className='menu-icon'>📊</Text>
          <View className='menu-text'>
            <Text className='menu-title'>退休储蓄规划</Text>
            <Text className='menu-desc'>计算退休后每月可支配金额</Text>
          </View>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>
    </View>
  )
}

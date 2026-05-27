import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const menus = [
  { icon: '📅', cssClass: 'c1', title: '延迟退休年龄查询', desc: '输入出生日期，查看实际退休年龄', url: '/pages/retire-age/index' },
  { icon: '💰', cssClass: 'c2', title: '社保养老金计算', desc: '估算退休后每月能领多少养老金', url: '/pages/pension/index' },
  { icon: '📊', cssClass: 'c3', title: '退休储蓄规划', desc: '计算退休后每月可支配金额', url: '/pages/savings/index' }
]

const FEEDBACK_LINK = 'https://docs.qq.com/form/page/DUUZzSWpjVHhaQVdJ'

export default function Index() {
  const handleFeedback = () => {
    Taro.setClipboardData({
      data: FEEDBACK_LINK,
      success: () => {
        Taro.showModal({
          title: '意见反馈',
          content: '反馈链接已复制，请在浏览器中粘贴打开',
          showCancel: false
        })
      },
      fail: () => {
        Taro.showModal({
          title: '意见反馈',
          content: `请复制以下链接在浏览器中打开：\n\n${FEEDBACK_LINK}`,
          showCancel: false
        })
      }
    })
  }

  return (
    <View className='home'>
      <View className='hero'>
        <Text className='hero-badge'>RETIREMENT</Text>
        <Text className='hero-title'>退休计算器</Text>
        <Text className='hero-sub'>算算你退休后能领多少钱</Text>
      </View>

      <View className='menu'>
        {menus.map((m) => (
          <View
            key={m.title}
            className='menu-card'
            onClick={() => Taro.navigateTo({ url: m.url })}
          >
            <View className={`menu-icon-wrap ${m.cssClass}`}>{m.icon}</View>
            <View className='menu-info'>
              <Text className='menu-name'>{m.title}</Text>
              <Text className='menu-desc'>{m.desc}</Text>
            </View>
            <Text className='menu-arr'>›</Text>
          </View>
        ))}
      </View>

      <View className='footer' onClick={handleFeedback}>
        <Text className='footer-text'>意见反馈</Text>
      </View>
    </View>
  )
}

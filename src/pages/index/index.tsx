import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const menus = [
  { cssClass: 'c1', title: '延迟退休年龄查询', desc: '输入出生日期，查看实际退休年龄', url: '/pages/retire-age/index' },
  { cssClass: 'c2', title: '社保养老金计算', desc: '估算退休后每月能领多少养老金', url: '/pages/pension/index' },
  { cssClass: 'c3', title: '退休储蓄规划', desc: '计算退休后每月可支配金额', url: '/pages/savings/index' }
]

const FEEDBACK_LINK = 'https://docs.qq.com/form/page/DUUZzSWpjVHhaQVdJ'
const PRIVACY_KEY = 'privacy_accepted'

// Simple SVG icons as data URIs
const ICONS = {
  calendar: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'),
  calculator: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E55A5A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>'),
  chart: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF8E72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'),
  shield: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'),
  check: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>')
}

const PRIVACY_ITEMS = [
  '所有计算均在您的设备上本地完成',
  '不收集、不上传任何个人信息',
  '不存储您的输入数据和计算结果'
]

export default function Index() {
  const [showPrivacy, setShowPrivacy] = useState(false)

  useEffect(() => {
    try {
      const accepted = Taro.getStorageSync(PRIVACY_KEY)
      if (!accepted) {
        setShowPrivacy(true)
      }
    } catch (_) {
      setShowPrivacy(true)
    }
  }, [])

  Taro.useShareAppMessage(() => ({
    title: '退休计算器 - 算算你退休后能领多少钱',
    path: '/pages/index/index'
  }))

  const acceptPrivacy = () => {
    Taro.setStorageSync(PRIVACY_KEY, '1')
    setShowPrivacy(false)
  }

  const handleFeedback = () => {
    Taro.setClipboardData({
      data: FEEDBACK_LINK,
      success: () => Taro.showModal({
        title: '意见反馈',
        content: '反馈链接已复制，请在浏览器中粘贴打开',
        showCancel: false
      }),
      fail: () => Taro.showModal({
        title: '意见反馈',
        content: `请复制以下链接在浏览器中打开：\n\n${FEEDBACK_LINK}`,
        showCancel: false
      })
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
        {menus.map((m, i) => (
          <View
            key={m.title}
            className='menu-card'
            onClick={() => Taro.navigateTo({ url: m.url })}
          >
            <View className={`menu-icon-wrap ${m.cssClass}`}>
              <image
                className='icon-svg'
                src={[ICONS.calendar, ICONS.calculator, ICONS.chart][i]}
                mode='aspectFit'
              />
            </View>
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

      {showPrivacy && (
        <View className='privacy-mask'>
          <View className='privacy-box'>
            <View className='privacy-icon'>
              <image src={ICONS.shield} style='width:32px;height:32px;' mode='aspectFit' />
            </View>
            <Text className='privacy-title'>您的数据是安全的</Text>
            <Text className='privacy-desc'>退休计算器重视您的隐私</Text>
            <View className='privacy-list'>
              {PRIVACY_ITEMS.map((item) => (
                <View className='privacy-item' key={item}>
                  <image className='check-icon' src={ICONS.check} mode='aspectFit' />
                  <Text className='check-text'>{item}</Text>
                </View>
              ))}
            </View>
            <Button className='btn-got-it' onClick={acceptPrivacy}>知道了</Button>
          </View>
        </View>
      )}
    </View>
  )
}

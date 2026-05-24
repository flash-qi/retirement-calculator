import { useState, useCallback } from 'react'
import { View, Text, Canvas, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Props {
  title: string
  rows: { label: string; value: string; highlight?: boolean }[]
  tip?: string
}

export default function ShareCard({ title, rows, tip }: Props) {
  const [imagePath, setImagePath] = useState('')
  const canvasId = 'shareCanvas'

  const generateImage = useCallback(() => {
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) {
          // fallback: try older API
          drawWithOldApi()
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const width = 375 * 2
        const height = 500 * 2
        const dpr = Taro.getSystemInfoSync().pixelRatio

        canvas.width = width
        canvas.height = height
        ctx.scale(dpr, dpr)

        drawCard(ctx, 375, 500)

        Taro.canvasToTempFilePath({
          canvas,
          success: (result) => {
            setImagePath(result.tempFilePath)
          },
          fail: () => {
            Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
          }
        })
      })
  }, [title, rows, tip])

  const drawCard = (ctx: any, w: number, h: number) => {
    const padding = 24
    const cardW = w - padding * 2

    // Background
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, w, h)

    // Card
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(padding, 20, cardW, h - 40, 16)
    ctx.fill()

    // Title
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('退休计算器', padding + 20, 60)

    // Divider
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding + 20, 80)
    ctx.lineTo(w - padding - 20, 80)
    ctx.stroke()

    // Result title
    ctx.fillStyle = '#666'
    ctx.font = '14px sans-serif'
    ctx.fillText(title, padding + 20, 110)

    let y = 145
    rows.forEach((row) => {
      ctx.fillStyle = row.highlight ? '#2979ff' : '#333'
      ctx.font = row.highlight ? 'bold 18px sans-serif' : '16px sans-serif'
      ctx.fillText(row.value, padding + 20, y)
      ctx.fillStyle = '#999'
      ctx.font = '12px sans-serif'
      ctx.fillText(row.label, padding + 20, y + 20)
      y += 50
    })

    // Tip
    if (tip) {
      ctx.fillStyle = '#cc8800'
      ctx.font = '11px sans-serif'
      ctx.fillText(tip, padding + 20, y + 10)
      y += 30
    }

    // Footer
    ctx.fillStyle = '#ccc'
    ctx.font = '10px sans-serif'
    ctx.fillText('来自"退休计算器"小程序', padding + 20, h - 30)
  }

  const drawWithOldApi = () => {
    const ctx = Taro.createCanvasContext(canvasId)
    ctx.setFillStyle('#f5f5f5')
    ctx.fillRect(0, 0, 375, 500)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(24, 20, 327, 460)
    ctx.setFillStyle('#1a1a1a')
    ctx.setFontSize(20)
    ctx.fillText('退休计算器', 44, 60)
    ctx.setFillStyle('#666')
    ctx.setFontSize(14)
    ctx.fillText(title, 44, 110)

    let y = 145
    rows.forEach((row) => {
      ctx.setFillStyle(row.highlight ? '#2979ff' : '#333')
      ctx.setFontSize(row.highlight ? 18 : 16)
      ctx.fillText(row.value, 44, y)
      ctx.setFillStyle('#999')
      ctx.setFontSize(12)
      ctx.fillText(row.label, 44, y + 20)
      y += 50
    })

    ctx.setFillStyle('#ccc')
    ctx.setFontSize(10)
    ctx.fillText('来自"退休计算器"小程序', 44, 470)
    ctx.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: canvasId,
        success: (result) => {
          setImagePath(result.tempFilePath)
        },
        fail: () => {
          Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
        }
      })
    })
  }

  const saveImage = () => {
    if (!imagePath) return
    Taro.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        Taro.showToast({ title: '已保存到相册', icon: 'success' })
        setImagePath('')
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          Taro.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片',
            showCancel: false
          })
        }
      }
    })
  }

  return (
    <View className='share-card'>
      <Canvas
        type='2d'
        id={canvasId}
        className='share-canvas'
      />

      <View className='share-actions'>
        <Button className='btn-generate' onClick={generateImage}>
          生成分享图片
        </Button>
      </View>

      {imagePath && (
        <View className='preview-mask' onClick={() => setImagePath('')}>
          <View className='preview-box' onClick={(e) => e.stopPropagation()}>
            <Image className='preview-image' src={imagePath} mode='widthFix' />
            <View className='preview-tip'>长按图片保存到相册</View>
            <Button className='btn-save' onClick={saveImage}>保存到相册</Button>
            <Button className='btn-close' onClick={() => setImagePath('')}>关闭</Button>
          </View>
        </View>
      )}
    </View>
  )
}

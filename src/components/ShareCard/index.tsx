import { useState, useCallback } from 'react'
import { View, Canvas, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Props {
  title: string
  rows: { label: string; value: string; highlight?: boolean }[]
  tip?: string
}

function drawRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y + r, x + r, y, r)
  ctx.closePath()
}

export default function ShareCard({ title, rows, tip }: Props) {
  const [imagePath, setImagePath] = useState('')
  const canvasId = 'shareCanvas'

  const drawCard = (ctx: any, w: number, h: number) => {
    const P = 24

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#FBF8F2')
    grad.addColorStop(0.35, '#FDF9F0')
    grad.addColorStop(1, '#FBF8F2')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, w, 0)
    barGrad.addColorStop(0, '#C2A56B')
    barGrad.addColorStop(1, '#B89B5E')
    ctx.fillStyle = barGrad
    ctx.fillRect(0, 0, w, 6)

    // App name
    ctx.fillStyle = '#C2A56B'
    ctx.font = '15px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('退休计算器', P, 36)

    // Title
    ctx.fillStyle = '#2E2A25'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(title, P, 72)

    // Divider
    ctx.strokeStyle = '#E5DDCF'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(P, 90)
    ctx.lineTo(w - P, 90)
    ctx.stroke()

    // Main value (first highlighted row)
    const mainRow = rows.find(r => r.highlight) || rows[rows.length - 1]
    const otherRows = rows.filter(r => r !== mainRow)

    ctx.fillStyle = '#A8A098'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(mainRow.label, w / 2, 130)

    ctx.fillStyle = '#2E2A25'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(mainRow.value.replace('/月', ''), w / 2, 182)

    // Other rows in columns
    if (otherRows.length > 0) {
      const cols = w / otherRows.length
      let ly = 222
      ctx.strokeStyle = '#E5DDCF'
      ctx.beginPath()
      ctx.moveTo(P, ly - 12)
      ctx.lineTo(w - P, ly - 12)
      ctx.stroke()

      otherRows.forEach((row, i) => {
        const lx = cols * i + cols / 2
        ctx.fillStyle = '#2E2A25'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(row.value, lx, ly + 6)
        ctx.fillStyle = '#A8A098'
        ctx.font = '10px sans-serif'
        ctx.fillText(row.label, lx, ly + 28)
      })
    }

    // Tip
    if (tip) {
      ctx.fillStyle = '#A8A098'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(tip, w / 2, h - 42)
    }

    // Footer
    ctx.fillStyle = '#C4BCB0'
    ctx.font = '9px sans-serif'
    ctx.fillText('来自退休计算器小程序', w / 2, h - 20)
  }

  const generateImage = useCallback(() => {
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) {
          drawWithOldApi()
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const w = 375
        const h = 500
        const dpr = Taro.getWindowInfo().pixelRatio

        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)

        drawCard(ctx, w, h)

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

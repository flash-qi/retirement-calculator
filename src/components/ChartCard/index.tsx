import { useEffect, useRef } from 'react'
import { View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Props {
  id: string
  draw: (ctx: any, w: number, h: number, dpr: number) => void
  className?: string
}

/** Generic Canvas chart wrapper with auto-draw on mount/update */
export default function ChartCard({ id, draw, className = '' }: Props) {
  const drawn = useRef(false)

  useEffect(() => {
    drawn.current = false
    // Small delay for DOM to render
    setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query.select(`#${id}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]?.node) return
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getWindowInfo().pixelRatio
          const w = res[0].width
          const h = res[0].height

          canvas.width = w * dpr
          canvas.height = h * dpr
          ctx.clearRect(0, 0, w * dpr, h * dpr)

          draw(ctx, w, h, dpr)
          drawn.current = true
        })
    }, 200)
  }, [draw, id])

  return (
    <View className={`chart-card ${className}`}>
      <Canvas type='2d' id={id} className='chart-canvas' />
    </View>
  )
}

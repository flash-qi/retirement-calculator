// Canvas 2D chart utilities for WeChat mini programs
// No external dependencies — pure Canvas API

const COLORS = {
  primary: '#C2A56B',
  accent: '#8B7340',
  grid: '#E5DDCF',
  text: '#A8A098',
  dark: '#2E2A25',
  white: '#FFFFFF',
  chart: ['#C2A56B', '#8B7340', '#B89B5E', '#E5DDCF']
}

/** Draw a rounded rectangle path */
export function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
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

interface GrowthPoint {
  age: number
  amount: number
}

/** Draw a savings growth line chart */
export function drawGrowthChart(
  ctx: any,
  points: GrowthPoint[],
  retireAge: number,
  opts: { width: number; height: number; dpr: number }
) {
  const { width: w, height: h, dpr } = opts
  const pad = { top: 30, right: 20, bottom: 40, left: 55 }
  const cw = w - pad.left - pad.right
  const ch = h - pad.top - pad.bottom

  ctx.save()
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = COLORS.white
  ctx.beginPath()
  roundRect(ctx, 0, 0, w, h, 12)
  ctx.fill()

  // Title
  ctx.fillStyle = COLORS.dark
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('储蓄增长曲线', pad.left, 20)

  // Find max for Y scale
  const maxAmount = Math.max(...points.map((p) => p.amount))
  const yMax = Math.ceil(maxAmount / 100000) * 100000 + 100000

  // Grid lines
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(w - pad.right, y)
    ctx.stroke()
  }

  // Y axis labels
  ctx.fillStyle = COLORS.text
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const val = yMax - (yMax / 4) * i
    const y = pad.top + (ch / 4) * i
    ctx.fillText(formatNum(val), pad.left - 4, y + 4)
  }

  // Retirement age marker
  const retireX = pad.left + ((retireAge - points[0].age) / (points[points.length - 1].age - points[0].age)) * cw
  ctx.strokeStyle = '#C2A56B'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(retireX, pad.top)
  ctx.lineTo(retireX, pad.top + ch)
  ctx.stroke()
  ctx.setLineDash([])

  // Retirement label
  ctx.fillStyle = '#C2A56B'
  ctx.font = 'bold 9px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`退休 ${retireAge}岁`, retireX, pad.top + ch + 16)

  // Area fill
  ctx.fillStyle = 'rgba(194, 165, 107, 0.12)'
  ctx.beginPath()
  points.forEach((p, i) => {
    const x = pad.left + (i / (points.length - 1)) * cw
    const y = pad.top + ch - (p.amount / yMax) * ch
    if (i === 0) ctx.moveTo(x, pad.top + ch)
    ctx.lineTo(x, y)
  })
  ctx.lineTo(pad.left + cw, pad.top + ch)
  ctx.closePath()
  ctx.fill()

  // Line
  ctx.strokeStyle = '#C2A56B'
  ctx.lineWidth = 2
  ctx.beginPath()
  points.forEach((p, i) => {
    const x = pad.left + (i / (points.length - 1)) * cw
    const y = pad.top + ch - (p.amount / yMax) * ch
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Peak marker
  const peakIdx = points.reduce((max, p, i) => p.amount > points[max].amount ? i : max, 0)
  const peakX = pad.left + (peakIdx / (points.length - 1)) * cw
  const peakY = pad.top + ch - (points[peakIdx].amount / yMax) * ch
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#C2A56B'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(peakX, peakY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Peak label
  ctx.fillStyle = COLORS.dark
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = peakX > w / 2 ? 'right' : 'left'
  const labelX = peakX > w / 2 ? peakX - 6 : peakX + 6
  ctx.fillText(`¥${formatNum(points[peakIdx].amount)}`, labelX, peakY - 6)

  ctx.restore()
}

/** Draw a donut chart for pension composition */
export function drawDonutChart(
  ctx: any,
  segments: { label: string; value: number; color: string }[],
  opts: { width: number; height: number; dpr: number }
) {
  const { width: w, height: h, dpr } = opts
  const legendH = 48
  const cy = (h - legendH) / 2
  const cx = w / 2
  const outerR = Math.min(cx, cy) - 20
  const innerR = outerR * 0.62

  ctx.save()
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = COLORS.white
  ctx.beginPath()
  roundRect(ctx, 0, 0, w, h, 12)
  ctx.fill()

  // Title
  ctx.fillStyle = COLORS.dark
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('养老金构成', cx, 18)

  // Donut
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let startAngle = -Math.PI / 2

  segments.forEach((seg) => {
    const sliceAngle = (seg.value / total) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle)
    ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = seg.color
    ctx.fill()
    startAngle += sliceAngle
  })

  // Center label
  ctx.fillStyle = COLORS.dark
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('合计', cx, cy - 4)
  ctx.font = 'bold 14px sans-serif'
  const totalStr = total >= 10000 ? (total / 10000).toFixed(1) + '万' : Math.round(total).toString()
  ctx.fillText('¥' + totalStr, cx, cy + 14)

  // Legend — placed below the donut
  const legendY = h - 28
  const itemW = w / segments.length
  ctx.textAlign = 'center'
  ctx.font = '9px sans-serif'
  segments.forEach((seg, i) => {
    const lx = itemW * i + itemW / 2
    ctx.fillStyle = seg.color
    ctx.fillRect(lx - 24, legendY - 6, 10, 10)
    ctx.fillStyle = COLORS.text
    ctx.fillText(seg.label, lx - 2, legendY + 8)
  })

  ctx.restore()
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + '万'
  return Math.round(n).toLocaleString()
}

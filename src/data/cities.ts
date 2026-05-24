export interface CityData {
  name: string
  base: number
  transitionRatio: number // 过渡系数
}

/** 2025年各省/市计发基数（元/月）+ 过渡系数 */
export const cities: CityData[] = [
  { name: '上海', base: 12434, transitionRatio: 0.013 },
  { name: '北京', base: 12049, transitionRatio: 0.013 },
  { name: '西藏', base: 11777, transitionRatio: 0.012 },
  { name: '深圳', base: 11293, transitionRatio: 0.012 },
  { name: '广东', base: 9493, transitionRatio: 0.012 },
  { name: '天津', base: 9417, transitionRatio: 0.013 },
  { name: '武汉', base: 9112, transitionRatio: 0.012 },
  { name: '青海', base: 9056, transitionRatio: 0.012 },
  { name: '江苏', base: 8917, transitionRatio: 0.012 },
  { name: '四川', base: 8462, transitionRatio: 0.012 },
  { name: '新疆', base: 8448, transitionRatio: 0.012 },
  { name: '浙江', base: 8433, transitionRatio: 0.012 },
  { name: '宁夏', base: 8366, transitionRatio: 0.012 },
  { name: '云南', base: 8265, transitionRatio: 0.012 },
  { name: '重庆', base: 8240, transitionRatio: 0.013 },
  { name: '内蒙古', base: 8197, transitionRatio: 0.012 },
  { name: '海南', base: 8188, transitionRatio: 0.012 },
  { name: '安徽', base: 7999, transitionRatio: 0.012 },
  { name: '长春', base: 7978, transitionRatio: 0.012 },
  { name: '山东', base: 7831, transitionRatio: 0.013 },
  { name: '湖南', base: 7694, transitionRatio: 0.012 },
  { name: '黑龙江', base: 7705, transitionRatio: 0.012 },
  { name: '甘肃', base: 7446, transitionRatio: 0.012 },
  { name: '河北', base: 7410, transitionRatio: 0.013 },
  { name: '贵州', base: 7325, transitionRatio: 0.012 },
  { name: '吉林', base: 7322, transitionRatio: 0.012 },
  { name: '广西', base: 7100, transitionRatio: 0.012 },
  { name: '河南', base: 7000, transitionRatio: 0.012 },
  { name: '江西', base: 6900, transitionRatio: 0.012 },
  { name: '山西', base: 7200, transitionRatio: 0.012 },
  { name: '辽宁', base: 7300, transitionRatio: 0.012 }
]

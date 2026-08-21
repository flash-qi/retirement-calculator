export interface CityData {
  name: string
  base: number
  note?: string    // 数据备注，如"2026年数据"等
}

export interface ProvinceData {
  name: string
  transitionRatio: number
  cities: CityData[]
}

/**
 * 各省/市养老金计发基数
 *
 * 数据说明（更新于 2026-08-21）：
 * - 已标注"2026年数据"的为 2026 年计发基数，来源为各省人社厅官方公布或全口径社平工资（并轨省）
 * - 标注"报道值"的为多来源交叉报道但未见官方文件原文，待官方核实
 * - 未标注的仍为 2025 年数据（2026 年新基数预计 2026 年 9-12 月陆续公布，公布后更新）
 */
export const provinces: ProvinceData[] = [
  // === 直辖市 ===
  { name: '北京', transitionRatio: 0.013, cities: [{ name: '全市', base: 12049, note: '2025年官方基数（未并轨），2026年预计10-11月公布' }] },
  { name: '上海', transitionRatio: 0.013, cities: [{ name: '全市', base: 12577, note: '2026年数据' }] },
  { name: '天津', transitionRatio: 0.013, cities: [{ name: '全市', base: 9417 }] },
  { name: '重庆', transitionRatio: 0.013, cities: [{ name: '全市', base: 8240 }] },

  // === 华东 ===
  {
    name: '广东', transitionRatio: 0.012, cities: [
      { name: '全省（不含深圳）', base: 9493 },
      { name: '深圳', base: 11293 }
    ]
  },
  { name: '江苏', transitionRatio: 0.012, cities: [{ name: '全省', base: 8917 }] },
  { name: '浙江', transitionRatio: 0.012, cities: [{ name: '全省', base: 8869, note: '2026年数据' }] },
  { name: '福建', transitionRatio: 0.012, cities: [{ name: '全省', base: 7932 }] },
  { name: '安徽', transitionRatio: 0.012, cities: [{ name: '全省', base: 7999 }] },
  { name: '江西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7054 }] },
  {
    name: '山东', transitionRatio: 0.013, cities: [
      { name: '全省（不含菏泽）', base: 7831 },
      { name: '菏泽（企业）', base: 7506 }
    ]
  },

  // === 华中 ===
  { name: '河南', transitionRatio: 0.012, cities: [{ name: '全省', base: 6738, note: '2025年官方值（全国最低），2026年惯例11-12月公布；7850系郑州当地基数误传' }] },
  {
    name: '湖北', transitionRatio: 0.012, cities: [
      { name: '武汉', base: 9112 },
      { name: '襄阳', base: 7325 },
      { name: '宜昌', base: 7424 },
      { name: '其他城市（第3档）', base: 7154 }
    ]
  },
  { name: '湖南', transitionRatio: 0.012, cities: [{ name: '全省', base: 7694 }] },

  // === 华北 ===
  { name: '河北', transitionRatio: 0.013, cities: [{ name: '全省', base: 7410 }] },
  { name: '山西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7253 }] },
  { name: '内蒙古', transitionRatio: 0.012, cities: [{ name: '全区', base: 8430, note: '2026年数据' }] },

  // === 东北 ===
  {
    name: '辽宁', transitionRatio: 0.012, cities: [
      { name: '全省（不含沈阳、大连）', base: 7346 },
      { name: '沈阳（企业）', base: 8390 },
      { name: '大连（企业）', base: 8956 }
    ]
  },
  {
    name: '吉林', transitionRatio: 0.012, cities: [
      { name: '全省（不含长春）', base: 7322 },
      { name: '长春', base: 7978 }
    ]
  },
  { name: '黑龙江', transitionRatio: 0.012, cities: [{ name: '全省', base: 7705, note: '2026年数据，全国首个公布' }] },

  // === 西南 ===
  { name: '四川', transitionRatio: 0.012, cities: [{ name: '全省', base: 8462, note: '2025年官方基数（原8321为2024年值），2026年度惯例11-12月公布' }] },
  { name: '贵州', transitionRatio: 0.012, cities: [{ name: '全省', base: 7376.75, note: '2026年数据' }] },
  { name: '云南', transitionRatio: 0.012, cities: [{ name: '全省', base: 8265 }] },
  { name: '西藏', transitionRatio: 0.012, cities: [{ name: '全区', base: 11777 }] },

  // === 西北 ===
  { name: '陕西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7881 }] },
  { name: '甘肃', transitionRatio: 0.012, cities: [{ name: '全省', base: 7746 }] },
  { name: '青海', transitionRatio: 0.012, cities: [{ name: '全省', base: 9056 }] },
  { name: '宁夏', transitionRatio: 0.012, cities: [{ name: '全区', base: 8366 }] },
  { name: '新疆', transitionRatio: 0.012, cities: [{ name: '全区', base: 8448 }] },

  // === 华南其他 ===
  { name: '广西', transitionRatio: 0.012, cities: [{ name: '全区', base: 6983 }] },
  { name: '海南', transitionRatio: 0.012, cities: [{ name: '全省', base: 8188 }] }
]

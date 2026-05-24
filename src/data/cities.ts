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
 * 数据说明：
 * - 若无特殊标注，数据截至2025年底，来源为各省人社厅官方公布
 * - 2026年计发基数一般在2026年下半年由各省人社厅陆续公布
 * - 黑龙江已公布2026年数据，单独标注
 */
export const provinces: ProvinceData[] = [
  // === 直辖市 ===
  { name: '北京', transitionRatio: 0.013, cities: [{ name: '全市', base: 12049 }] },
  { name: '上海', transitionRatio: 0.013, cities: [{ name: '全市', base: 12434 }] },
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
  { name: '浙江', transitionRatio: 0.012, cities: [{ name: '全省', base: 8433 }] },
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
  { name: '河南', transitionRatio: 0.012, cities: [{ name: '全省', base: 6738 }] },
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
  { name: '内蒙古', transitionRatio: 0.012, cities: [{ name: '全省', base: 8179 }] },

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
  { name: '四川', transitionRatio: 0.012, cities: [{ name: '全省', base: 8321 }] },
  { name: '贵州', transitionRatio: 0.012, cities: [{ name: '全省', base: 7325 }] },
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

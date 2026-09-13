export interface CityData {
  name: string
  base: number
  year: number           // 该数值所属年度
  provisional?: boolean  // 预发口径：新年度基数未公布，暂按此值计发，公布后重算补差
  note?: string          // 来源文号 / 口径说明
}

export interface ProvinceData {
  name: string
  transitionRatio: number
  cities: CityData[]
}

/**
 * 各省/市养老金计发基数
 *
 * 数据说明（更新于 2026-09-13）：
 * - 2026 年度已公布（5 地）：上海、内蒙古、贵州、黑龙江、新疆——均为并轨省，
 *   即"计发基数 = 上年度全口径城镇单位就业人员月平均工资"，由省人社厅发文公布社平后推定。
 * - 其余 26 个省级单位截至 2026-09-13 均未正式发文公布 2026 年度计发基数，
 *   新退休人员按 2025 年度值"预发"，新基数公布后社保局会重算补差。这是各省通行口径，
 *   不是数据过期——所以单独用 provisional 标出来，而不是含糊地写"沿用旧数据"。
 * - 发布窗口集中在 9-12 月（2025 年度文件多发布于 9 月中下旬至 11 月），预计未来数周陆续更新。
 *
 * 核查标准（2026-09 五组并行核查，逐省核对文号）：
 * - 只认省人社厅/省人民政府官网（.gov.cn）文件原文 + 发文字号 + 官方解读；
 * - 自媒体、汇总表、预测页一律仅作线索，不得作为定值依据；
 * - 数值须与官方历史序列交叉验证（增速平滑），序列断裂的一律回退；
 * - 严格区分四个易混概念：**计发基数** ≠ 社保缴费基数上下限 ≠ 全口径社平工资 ≠ 工伤待遇计发基数。
 */

/**
 * 2026 年度计发基数尚未公布：暂按 2025 年度值预发。
 * 展开即可，用于让"已公布 2026"的少数省份在数据里一眼可辨。
 */
const pending2026 = { year: 2025, provisional: true }

export const provinces: ProvinceData[] = [
  // === 直辖市 ===
  { name: '北京', transitionRatio: 0.013, cities: [{ name: '全市', base: 12049, ...pending2026, note: '京人社发〔2025〕13号；2026年度惯例10月底至11月公布' }] },
  { name: '上海', transitionRatio: 0.013, cities: [{ name: '全市', base: 12577, year: 2026, note: '2025年度全口径月平均工资，并轨推定（2026-08-18公布）' }] },
  { name: '天津', transitionRatio: 0.013, cities: [{ name: '全市', base: 9417, ...pending2026, note: '津人社局发〔2026〕5号仅公布缴费基数，未含计发基数' }] },
  { name: '重庆', transitionRatio: 0.013, cities: [{ name: '全市', base: 8240, ...pending2026 }] },

  // === 华东 ===
  {
    name: '广东', transitionRatio: 0.012, cities: [
      { name: '全省（不含深圳）', base: 9493, ...pending2026, note: '粤人社发〔2025〕32号，适用期2025-01-01至2025-12-31；2026年度待发文' },
      { name: '深圳', base: 11293, ...pending2026, note: '深圳市人社局答复，适用期2025-01-01至2025-12-31' }
    ]
  },
  { name: '江苏', transitionRatio: 0.012, cities: [{ name: '全省', base: 8917, ...pending2026 }] },
  { name: '浙江', transitionRatio: 0.012, cities: [{ name: '全省', base: 8433, ...pending2026, note: '2024年度全口径加权平均工资（并轨省）；网传"8869"无官方出处，已回退' }] },
  { name: '福建', transitionRatio: 0.012, cities: [{ name: '全省', base: 7932, ...pending2026, note: '闽人社文〔2025〕45号' }] },
  { name: '安徽', transitionRatio: 0.012, cities: [{ name: '全省', base: 7999, ...pending2026, note: '皖人社秘〔2025〕153号' }] },
  { name: '江西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7054, ...pending2026, note: '赣人社发〔2025〕48号' }] },
  {
    name: '山东', transitionRatio: 0.013, cities: [
      { name: '全省（不含菏泽）', base: 7831, ...pending2026, note: '鲁人社字〔2025〕100号' },
      { name: '菏泽（企业）', base: 7506, ...pending2026 }
    ]
  },

  // === 华中 ===
  { name: '河南', transitionRatio: 0.012, cities: [{ name: '全省', base: 6738, ...pending2026, note: '全国最低；网传"7850"系郑州地市基数（用于过渡性养老金），非全省值' }] },
  {
    name: '湖北', transitionRatio: 0.012, cities: [
      { name: '武汉（含省直）', base: 9112, ...pending2026, note: '湖北计发基数按地市逐一设定，省厅文件未公开发布，此值来自养老金核定表口径' },
      { name: '宜昌', base: 7424, ...pending2026 },
      { name: '襄阳', base: 7325, ...pending2026 },
      { name: '其他地市（荆州/黄冈/孝感/咸宁/鄂州等）', base: 7210, ...pending2026, note: '取全省最低值（荆州7210），实际各地市约 7210-7347' }
    ]
  },
  { name: '湖南', transitionRatio: 0.012, cities: [{ name: '全省', base: 7694, ...pending2026, note: '湘人社规〔2025〕；湖南未并轨，计发基数独立设定（2025年缴费基准值6787 ≠ 计发基数7694）' }] },

  // === 华北 ===
  { name: '河北', transitionRatio: 0.013, cities: [{ name: '全省', base: 7410, ...pending2026, note: '冀人社字〔2025〕105号' }] },
  { name: '山西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7253, ...pending2026, note: '晋人社厅发〔2026〕27号仅公布缴费基数，未含计发基数' }] },
  { name: '内蒙古', transitionRatio: 0.012, cities: [{ name: '全区', base: 8430, year: 2026, note: '2025年度全口径月平均工资，并轨推定（内人社办发〔2026〕85号）' }] },

  // === 东北 ===
  {
    name: '辽宁', transitionRatio: 0.012, cities: [
      { name: '全省（不含沈阳、大连）', base: 7346, ...pending2026, note: '辽人社〔2025〕17号' },
      { name: '沈阳（企业）', base: 8390, ...pending2026 },
      { name: '大连（企业）', base: 8956, ...pending2026 }
    ]
  },
  {
    name: '吉林', transitionRatio: 0.012, cities: [
      { name: '全省（不含长春、农垦）', base: 7322, ...pending2026, note: '吉人社联〔2025〕97号（87865元/年）' },
      { name: '长春', base: 7978, ...pending2026, note: '吉人社联〔2025〕97号（95739元/年）' },
      { name: '农垦企业', base: 2223, ...pending2026, note: '吉人社联〔2025〕97号（26681元/年）' }
    ]
  },
  { name: '黑龙江', transitionRatio: 0.012, cities: [{ name: '全省', base: 7705, year: 2026, note: '黑人社函〔2025〕611号，2026-01-01起执行，全国首个公布' }] },

  // === 西南 ===
  { name: '四川', transitionRatio: 0.012, cities: [{ name: '全省', base: 8462, ...pending2026, note: '2025年度值（原8321为2024年度值）；四川未并轨，惯例11-12月公布' }] },
  { name: '贵州', transitionRatio: 0.012, cities: [{ name: '全省', base: 7376.75, year: 2026, note: '2025年全口径88521元/年，并轨推定（黔人社发〔2026〕7号，7月14日发布）' }] },
  { name: '云南', transitionRatio: 0.012, cities: [{ name: '全省', base: 8265, ...pending2026, note: '云南未并轨，计发基数高于全口径社平' }] },
  { name: '西藏', transitionRatio: 0.012, cities: [{ name: '全区', base: 11777, ...pending2026, note: '藏人社发〔2025〕56号；已并轨（上限35331=11777×3、下限7066.2=11777×0.6）' }] },

  // === 西北 ===
  { name: '陕西', transitionRatio: 0.012, cities: [{ name: '全省', base: 7881, ...pending2026 }] },
  { name: '甘肃', transitionRatio: 0.012, cities: [{ name: '全省', base: 7746, ...pending2026, note: '甘肃未并轨；计发基数文件属依申请公开' }] },
  { name: '青海', transitionRatio: 0.012, cities: [{ name: '全省', base: 9056, ...pending2026, note: '青人社厅发〔2025〕69号（同文含缴费基数8816与计发基数9056）' }] },
  { name: '宁夏', transitionRatio: 0.012, cities: [{ name: '全区', base: 8366, ...pending2026, note: '宁税发〔2025〕130号；网传"8575"无官方依据' }] },
  { name: '新疆', transitionRatio: 0.012, cities: [{ name: '全区', base: 8744, year: 2026, note: '2025年全口径104926元/年，并轨推定（2026-07-27通知）' }] },

  // === 华南其他 ===
  { name: '广西', transitionRatio: 0.012, cities: [{ name: '全区', base: 6983, ...pending2026, note: '桂人社发〔2025〕43号' }] },
  { name: '海南', transitionRatio: 0.012, cities: [{ name: '全省', base: 8188, ...pending2026, note: '琼人社发〔2025〕67号；已并轨（上限24564=8188×3、下限4912.8=8188×0.6）' }] }
]

/**
 * 数据年度状态文案——单一来源，CityPicker 与 compare 页共用，避免两处措辞漂移。
 * 已公布 → "2026年数据"；预发中 → "2025年数据 · 2026待公布"
 */
export function dataStatusLabel(city: CityData): string {
  if (!city.provisional) return `${city.year}年数据`
  return `${city.year}年数据 · ${city.year + 1}待公布`
}

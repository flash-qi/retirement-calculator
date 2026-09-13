import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { provinces, dataStatusLabel, type ProvinceData, type CityData } from '../../data/cities'
import './index.scss'

export interface SelectedCity {
  provinceName: string
  cityName: string
  base: number
  transitionRatio: number
  year: number
  provisional?: boolean
  note?: string
}

interface Props {
  value: SelectedCity | null
  onChange: (city: SelectedCity) => void
}

function tagClass(city: CityData): string {
  return city.provisional ? 'city-tag pending' : 'city-tag published'
}

export default function CityPicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null)

  const handleSelectCity = (province: ProvinceData, city: CityData) => {
    onChange({
      provinceName: province.name,
      cityName: city.name,
      base: city.base,
      transitionRatio: province.transitionRatio,
      year: city.year,
      provisional: city.provisional,
      note: city.note
    })
    setShow(false)
    setSelectedProvince(null)
  }

  const handleBack = () => setSelectedProvince(null)

  /** 省列表行：只要有一个地市处于预发状态，就显示预发标签，避免高估数据新鲜度 */
  const provinceTag = (prov: ProvinceData) => {
    const pending = prov.cities.find((c) => c.provisional)
    return dataStatusLabel(pending ?? prov.cities[0])
  }

  const selectedCity: CityData | undefined = value
    ? provinces.find((p) => p.name === value.provinceName)?.cities.find((c) => c.name === value.cityName)
    : undefined

  return (
    <View className='city-picker'>
      <View className='picker-display' onClick={() => { setShow(!show); setSelectedProvince(null) }}>
        <View>
          <Text className={value ? '' : 'placeholder'}>
            {value
              ? `${value.provinceName} ${value.cityName}（${value.base.toLocaleString()}元/月）`
              : '请选择省/市'}
          </Text>
          {selectedCity && (
            <Text className={tagClass(selectedCity)}>{dataStatusLabel(selectedCity)}</Text>
          )}
          {value?.note && (
            <Text className='city-note'>{value.note}</Text>
          )}
        </View>
        <Text className='arrow'>{show ? '▲' : '▼'}</Text>
      </View>

      {show && (
        <View className='picker-dropdown'>
          {selectedProvince ? (
            <View>
              <View className='dropdown-header' onClick={handleBack}>
                <Text className='back-arrow'>‹</Text>
                <Text className='dropdown-title'>{selectedProvince.name}</Text>
              </View>
              <ScrollView scrollY className='city-list'>
                {selectedProvince.cities.map((city) => (
                  <View
                    key={city.name}
                    className={`city-item ${
                      value?.cityName === city.name && value?.provinceName === selectedProvince.name
                        ? 'active' : ''
                    }`}
                    onClick={() => handleSelectCity(selectedProvince, city)}
                  >
                    <View className='city-item-main'>
                      <View className='city-item-head'>
                        <Text className='city-name'>{city.name}</Text>
                        <Text className={tagClass(city)}>{dataStatusLabel(city)}</Text>
                      </View>
                      {city.note && <Text className='city-note'>{city.note}</Text>}
                    </View>
                    <Text className='city-base'>{city.base.toLocaleString()}元/月</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <ScrollView scrollY className='city-list'>
              {provinces.map((prov) => (
                <View
                  key={prov.name}
                  className='city-item'
                  onClick={() => setSelectedProvince(prov)}
                >
                  <Text className='city-name'>{prov.name}</Text>
                  <View className='city-item-tail'>
                    <Text className='city-count'>
                      {prov.cities.length > 1
                        ? `${prov.cities.length}个地区`
                        : prov.cities[0]?.base.toLocaleString() + '元/月'}
                    </Text>
                    <Text className={`city-tag ${prov.cities.every((c) => !c.provisional) ? 'published' : 'pending'}`}>
                      {provinceTag(prov)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}

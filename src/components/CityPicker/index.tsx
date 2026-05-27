import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { provinces, type ProvinceData, type CityData } from '../../data/cities'
import './index.scss'

export interface SelectedCity {
  provinceName: string
  cityName: string
  base: number
  transitionRatio: number
  note?: string
}

interface Props {
  value: SelectedCity | null
  onChange: (city: SelectedCity) => void
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
      note: city.note
    })
    setShow(false)
    setSelectedProvince(null)
  }

  const handleBack = () => setSelectedProvince(null)

  return (
    <View className='city-picker'>
      <View className='picker-display' onClick={() => { setShow(!show); setSelectedProvince(null) }}>
        <View>
          <Text className={value ? '' : 'placeholder'}>
            {value
              ? `${value.provinceName} ${value.cityName}（${value.base.toLocaleString()}元/月）`
              : '请选择省/市'}
          </Text>
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
                    <View>
                      <Text className='city-name'>{city.name}</Text>
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
                  <Text className='city-base'>
                    {prov.cities.length > 1 ? `${prov.cities.length}个地区` : prov.cities[0]?.base.toLocaleString() + '元/月'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}

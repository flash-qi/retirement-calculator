import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { provinces, type ProvinceData, type CityData } from '../../data/cities'
import './index.scss'

export interface SelectedCity {
  provinceName: string
  cityName: string
  base: number
  transitionRatio: number
}

interface Props {
  value: SelectedCity | null
  onChange: (city: SelectedCity) => void
}

export default function CityPicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')
  // null = show province list, ProvinceData = show cities of this province
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null)

  const filteredProvinces = search
    ? provinces.filter((p) =>
        p.name.includes(search) ||
        p.cities.some((c) => c.name.includes(search))
      )
    : provinces

  const handleSelectCity = (province: ProvinceData, city: CityData) => {
    onChange({
      provinceName: province.name,
      cityName: city.name,
      base: city.base,
      transitionRatio: province.transitionRatio
    })
    setShow(false)
    setSelectedProvince(null)
    setSearch('')
  }

  const handleBack = () => {
    setSelectedProvince(null)
  }

  const handleOpen = () => {
    setShow(!show)
    setSelectedProvince(null)
    setSearch('')
  }

  return (
    <View className='city-picker'>
      <View className='picker-display' onClick={handleOpen}>
        <Text className={value ? '' : 'placeholder'}>
          {value
            ? `${value.provinceName} ${value.cityName}（${value.base}元/月）`
            : '请选择省/市'}
        </Text>
        <Text className='arrow'>{show ? '▲' : '▼'}</Text>
      </View>

      {show && (
        <View className='picker-dropdown'>
          {selectedProvince ? (
            // 城市列表
            <View>
              <View className='dropdown-header' onClick={handleBack}>
                <Text className='back-arrow'>‹</Text>
                <Text className='dropdown-title'>{selectedProvince.name}</Text>
              </View>
              {selectedProvince.cities.map((city) => (
                <View
                  key={city.name}
                  className={`city-item ${
                    value?.cityName === city.name && value?.provinceName === selectedProvince.name
                      ? 'active' : ''
                  }`}
                  onClick={() => handleSelectCity(selectedProvince, city)}
                >
                  <Text className='city-name'>{city.name}</Text>
                  <Text className='city-base'>{city.base.toLocaleString()}元/月</Text>
                </View>
              ))}
            </View>
          ) : (
            // 省份列表
            <View>
              <Input
                className='search-input'
                placeholder='搜索省份或城市...'
                value={search}
                onInput={(e) => setSearch(e.detail.value)}
              />
              <ScrollView scrollY className='city-list'>
                {filteredProvinces.map((prov) => (
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
            </View>
          )}
        </View>
      )}
    </View>
  )
}

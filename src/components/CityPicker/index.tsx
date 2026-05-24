import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { cities, type CityData } from '../../data/cities'
import './index.scss'

interface Props {
  value: CityData | null
  onChange: (city: CityData) => void
}

export default function CityPicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? cities.filter((c) => c.name.includes(search))
    : cities

  return (
    <View className='city-picker'>
      <View className='picker-display' onClick={() => setShow(!show)}>
        <Text className={value ? '' : 'placeholder'}>
          {value ? `${value.name}（计发基数 ${value.base}元/月）` : '请选择城市'}
        </Text>
        <Text className='arrow'>{show ? '▲' : '▼'}</Text>
      </View>

      {show && (
        <View className='picker-dropdown'>
          <Input
            className='search-input'
            placeholder='搜索城市...'
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
          />
          <ScrollView scrollY className='city-list'>
            {filtered.map((city) => (
              <View
                key={city.name}
                className={`city-item ${value?.name === city.name ? 'active' : ''}`}
                onClick={() => {
                  onChange(city)
                  setShow(false)
                  setSearch('')
                }}
              >
                <Text className='city-name'>{city.name}</Text>
                <Text className='city-base'>{city.base}元/月</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

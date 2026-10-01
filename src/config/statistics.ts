import type { StatisticsCategory, StatisticsPeriod } from '../types'

export const statisticsPeriodOptions: { label: string; value: StatisticsPeriod }[] = [
  { label: '오늘', value: 'TODAY' },
  { label: '최근 7일', value: '7D' },
  { label: '최근 30일', value: '30D' },
  { label: '최근 3개월', value: '3M' },
  { label: '직접 선택', value: 'CUSTOM' },
]

export const statisticsCategoryOptions: { label: string; value: StatisticsCategory }[] = [
  { label: '노트북', value: 'NOTEBOOK' },
  { label: '태블릿', value: 'TABLET' },
  { label: '카메라', value: 'CAMERA' },
  { label: '프로젝터', value: 'PROJECTOR' },
  { label: '회의실', value: 'MEETING_ROOM' },
  { label: '차량', value: 'VEHICLE' },
  { label: '기타', value: 'ETC' },
]

export const statisticsCategoryLabel: Record<StatisticsCategory, string> = {
  NOTEBOOK: '노트북',
  TABLET: '태블릿',
  CAMERA: '카메라',
  PROJECTOR: '프로젝터',
  MEETING_ROOM: '회의실',
  VEHICLE: '차량',
  ETC: '기타',
}

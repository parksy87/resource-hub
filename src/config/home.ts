import type { BadgeTone } from '../components/ui'
import type { ResourceStatus } from '../types'

export const homeStatusMeta: Record<ResourceStatus, { label: string; tone: BadgeTone }> = {
  AVAILABLE: { label: '사용 가능', tone: 'green' },
  RESERVED: { label: '예약됨', tone: 'blue' },
  RENTED: { label: '대여 중', tone: 'purple' },
  INSPECTION: { label: '점검 중', tone: 'yellow' },
  DISPOSED: { label: '폐기', tone: 'neutral' },
}

export const homeCategoryOptions = [
  { label: '전체 카테고리', value: '' },
  { label: 'IT 장비', value: 'IT' },
  { label: '영상 장비', value: 'MEDIA' },
  { label: '사무기기', value: 'OFFICE' },
  { label: '시설', value: 'FACILITY' },
  { label: '차량', value: 'VEHICLE' },
  { label: '기타', value: 'ETC' },
]

export const homeAvailabilityOptions = [
  { label: '전체', value: '' },
  { label: '이용 가능', value: 'true' },
  { label: '이용 불가', value: 'false' },
]

export function formatHomeDate(value: string) {
  return value.slice(0, 10).replaceAll('-', '.')
}

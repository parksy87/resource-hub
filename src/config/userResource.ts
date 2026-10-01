import type { ResourceStatus } from '../types'
import { homeStatusMeta } from './home'

export const userResourcePageSize = 8

export const userResourceGroups = [
  { label: '전체', value: '' },
  { label: '노트북', value: 'NOTEBOOK' },
  { label: '태블릿', value: 'TABLET' },
  { label: '카메라', value: 'CAMERA' },
  { label: '프로젝터', value: 'PROJECTOR' },
  { label: '회의실', value: 'MEETING_ROOM' },
  { label: '차량', value: 'VEHICLE' },
  { label: '기타', value: 'ETC' },
]

export const userResourceStatuses = [
  { label: '전체', value: '' },
  { label: '사용 가능', value: 'AVAILABLE' },
  { label: '예약됨', value: 'RESERVED' },
  { label: '대여 중', value: 'RENTED' },
  { label: '점검 중', value: 'INSPECTION' },
]

export const userResourceSorts = [
  { label: '최신 등록순', value: 'latest' },
  { label: '이름순', value: 'name' },
  { label: '이용 횟수순', value: 'usage' },
  { label: '이용 가능 우선', value: 'available' },
]

export const reserveBlockedReason: Record<ResourceStatus, string> = {
  AVAILABLE: '',
  RESERVED: '이미 예약된 자원으로 예약할 수 없습니다.',
  RENTED: '현재 대여 중인 자원으로 예약할 수 없습니다.',
  INSPECTION: '현재 점검 중인 자원으로 예약할 수 없습니다.',
  DISPOSED: '운영이 종료된 자원으로 예약할 수 없습니다.',
}

export function userStatusMeta(status: ResourceStatus) {
  return homeStatusMeta[status]
}

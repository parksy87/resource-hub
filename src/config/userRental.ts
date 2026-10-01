import type { RentalHistoryAction } from '../types'

export const rentalHistoryPageSize = 5

export const rentalHistorySorts = [
  { label: '최신 대여순', value: 'latest' },
  { label: '반납 예정일 빠른순', value: 'soon' },
  { label: '반납 예정일 늦은순', value: 'late' },
] as const

export const rentalHistoryTabs = [
  { id: 'ALL', label: '전체' },
  { id: 'REQUESTED', label: '대여 신청' },
  { id: 'RENTED', label: '대여 중' },
  { id: 'RETURN_REQUESTED', label: '반납 신청' },
  { id: 'RETURNED', label: '반납 완료' },
  { id: 'OVERDUE', label: '연체' },
] as const

export const rentalProcessLabel: Record<RentalHistoryAction, string> = {
  REQUESTED: '대여 신청',
  PROCESSED: '대여 승인',
  STARTED: '대여 시작',
  RETURN_REQUESTED: '반납 신청',
  RETURNED: '반납 완료',
  STATUS_CHANGED: '연체',
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const reservationToday = formatLocalDate(new Date())

export const reservationTimeOptions = Array.from({ length: 10 }, (_, index) => {
  const hour = String(index + 9).padStart(2, '0')
  return { label: `${hour}:00`, value: `${hour}:00` }
})

export const reservationSteps = [
  { id: 1, label: '예약 자원' },
  { id: 2, label: '예약 일정' },
  { id: 3, label: '예약 정보' },
  { id: 4, label: '이용 목적' },
  { id: 5, label: '내용 확인' },
  { id: 6, label: '예약 신청' },
]

export const availabilityLabel = {
  available: '예약 가능',
  unavailable: '예약 불가',
  pending: '확인 필요',
} as const

export const reservationHistoryPageSize = 5

export const reservationHistorySorts = [
  { label: '최신 예약순', value: 'latest' },
  { label: '이용일 빠른순', value: 'soon' },
  { label: '이용일 늦은순', value: 'late' },
] as const

export const reservationHistoryTabs = [
  { id: 'ALL', label: '전체' },
  { id: 'PENDING', label: '신청' },
  { id: 'APPROVED', label: '승인' },
  { id: 'REJECTED', label: '반려' },
  { id: 'CANCELLED', label: '취소' },
  { id: 'COMPLETED', label: '이용완료' },
] as const

export const reservationProcessLabel = {
  APPLIED: '예약 신청',
  APPROVED: '관리자 승인',
  REJECTED: '예약 반려',
  CANCELLED: '예약 취소',
  COMPLETED: '이용 완료',
} as const

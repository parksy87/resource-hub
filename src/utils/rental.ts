import type { Rental, RentalStatus } from '../types'

/**
 * 실제 대여가 시작된 건 중 반납 예정일을 넘기고 반납일이 없으면 연체로 계산합니다.
 * 대여 신청 상태는 아직 인계되지 않았으므로 연체로 바꾸지 않습니다.
 */
export function getRentalDisplayStatus(
  rental: Pick<Rental, 'status' | 'dueAt' | 'returnedAt'>,
  now = new Date(),
): RentalStatus {
  if (rental.status === 'RETURNED' || rental.returnedAt) return 'RETURNED'
  const isActiveLoan = rental.status === 'RENTED' || rental.status === 'RETURN_REQUESTED'
  if (isActiveLoan && now.getTime() > new Date(rental.dueAt).getTime()) return 'OVERDUE'
  return rental.status
}

export function canProcessRental(status: RentalStatus) {
  return status === 'REQUESTED'
}

export function canProcessReturn(status: RentalStatus) {
  return status === 'RENTED' || status === 'RETURN_REQUESTED' || status === 'OVERDUE'
}

/** 사용자 화면은 대여 중이고 반납일이 없을 때만 연체로 보여 줍니다. */
export function getUserRentalDisplayStatus(
  rental: Pick<Rental, 'status' | 'dueAt' | 'returnedAt'>,
  now = new Date(),
): RentalStatus {
  if (rental.status === 'RETURNED' || rental.returnedAt) return 'RETURNED'
  if (rental.status === 'RENTED' && now.getTime() > new Date(rental.dueAt).getTime()) return 'OVERDUE'
  return rental.status
}

export function overdueDayCount(dueAt: string, today = seoulToday()) {
  const due = dueAt.slice(0, 10)
  if (due >= today) return 0
  const day = 24 * 60 * 60 * 1000
  const start = new Date(`${due}T00:00:00+09:00`).getTime()
  const end = new Date(`${today}T00:00:00+09:00`).getTime()
  return Math.max(0, Math.round((end - start) / day))
}

export function canRequestReturn(status: RentalStatus) {
  return status === 'RENTED' || status === 'OVERDUE'
}

function seoulToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

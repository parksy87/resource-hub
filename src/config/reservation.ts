import type { BadgeTone } from '../components/ui'
import type { ReservationStatus } from '../types'

export const reservationStatusMeta: Record<
  ReservationStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  PENDING: { label: '신청', tone: 'yellow', description: '관리자 검토를 기다리고 있습니다.' },
  APPROVED: { label: '승인', tone: 'blue', description: '이용이 승인된 예약입니다.' },
  REJECTED: { label: '반려', tone: 'red', description: '관리자 검토 후 반려된 예약입니다.' },
  CANCELLED: { label: '취소', tone: 'neutral', description: '취소 처리된 예약입니다.' },
  COMPLETED: { label: '이용완료', tone: 'green', description: '자원 이용이 완료되었습니다.' },
}

import type { BadgeTone } from '../components/ui'
import type { RentalStatus, ReturnCondition } from '../types'

export const rentalStatusMeta: Record<
  RentalStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  REQUESTED: { label: '대여 신청', tone: 'yellow', description: '관리자의 대여 처리를 기다리고 있습니다.' },
  RENTED: { label: '대여 중', tone: 'blue', description: '대여 중입니다.' },
  RETURN_REQUESTED: { label: '반납 신청', tone: 'purple', description: '관리자 확인 대기 중입니다.' },
  RETURNED: { label: '반납 완료', tone: 'green', description: '반납 처리가 완료되었습니다.' },
  OVERDUE: { label: '연체', tone: 'red', description: '반납 예정일이 지났지만 아직 반납되지 않았습니다.' },
}

export const returnConditionMeta: Record<ReturnCondition, { label: string; tone: BadgeTone }> = {
  NORMAL: { label: '정상 반납', tone: 'green' },
  PARTIAL: { label: '일부 반납', tone: 'yellow' },
  DAMAGED: { label: '파손', tone: 'red' },
  LOST: { label: '분실', tone: 'neutral' },
}

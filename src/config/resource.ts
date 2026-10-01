import type { BadgeTone } from '../components/ui'
import type { ResourceStatus } from '../types'

export const resourceStatusMeta: Record<
  ResourceStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  AVAILABLE: { label: '사용 가능', tone: 'green', description: '예약과 대여가 가능한 상태입니다.' },
  RESERVED: { label: '예약됨', tone: 'blue', description: '승인된 예약 일정이 있습니다.' },
  RENTED: { label: '대여 중', tone: 'purple', description: '현재 사용자가 대여 중입니다.' },
  INSPECTION: { label: '점검 중', tone: 'yellow', description: '점검 완료 후 이용할 수 있습니다.' },
  DISPOSED: { label: '폐기', tone: 'neutral', description: '운영이 종료된 자원입니다.' },
}

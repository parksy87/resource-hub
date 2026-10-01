import type { BadgeTone } from '../components/ui'
import type { InspectionResult, InspectionStatus, InspectionType } from '../types'

export const inspectionStatusMeta: Record<
  InspectionStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  SCHEDULED: { label: '점검 예정', tone: 'yellow', description: '예정된 일정에 점검을 진행하면 됩니다.' },
  IN_PROGRESS: { label: '점검 중', tone: 'blue', description: '점검이 진행 중이며 자원은 점검 중으로 연계됩니다.' },
  COMPLETED: { label: '점검 완료', tone: 'green', description: '점검 결과와 조치 내용이 기록되었습니다.' },
  REINSPECTION_REQUIRED: { label: '재점검 필요', tone: 'red', description: '후속 점검이 필요한 상태입니다.' },
}

export const inspectionTypeMeta: Record<InspectionType, { label: string; description: string }> = {
  PERIODIC: { label: '정기점검', description: '계획된 주기에 따라 진행하는 점검입니다.' },
  RETURN: { label: '반납점검', description: '대여 자원이 반납된 뒤 진행하는 점검입니다.' },
  ADHOC: { label: '수시점검', description: '필요에 따라 진행하는 점검입니다.' },
  INCIDENT: { label: '장애점검', description: '이상이나 장애 접수 후 진행하는 점검입니다.' },
}

export const inspectionResultMeta: Record<
  InspectionResult,
  { label: string; tone: BadgeTone; description: string }
> = {
  NORMAL: { label: '이상 없음', tone: 'green', description: '자원 상태에 문제가 없습니다.' },
  MINOR: { label: '경미한 이상', tone: 'yellow', description: '사용에는 큰 지장이 없는 경미한 이상입니다.' },
  REPAIR: { label: '수리 필요', tone: 'red', description: '수리 후 다시 사용할 수 있습니다.' },
  DISPOSAL_REVIEW: { label: '폐기 검토', tone: 'neutral', description: '향후 폐기 처리로 연결할 수 있습니다.' },
}

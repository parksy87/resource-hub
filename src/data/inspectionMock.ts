import { resourceManagers } from './resourceMock'
import type { Inspection, InspectionResult, InspectionStatus, InspectionType } from '../types'
import type { InspectionHistory } from '../types'

interface InspectionSeed {
  id: number
  number: string
  resourceId: number
  type: InspectionType
  status: InspectionStatus
  scheduledDate: string
  inspectorId: number
  createdAt: string
  rentalId?: number
  parentInspectionId?: number
  inspectedDate?: string
  result?: InspectionResult
  content?: string
  issueDescription?: string
  actionDescription?: string
  note?: string
}

function inspection(seed: InspectionSeed): Inspection {
  const closed = seed.status === 'COMPLETED' || seed.status === 'REINSPECTION_REQUIRED'
  return {
    id: seed.id,
    inspectionNumber: seed.number,
    resourceId: seed.resourceId,
    rentalId: seed.rentalId ?? null,
    parentInspectionId: seed.parentInspectionId ?? null,
    type: seed.type,
    status: seed.status,
    scheduledDate: seed.scheduledDate,
    inspectedDate: closed ? seed.inspectedDate ?? seed.scheduledDate : null,
    inspectorId: seed.inspectorId,
    processorId: closed ? 1 : null,
    result: closed ? seed.result ?? null : null,
    content: seed.content ?? null,
    issueDescription: closed ? seed.issueDescription ?? null : null,
    actionDescription: closed ? seed.actionDescription ?? null : null,
    note: seed.note ?? null,
    createdAt: `${seed.createdAt}+09:00`,
    updatedAt: closed && seed.inspectedDate ? `${seed.inspectedDate}T18:00:00+09:00` : `${seed.createdAt}+09:00`,
  }
}

export const inspectionsMock: Inspection[] = [
  inspection({ id: 512, number: 'INS-260930-012', resourceId: 248, type: 'PERIODIC', status: 'SCHEDULED', scheduledDate: '2026-10-07', inspectorId: 1, createdAt: '2026-09-30T09:20:00', content: '3분기 노트북 정기점검입니다.' }),
  inspection({ id: 511, number: 'INS-260930-011', resourceId: 235, type: 'PERIODIC', status: 'SCHEDULED', scheduledDate: '2026-10-03', inspectorId: 3, createdAt: '2026-09-30T08:40:00', parentInspectionId: 505, content: '용지 걸림 조치 후 재점검합니다.', note: '상위 점검 INS-260924-008 결과를 확인합니다.' }),
  inspection({ id: 510, number: 'INS-260929-010', resourceId: 246, type: 'INCIDENT', status: 'IN_PROGRESS', scheduledDate: '2026-09-29', inspectorId: 3, createdAt: '2026-09-29T14:10:00', content: '시동 불량 신고에 따른 장애점검입니다.' }),
  inspection({ id: 509, number: 'INS-260929-009', resourceId: 241, type: 'ADHOC', status: 'IN_PROGRESS', scheduledDate: '2026-09-30', inspectorId: 2, createdAt: '2026-09-29T11:00:00', content: '렌즈 마운트와 셔터를 수시점검합니다.' }),
  inspection({ id: 508, number: 'INS-260928-008', resourceId: 239, type: 'RETURN', status: 'COMPLETED', scheduledDate: '2026-09-28', inspectedDate: '2026-09-28', inspectorId: 1, result: 'NORMAL', rentalId: 406, createdAt: '2026-09-28T16:50:00', content: '반납된 모니터 외관과 전원을 확인했습니다.', actionDescription: '이상 없어 보관 위치로 이동했습니다.' }),
  inspection({ id: 507, number: 'INS-260926-007', resourceId: 237, type: 'RETURN', status: 'SCHEDULED', scheduledDate: '2026-10-02', inspectorId: 1, rentalId: 409, createdAt: '2026-09-26T18:00:00', content: '일부 반납된 노트북의 잔여 수량을 확인합니다.' }),
  inspection({ id: 506, number: 'INS-260925-006', resourceId: 240, type: 'RETURN', status: 'COMPLETED', scheduledDate: '2026-09-25', inspectedDate: '2026-09-25', inspectorId: 2, result: 'REPAIR', rentalId: 408, createdAt: '2026-09-25T15:30:00', content: '반납 시 파손이 접수된 프로젝터를 점검했습니다.', issueDescription: '전원 케이블 커넥터가 파손되었습니다.', actionDescription: '수리 업체로 인계하고 대체 장비를 안내했습니다.', note: '수리 완료 후 재점검이 필요합니다.' }),
  inspection({ id: 505, number: 'INS-260924-005', resourceId: 235, type: 'PERIODIC', status: 'COMPLETED', scheduledDate: '2026-09-20', inspectedDate: '2026-09-24', inspectorId: 3, result: 'MINOR', createdAt: '2026-09-18T10:00:00', content: '복합기 정기점검입니다.', issueDescription: '용지 걸림이 간헐적으로 발생합니다.', actionDescription: '급지 롤러를 청소했습니다.' }),
  inspection({ id: 504, number: 'INS-260922-004', resourceId: 233, type: 'INCIDENT', status: 'REINSPECTION_REQUIRED', scheduledDate: '2026-09-22', inspectedDate: '2026-09-27', inspectorId: 2, result: 'REPAIR', rentalId: 410, createdAt: '2026-09-22T09:30:00', content: '분실 접수된 카메라의 잔여 구성품을 확인했습니다.', issueDescription: '본체 분실로 구성품만 남아 있습니다.', actionDescription: '잔여 구성품을 보관하고 재점검을 요청했습니다.' }),
  inspection({ id: 503, number: 'INS-260918-003', resourceId: 234, type: 'ADHOC', status: 'COMPLETED', scheduledDate: '2026-09-18', inspectedDate: '2026-09-18', inspectorId: 1, result: 'DISPOSAL_REVIEW', createdAt: '2026-09-16T13:20:00', content: '노후 태블릿 상태 점검입니다.', issueDescription: '배터리 팽창과 화면 얼룩이 확인되었습니다.', actionDescription: '사용을 중단하고 폐기 검토 대상으로 분류했습니다.', note: '폐기 처리 대기 중입니다.' }),
  inspection({ id: 502, number: 'INS-260917-002', resourceId: 236, type: 'PERIODIC', status: 'SCHEDULED', scheduledDate: '2026-10-15', inspectorId: 2, createdAt: '2026-09-17T09:00:00', content: '음향 장비 정기점검 일정입니다.' }),
  inspection({ id: 501, number: 'INS-260916-001', resourceId: 244, type: 'RETURN', status: 'COMPLETED', scheduledDate: '2026-09-24', inspectedDate: '2026-09-24', inspectorId: 3, result: 'NORMAL', rentalId: 407, createdAt: '2026-09-16T11:10:00', content: '반납된 복합기 출력 상태를 확인했습니다.', actionDescription: '테스트 출력 후 사용 가능으로 판단했습니다.' }),
]

function inspectorName(id: number) {
  return resourceManagers.find((manager) => manager.id === id)?.name ?? '담당자'
}

export const inspectionEventsMock: InspectionHistory[] = inspectionsMock.flatMap((item) => {
  const events: InspectionHistory[] = [
    {
      id: item.id * 10,
      inspectionId: item.id,
      action: 'CREATED',
      title: item.parentInspectionId ? '재점검 등록' : '점검 등록',
      description: item.content,
      actorName: '김관리',
      occurredAt: item.createdAt,
    },
  ]
  if (item.status === 'IN_PROGRESS') {
    events.push({
      id: item.id * 10 + 1,
      inspectionId: item.id,
      action: 'STATUS_CHANGED',
      title: '점검 중',
      description: '점검을 시작했습니다.',
      actorName: inspectorName(item.inspectorId),
      occurredAt: item.updatedAt,
    })
  }
  if (item.inspectedDate) {
    events.push({
      id: item.id * 10 + 2,
      inspectionId: item.id,
      action: 'COMPLETED',
      title: '점검 완료',
      description: item.actionDescription ?? item.issueDescription,
      actorName: '김관리',
      occurredAt: `${item.inspectedDate}T18:00:00+09:00`,
    })
  }
  if (item.status === 'REINSPECTION_REQUIRED') {
    events.push({
      id: item.id * 10 + 3,
      inspectionId: item.id,
      action: 'STATUS_CHANGED',
      title: '재점검 필요',
      description: '재점검이 필요합니다.',
      actorName: '김관리',
      occurredAt: item.updatedAt,
    })
  }
  return events
})

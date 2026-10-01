import type {
  Reservation,
  ReservationStatus,
  ReservationUserSnapshot,
} from '../types'

/** 예약 CRUD 원본은 Firestore(`reservationService`). 대여 mock 등 레거시 참조용. */

export const reservationUsers: ReservationUserSnapshot[] = [
  { id: 101, name: '홍길동', email: 'gildong.hong@resource.co.kr', phone: '010-4821-7310', organization: '브랜드전략팀' },
  { id: 102, name: '김민수', email: 'minsu.kim@resource.co.kr', phone: '010-2914-6208', organization: '서비스기획팀' },
  { id: 103, name: '이지은', email: 'jieun.lee@resource.co.kr', phone: '010-8652-1147', organization: '콘텐츠제작팀' },
  { id: 104, name: '박서준', email: 'seojun.park@resource.co.kr', phone: '010-7431-5206', organization: '제품개발팀' },
  { id: 105, name: '최유진', email: 'yujin.choi@resource.co.kr', phone: '010-3378-9042', organization: '영업지원팀' },
  { id: 106, name: '한지민', email: 'jimin.han@resource.co.kr', phone: '010-6182-4409', organization: '경영지원팀' },
  { id: 107, name: '한지민', email: 'jimin.han@resource.co.kr', phone: '010-9504-2871', organization: 'IT운영팀' },
  { id: 108, name: '윤서아', email: 'seoa.yoon@resource.co.kr', phone: '010-2247-6651', organization: '인사팀' },
]

interface ReservationSeed {
  id: number
  number: string
  userId: number
  resourceId: number
  start: string
  end: string
  status: ReservationStatus
  created: string
  quantity?: number
  purpose?: string
  place?: string
  reason?: string
  reviewerId?: number
}

function reservation(seed: ReservationSeed): Reservation {
  const processed = seed.status !== 'PENDING'
  const cancelled = seed.status === 'CANCELLED'

  return {
    id: seed.id,
    reservationNumber: seed.number,
    resourceId: seed.resourceId,
    userId: seed.userId,
    startAt: `${seed.start}:00+09:00`,
    endAt: `${seed.end}:00+09:00`,
    quantity: seed.quantity ?? 1,
    purpose: seed.purpose ?? '프로젝트 업무 수행을 위한 공용 자원 이용',
    requestNote: '이용 전 장비 구성품 확인을 요청드립니다.',
    usageLocation: seed.place ?? null,
    status: seed.status,
    reviewedBy: seed.reviewerId ?? (processed ? 1 : null),
    reviewedAt: processed && !cancelled ? '2026-09-30T18:10:00+09:00' : null,
    rejectionReason: seed.status === 'REJECTED' ? seed.reason ?? '동일 기간에 승인된 예약이 있습니다.' : null,
    cancelledAt: cancelled ? '2026-09-30T18:30:00+09:00' : null,
    cancellationReason: cancelled ? seed.reason ?? '사용 일정이 변경되었습니다.' : null,
    processedAt: processed ? '2026-09-30T18:30:00+09:00' : null,
    createdAt: `${seed.created}+09:00`,
    updatedAt: processed ? '2026-09-30T18:30:00+09:00' : `${seed.created}+09:00`,
  }
}

export const reservationsMock: Reservation[] = [
  reservation({ id: 1058, number: 'RSV-260930-024', userId: 102, resourceId: 248, start: '2026-10-12T09:00', end: '2026-10-13T18:00', status: 'PENDING', created: '2026-09-30T18:20:00', quantity: 2, purpose: '고객 인터뷰 정리', place: '본관 3층 회의실' }),
  reservation({ id: 1052, number: 'RSV-260930-018', userId: 101, resourceId: 248, start: '2026-10-02T09:00', end: '2026-10-04T18:00', status: 'PENDING', created: '2026-09-30T17:42:00', quantity: 2, purpose: '신규 서비스 UX 워크숍 진행' }),
  reservation({ id: 1051, number: 'RSV-260930-017', userId: 102, resourceId: 245, start: '2026-10-01T13:00', end: '2026-10-01T17:00', status: 'APPROVED', created: '2026-09-30T16:18:00', purpose: '분기 서비스 기획 회의', place: '별관 2층' }),
  reservation({ id: 1050, number: 'RSV-260930-016', userId: 103, resourceId: 241, start: '2026-10-06T09:00', end: '2026-10-08T18:00', status: 'APPROVED', created: '2026-09-30T14:26:00', purpose: '브랜드 캠페인 영상 촬영' }),
  reservation({ id: 1049, number: 'RSV-260930-015', userId: 104, resourceId: 234, start: '2026-10-03T09:00', end: '2026-10-05T18:00', status: 'REJECTED', created: '2026-09-30T13:05:00', reason: '요청 수량을 확보할 수 없습니다.' }),
  reservation({ id: 1048, number: 'RSV-260930-014', userId: 105, resourceId: 246, start: '2026-10-10T08:00', end: '2026-10-10T19:00', status: 'CANCELLED', created: '2026-09-30T11:48:00', reason: '외부 미팅 일정이 취소되었습니다.' }),
  reservation({ id: 1047, number: 'RSV-260930-013', userId: 106, resourceId: 240, start: '2026-09-29T10:00', end: '2026-09-30T16:00', status: 'COMPLETED', created: '2026-09-28T09:34:00', purpose: '전사 교육 자료 상영' }),
  reservation({ id: 1046, number: 'RSV-260929-012', userId: 107, resourceId: 242, start: '2026-10-07T09:00', end: '2026-10-09T18:00', status: 'PENDING', created: '2026-09-29T16:22:00', quantity: 3 }),
  reservation({ id: 1045, number: 'RSV-260929-011', userId: 108, resourceId: 238, start: '2026-10-02T14:00', end: '2026-10-02T17:00', status: 'PENDING', created: '2026-09-29T15:10:00', purpose: '신입사원 온보딩 세션' }),
  reservation({ id: 1044, number: 'RSV-260929-010', userId: 101, resourceId: 236, start: '2026-10-11T09:00', end: '2026-10-11T18:00', status: 'APPROVED', created: '2026-09-29T13:14:00', quantity: 2 }),
  reservation({ id: 1043, number: 'RSV-260929-009', userId: 103, resourceId: 247, start: '2026-10-13T09:00', end: '2026-10-14T18:00', status: 'APPROVED', created: '2026-09-29T11:08:00' }),
  reservation({ id: 1042, number: 'RSV-260928-008', userId: 105, resourceId: 233, start: '2026-10-15T09:00', end: '2026-10-17T17:00', status: 'CANCELLED', created: '2026-09-28T17:31:00', reason: '촬영 장비 구성이 변경되었습니다.' }),
  reservation({ id: 1041, number: 'RSV-260928-007', userId: 104, resourceId: 239, start: '2026-09-26T09:00', end: '2026-09-28T18:00', status: 'COMPLETED', created: '2026-09-25T10:42:00', quantity: 2 }),
  reservation({ id: 1040, number: 'RSV-260927-006', userId: 102, resourceId: 237, start: '2026-10-20T09:00', end: '2026-10-24T18:00', status: 'REJECTED', created: '2026-09-27T14:18:00', reason: '최대 대여 가능 기간을 초과했습니다.', place: '본관 3층' }),
  reservation({ id: 1039, number: 'RSV-260927-005', userId: 108, resourceId: 244, start: '2026-10-01T09:00', end: '2026-10-01T12:00', status: 'APPROVED', created: '2026-09-27T09:55:00', purpose: '채용 안내 자료 출력' }),
  reservation({ id: 1038, number: 'RSV-260929-025', userId: 102, resourceId: 242, start: '2026-10-16T10:00', end: '2026-10-16T16:00', status: 'PENDING', created: '2026-09-29T11:05:00', purpose: '외근용 노트북 대여', place: '본관 3층' }),
  reservation({ id: 1037, number: 'RSV-260928-026', userId: 102, resourceId: 236, start: '2026-10-11T09:00', end: '2026-10-11T12:00', status: 'APPROVED', created: '2026-09-28T15:40:00', quantity: 4, purpose: '기획 리뷰 회의', place: '별관 2층' }),
  reservation({ id: 1036, number: 'RSV-260926-027', userId: 102, resourceId: 247, start: '2026-10-08T09:00', end: '2026-10-08T18:00', status: 'CANCELLED', created: '2026-09-26T10:12:00', purpose: '현장 촬영', place: '미디어실', reason: '촬영 일정이 변경되었습니다.', reviewerId: 102 }),
  reservation({ id: 1035, number: 'RSV-260920-028', userId: 102, resourceId: 240, start: '2026-09-25T10:00', end: '2026-09-25T16:00', status: 'COMPLETED', created: '2026-09-20T09:30:00', purpose: '교육 자료 상영', place: '컨퍼런스룸 A' }),
  reservation({ id: 1034, number: 'RSV-260918-029', userId: 102, resourceId: 239, start: '2026-09-22T09:00', end: '2026-09-22T18:00', status: 'COMPLETED', created: '2026-09-18T13:15:00', purpose: '디자인 검수', place: '본관 2층' }),
]

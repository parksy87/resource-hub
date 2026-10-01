import type { Rental, RentalStatus, ReturnCondition } from '../types'

interface RentalSeed {
  id: number
  number: string
  reservationId: number
  resourceId: number
  userId: number
  quantity: number
  requestedAt: string
  dueAt: string
  status: Exclude<RentalStatus, 'OVERDUE'>
  rentedAt?: string
  returnedAt?: string
  returnedQuantity?: number
  returnStatus?: ReturnCondition
  checkoutNote?: string
  returnNote?: string
  returnRequestedAt?: string
}

function rental(seed: RentalSeed): Rental {
  const processed = seed.status !== 'REQUESTED'
  const returned = seed.status === 'RETURNED'

  return {
    id: seed.id,
    rentalNumber: seed.number,
    reservationId: seed.reservationId,
    resourceId: seed.resourceId,
    userId: seed.userId,
    quantity: seed.quantity,
    requestedAt: `${seed.requestedAt}+09:00`,
    rentedAt: seed.rentedAt ? `${seed.rentedAt}+09:00` : null,
    dueAt: `${seed.dueAt}+09:00`,
    returnedAt: returned && seed.returnedAt ? `${seed.returnedAt}+09:00` : null,
    returnedQuantity: returned ? seed.returnedQuantity ?? seed.quantity : null,
    status: seed.status,
    processedBy: processed ? 1 : null,
    rentalProcessedAt: processed && seed.rentedAt ? `${seed.rentedAt}+09:00` : null,
    checkoutNote: seed.checkoutNote ?? (processed ? '구성품 확인 후 인계했습니다.' : null),
    returnProcessedBy: returned ? 1 : null,
    returnProcessedAt: returned && seed.returnedAt ? `${seed.returnedAt}+09:00` : null,
    returnRequestedAt: seed.returnRequestedAt
      ? `${seed.returnRequestedAt}+09:00`
      : seed.status === 'RETURN_REQUESTED'
        ? `${seed.rentedAt ?? seed.requestedAt}+09:00`
        : null,
    returnStatus: returned ? seed.returnStatus ?? 'NORMAL' : null,
    returnNote: returned ? seed.returnNote ?? '이상 없이 반납되었습니다.' : null,
    createdAt: `${seed.requestedAt}+09:00`,
    updatedAt: `${seed.returnedAt ?? seed.rentedAt ?? seed.requestedAt}+09:00`,
  }
}

export const rentalsMock: Rental[] = [
  rental({ id: 401, number: 'RNT-260930-018', reservationId: 1051, resourceId: 245, userId: 102, quantity: 1, requestedAt: '2026-09-30T18:20:00', dueAt: '2026-10-01T17:00:00', status: 'REQUESTED' }),
  rental({ id: 402, number: 'RNT-260930-016', reservationId: 1050, resourceId: 241, userId: 103, quantity: 1, requestedAt: '2026-09-30T15:00:00', rentedAt: '2026-09-30T15:20:00', dueAt: '2026-10-08T18:00:00', status: 'RENTED', checkoutNote: '배터리와 렌즈 2종을 함께 인계했습니다.' }),
  rental({ id: 403, number: 'RNT-260929-012', reservationId: 1046, resourceId: 242, userId: 107, quantity: 3, requestedAt: '2026-09-29T16:40:00', dueAt: '2026-10-09T18:00:00', status: 'REQUESTED' }),
  rental({ id: 404, number: 'RNT-260929-010', reservationId: 1044, resourceId: 236, userId: 101, quantity: 2, requestedAt: '2026-09-29T13:30:00', rentedAt: '2026-09-29T14:00:00', dueAt: '2026-10-11T18:00:00', status: 'RETURN_REQUESTED' }),
  rental({ id: 405, number: 'RNT-260927-009', reservationId: 1043, resourceId: 247, userId: 103, quantity: 1, requestedAt: '2026-09-27T11:20:00', rentedAt: '2026-09-27T13:00:00', dueAt: '2026-09-29T18:00:00', status: 'RENTED', checkoutNote: '촬영용 짐벌 포함' }),
  rental({ id: 406, number: 'RNT-260926-007', reservationId: 1041, resourceId: 239, userId: 104, quantity: 2, requestedAt: '2026-09-25T11:00:00', rentedAt: '2026-09-26T09:00:00', dueAt: '2026-09-28T18:00:00', returnedAt: '2026-09-28T16:40:00', status: 'RETURNED', returnStatus: 'NORMAL' }),
  rental({ id: 407, number: 'RNT-260924-006', reservationId: 1039, resourceId: 244, userId: 108, quantity: 1, requestedAt: '2026-09-24T10:10:00', rentedAt: '2026-09-24T10:30:00', dueAt: '2026-09-24T18:00:00', returnedAt: '2026-09-24T17:20:00', status: 'RETURNED', returnStatus: 'NORMAL', returnNote: '출력 작업을 마치고 정상 반납했습니다.' }),
  rental({ id: 408, number: 'RNT-260923-005', reservationId: 1047, resourceId: 240, userId: 106, quantity: 1, requestedAt: '2026-09-23T09:40:00', rentedAt: '2026-09-23T10:00:00', dueAt: '2026-09-25T16:00:00', returnedAt: '2026-09-25T15:10:00', status: 'RETURNED', returnStatus: 'DAMAGED', returnNote: '전원 케이블 커넥터 파손이 확인되었습니다.' }),
  rental({ id: 409, number: 'RNT-260922-004', reservationId: 1040, resourceId: 237, userId: 102, quantity: 2, requestedAt: '2026-09-22T14:30:00', rentedAt: '2026-09-22T15:00:00', dueAt: '2026-09-26T18:00:00', returnedAt: '2026-09-26T17:30:00', status: 'RETURNED', returnedQuantity: 1, returnStatus: 'PARTIAL', returnNote: '1대는 반납되었고 나머지 1대는 추가 확인이 필요합니다.' }),
  rental({ id: 410, number: 'RNT-260920-003', reservationId: 1042, resourceId: 233, userId: 105, quantity: 1, requestedAt: '2026-09-20T11:00:00', rentedAt: '2026-09-20T11:30:00', dueAt: '2026-09-23T17:00:00', returnedAt: '2026-09-27T10:00:00', status: 'RETURNED', returnedQuantity: 0, returnStatus: 'LOST', returnNote: '현장 확인 결과 장비를 분실한 것으로 접수되었습니다.' }),
  rental({ id: 411, number: 'RNT-260918-002', reservationId: 1045, resourceId: 238, userId: 108, quantity: 1, requestedAt: '2026-09-18T15:20:00', rentedAt: '2026-09-18T16:00:00', dueAt: '2026-09-28T17:00:00', status: 'RETURN_REQUESTED', checkoutNote: '회의실 키와 이용 안내문을 전달했습니다.' }),
  rental({ id: 412, number: 'RNT-260917-001', reservationId: 1048, resourceId: 246, userId: 105, quantity: 1, requestedAt: '2026-09-17T09:10:00', dueAt: '2026-09-19T19:00:00', status: 'REQUESTED' }),
  rental({ id: 413, number: 'RNT-260928-019', reservationId: 1037, resourceId: 236, userId: 102, quantity: 1, requestedAt: '2026-09-28T16:00:00', rentedAt: '2026-09-28T16:30:00', dueAt: '2026-10-11T18:00:00', status: 'RENTED', checkoutNote: '수신기와 송신기를 함께 인계했습니다.' }),
  rental({ id: 414, number: 'RNT-260925-020', reservationId: 1035, resourceId: 240, userId: 102, quantity: 1, requestedAt: '2026-09-20T10:00:00', rentedAt: '2026-09-20T10:40:00', dueAt: '2026-09-28T18:00:00', status: 'RENTED', checkoutNote: '프로젝터와 리모컨을 인계했습니다.' }),
  rental({ id: 415, number: 'RNT-260929-021', reservationId: 1038, resourceId: 242, userId: 102, quantity: 1, requestedAt: '2026-09-29T11:30:00', rentedAt: '2026-09-29T12:00:00', dueAt: '2026-10-16T18:00:00', status: 'RETURN_REQUESTED', returnRequestedAt: '2026-09-30T09:20:00', returnNote: '외근을 마치고 노트북을 반납하려고 합니다.' }),
  rental({ id: 416, number: 'RNT-260922-022', reservationId: 1034, resourceId: 239, userId: 102, quantity: 1, requestedAt: '2026-09-18T14:00:00', rentedAt: '2026-09-18T15:00:00', dueAt: '2026-09-22T18:00:00', returnedAt: '2026-09-22T17:10:00', status: 'RETURNED', returnStatus: 'NORMAL', returnNote: '모니터를 정상 반납했습니다.' }),
  rental({ id: 417, number: 'RNT-260930-023', reservationId: 1058, resourceId: 248, userId: 102, quantity: 1, requestedAt: '2026-09-30T18:40:00', dueAt: '2026-10-13T18:00:00', status: 'REQUESTED' }),
  rental({ id: 418, number: 'RNT-260926-024', reservationId: 1036, resourceId: 247, userId: 102, quantity: 1, requestedAt: '2026-09-26T11:00:00', rentedAt: '2026-09-26T11:40:00', dueAt: '2026-10-20T18:00:00', status: 'RENTED', checkoutNote: '카메라 본체와 배터리를 인계했습니다.' }),
]

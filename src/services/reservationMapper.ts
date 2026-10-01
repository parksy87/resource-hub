import { resourceCategories, resourceTypes } from '../data/resourceMock'
import { reservationUsers } from '../data/reservationMock'
import { resourcesMock } from '../data/resourceMock'
import type {
  Reservation,
  ReservationDetail,
  ReservationHistory,
  ReservationListItem,
} from '../types'
import { resourceService } from './resourceService'

export interface ReservationDenormalized {
  userName: string
  userEmail: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: number
  resourceCategoryName: string
}

const defaultProcessorName = '관리자'

export function denormalizedFromFirestore(data: Record<string, unknown>): ReservationDenormalized {
  return {
    userName: String(data.userName ?? '알 수 없음'),
    userEmail: String(data.userEmail ?? '-'),
    resourceName: String(data.resourceName ?? '삭제된 자원'),
    resourceCode: String(data.resourceCode ?? '-'),
    resourceCategoryId: Number(data.resourceCategoryId ?? 0),
    resourceCategoryName: String(data.resourceCategoryName ?? '미분류'),
  }
}

export function toMockListItem(item: Reservation): ReservationListItem {
  const user = reservationUsers.find((entry) => entry.id === item.userId)
  const resource = resourcesMock.find((entry) => entry.id === item.resourceId)
  const category = resourceCategories.find((entry) => entry.id === resource?.categoryId)

  return {
    ...item,
    userName: user?.name ?? '알 수 없음',
    userEmail: user?.email ?? '-',
    resourceName: resource?.name ?? '삭제된 자원',
    resourceCode: resource?.resourceCode ?? '-',
    resourceCategoryId: resource?.categoryId ?? 0,
    resourceCategoryName: category?.name ?? '미분류',
  }
}

export function toFirestoreListItem(
  item: Reservation,
  denormalized: ReservationDenormalized,
): ReservationListItem {
  return {
    ...item,
    ...denormalized,
  }
}

function buildHistories(item: Reservation, listItem: ReservationListItem, processorName: string): ReservationHistory[] {
  const histories: ReservationHistory[] = [
    {
      id: `${item.id}-applied`,
      reservationId: item.id,
      action: 'APPLIED',
      title: '예약 신청',
      reason: null,
      actorName: listItem.userName,
      occurredAt: item.createdAt,
    },
  ]

  if (item.reviewedAt && (item.status === 'APPROVED' || item.status === 'COMPLETED' || item.status === 'CANCELLED')) {
    histories.push({
      id: `${item.id}-approved`,
      reservationId: item.id,
      action: 'APPROVED',
      title: '예약 승인',
      reason: null,
      actorName: processorName,
      occurredAt: item.reviewedAt,
    })
  }
  if (item.status === 'REJECTED' && item.processedAt) {
    histories.push({
      id: `${item.id}-rejected`,
      reservationId: item.id,
      action: 'REJECTED',
      title: '예약 반려',
      reason: item.rejectionReason,
      actorName: processorName,
      occurredAt: item.processedAt,
    })
  }
  if (item.status === 'CANCELLED' && item.cancelledAt) {
    histories.push({
      id: `${item.id}-cancelled`,
      reservationId: item.id,
      action: 'CANCELLED',
      title: '예약 취소',
      reason: item.cancellationReason,
      actorName: String(item.reviewedBy) === String(item.userId) ? listItem.userName : processorName,
      occurredAt: item.cancelledAt,
    })
  }
  if (item.status === 'COMPLETED' && item.processedAt) {
    histories.push({
      id: `${item.id}-completed`,
      reservationId: item.id,
      action: 'COMPLETED',
      title: '이용 완료',
      reason: null,
      actorName: '시스템',
      occurredAt: item.processedAt,
    })
  }
  return histories
}

export async function toReservationDetail(
  item: Reservation,
  listItem: ReservationListItem,
  processorName = defaultProcessorName,
): Promise<ReservationDetail> {
  const resource = await resourceService.getResource(String(item.resourceId))
  const resourceType = resourceTypes.find((entry) => entry.code === resource?.type)

  return {
    ...listItem,
    userPhone: '-',
    organization: '-',
    resourceTypeName: resourceType?.name ?? resource?.type ?? '-',
    resourceLocation: resource?.location ?? '-',
    resourceImageUrl: resource?.imageUrl ?? null,
    processorName: item.processedAt ? processorName : null,
    processReason: item.rejectionReason ?? item.cancellationReason,
    histories: buildHistories(item, listItem, processorName),
  }
}

export function toMockDetail(item: Reservation, processorName = defaultProcessorName): ReservationDetail {
  const listItem = toMockListItem(item)
  const user = reservationUsers.find((entry) => entry.id === item.userId)
  const resource = resourcesMock.find((entry) => entry.id === item.resourceId)
  const resourceType = resourceTypes.find((entry) => entry.code === resource?.type)

  return {
    ...listItem,
    userPhone: user?.phone ?? '-',
    organization: user?.organization ?? '-',
    resourceTypeName: resourceType?.name ?? resource?.type ?? '-',
    resourceLocation: resource?.location ?? '-',
    resourceImageUrl: resource?.imageUrl ?? null,
    processorName: item.processedAt ? processorName : null,
    processReason: item.rejectionReason ?? item.cancellationReason,
    histories: buildHistories(item, listItem, processorName),
  }
}

import type { Rental, RentalListItem } from '../types'
import { getRentalDisplayStatus, overdueDayCount } from '../utils/rental'

export interface RentalDenormalized {
  reservationNumber: string | null
  userName: string
  userEmail: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: number
  resourceCategoryName: string
}

export function denormalizedRentalFromFirestore(data: Record<string, unknown>): RentalDenormalized {
  return {
    reservationNumber: data.reservationNumber != null ? String(data.reservationNumber) : null,
    userName: String(data.userName ?? '알 수 없음'),
    userEmail: String(data.userEmail ?? '-'),
    resourceName: String(data.resourceName ?? '삭제된 자원'),
    resourceCode: String(data.resourceCode ?? '-'),
    resourceCategoryId: Number(data.resourceCategoryId ?? 0),
    resourceCategoryName: String(data.resourceCategoryName ?? '미분류'),
  }
}

export function toFirestoreRentalListItem(item: Rental, denormalized: RentalDenormalized): RentalListItem {
  const displayStatus = getRentalDisplayStatus(item)
  return {
    ...item,
    ...denormalized,
    displayStatus,
    overdueDays: displayStatus === 'OVERDUE' ? overdueDayCount(item.dueAt) : 0,
  }
}

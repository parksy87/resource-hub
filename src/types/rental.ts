import type { PaginatedResponse, PaginationParams } from './api'
import type {
  EntityId,
  ISODate,
  ISODateTime,
  Rental,
  RentalStatus,
  ReturnCondition,
} from './domain'

export interface RentalListItem extends Rental {
  reservationNumber: string | null
  userName: string
  userEmail: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: EntityId
  resourceCategoryName: string
  displayStatus: RentalStatus
  overdueDays: number
}

export interface RentalFilter extends PaginationParams {
  keyword: string
  status: RentalStatus | null
  categoryId: EntityId | null
  periodStart: ISODate | ''
  periodEnd: ISODate | ''
  dueDate: ISODate | ''
}

export type RentalHistoryAction =
  | 'REQUESTED'
  | 'PROCESSED'
  | 'STARTED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'STATUS_CHANGED'

export interface RentalHistory {
  id: EntityId | string
  rentalId: EntityId | string
  action: RentalHistoryAction
  title: string
  description: string | null
  actorName: string
  occurredAt: ISODateTime
}

export interface RentalDetail extends RentalListItem {
  userPhone: string
  organization: string
  resourceTypeName: string
  resourceLocation: string
  resourceImageUrl: string | null
  reservationPurpose: string
  reservationCreatedAt: ISODateTime | null
  rentalProcessorName: string | null
  returnProcessorName: string | null
  histories: RentalHistory[]
}

export interface RentalReturnPayload {
  returnedAt: ISODateTime
  returnStatus: ReturnCondition
  returnedQuantity: number
  returnNote: string | null
}

export interface RentalActionResult {
  rental: RentalDetail
  message: string
}

export type RentalHistoryFilter = RentalFilter
export type RentalProcessHistory = RentalHistory
export type ReturnStatus = ReturnCondition

export interface ReturnForm {
  dueDate: ISODate | ''
  note: string
}

export interface RentalStatusCounts {
  ALL: number
  REQUESTED: number
  RENTED: number
  RETURN_REQUESTED: number
  RETURNED: number
  OVERDUE: number
}

export interface RentalHistoryResult extends PaginatedResponse<RentalListItem> {
  counts: RentalStatusCounts
  hasAny: boolean
}

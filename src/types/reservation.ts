import type { PaginatedResponse, PaginationParams } from './api'
import type {
  EntityId,
  ISODate,
  ISODateTime,
  Reservation,
  ReservationStatus,
} from './domain'

export interface ReservationUserSnapshot {
  id: EntityId | string
  name: string
  email: string
  phone: string
  organization: string
}

export interface ReservationListItem extends Reservation {
  userName: string
  userEmail: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: EntityId
  resourceCategoryName: string
}

export interface ReservationFilter extends PaginationParams {
  keyword: string
  status: ReservationStatus | null
  categoryId: EntityId | null
  periodStart: ISODate | ''
  periodEnd: ISODate | ''
  appliedDate: ISODate | ''
}

export type ReservationHistoryAction =
  | 'APPLIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'

export interface ReservationHistory {
  id: EntityId | string
  reservationId: EntityId | string
  action: ReservationHistoryAction
  title: string
  reason: string | null
  actorName: string
  occurredAt: ISODateTime
}

export interface ReservationDetail extends ReservationListItem {
  userPhone: string
  organization: string
  resourceTypeName: string
  resourceLocation: string
  processorName: string | null
  processReason: string | null
  resourceImageUrl: string | null
  histories: ReservationHistory[]
}

export interface ReservationActionResult {
  reservation: ReservationDetail
  message: string
}

export interface ReservationSchedule {
  startDate: ISODate | ''
  startTime: string
  endDate: ISODate | ''
  endTime: string
}

export interface ReservationApplicant {
  userId: EntityId | string
  name: string
  email: string
  phone: string
  organization: string
}

export interface ReservationAgreement {
  usageGuide: boolean
  privacy: boolean
  notifications: boolean
}

export interface ReservationForm {
  schedule: ReservationSchedule
  purpose: string
  usageLocation: string
  attendeeCount: string
  requestNote: string
  agreement: ReservationAgreement
}

export type ReservationFormErrors = Partial<
  Record<
    | 'resource'
    | 'startDate'
    | 'startTime'
    | 'endDate'
    | 'endTime'
    | 'schedule'
    | 'purpose'
    | 'usageLocation'
    | 'attendeeCount'
    | 'agreement',
    string
  >
>

export type ReservationAvailabilityStatus = 'available' | 'unavailable' | 'pending'

export interface ReservationAvailability {
  status: ReservationAvailabilityStatus
  message: string
}

export interface ReservationAvailabilityQuery {
  resourceId: EntityId | string
  startAt: ISODateTime
  endAt: ISODateTime
}

export interface ReservationCreateRequest {
  resourceId: EntityId | string
  userId: EntityId | string
  startAt: ISODateTime
  endAt: ISODateTime
  purpose: string
  usageLocation: string
  attendeeCount: number
  requestNote: string | null
  notificationAgreed: boolean
}

export interface ReservationCreateResult {
  reservationNumber: string
  resourceName: string
  startAt: ISODateTime
  endAt: ISODateTime
  status: ReservationStatus
}

export type ReservationHistoryFilter = ReservationFilter
export type ReservationProcessHistory = ReservationHistory

export interface ReservationCancelForm {
  reason: string
}

export interface ReservationStatusCounts {
  ALL: number
  PENDING: number
  APPROVED: number
  REJECTED: number
  CANCELLED: number
  COMPLETED: number
}

export interface ReservationHistoryResult extends PaginatedResponse<ReservationListItem> {
  counts: ReservationStatusCounts
  hasAny: boolean
}

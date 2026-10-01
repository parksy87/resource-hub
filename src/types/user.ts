import type { PaginationParams } from './api'
import type {
  EntityId,
  ISODate,
  ISODateTime,
  RentalStatus,
  ReservationStatus,
  User,
  UserRole,
  UserStatus,
} from './domain'

export type ManagedUserRole = 'USER' | 'ADMIN'

export interface UserListItem extends User {
  organization: string
  joinedAt: ISODateTime
  displayRole: ManagedUserRole
}

export interface UserFilter extends PaginationParams {
  keyword: string
  status: UserStatus | null
  role: ManagedUserRole | null
  joinedDate: ISODate | ''
}

export type UserActivityAction = 'JOINED' | 'UPDATED' | 'STATUS_CHANGED' | 'RESERVED' | 'RENTED' | 'RETURNED'

export interface UserActivity {
  id: string
  userId: EntityId
  action: UserActivityAction
  title: string
  description: string | null
  occurredAt: ISODateTime
}

export interface UserStatusHistory {
  id: EntityId
  userId: EntityId
  fromStatus: UserStatus
  toStatus: UserStatus
  reason: string | null
  changedAt: ISODateTime
  processorName: string
}

export interface UserReservationSummary {
  id: EntityId
  reservationNumber: string
  resourceName: string
  startAt: ISODateTime
  endAt: ISODateTime
  status: ReservationStatus
}

export interface UserRentalSummary {
  id: EntityId | string
  rentalNumber: string
  resourceName: string
  rentedAt: ISODateTime | null
  dueAt: ISODateTime
  returnedAt: ISODateTime | null
  status: RentalStatus
}

export interface UserDetail extends UserListItem {
  reservationCount: number
  rentalCount: number
  returnCount: number
  activeRentals: UserRentalSummary[]
  reservations: UserReservationSummary[]
  rentals: UserRentalSummary[]
  activities: UserActivity[]
  statusHistories: UserStatusHistory[]
}

export interface UserFormValues {
  name: string
  email: string
  phone: string
  organization: string
  role: UserRole
  status: UserStatus
  statusReason: string
}

export interface UserPayload {
  name: string
  email: string
  phone: string
  organization: string
  role: UserRole
  status: UserStatus
  statusReason: string | null
}

export interface UserStatusPayload {
  status: UserStatus
  reason: string | null
}

export interface UserActionResult {
  user: UserDetail
  message: string
}

export type ISODate = string
export type ISODateTime = string
export type EntityId = number

export type UserRole = 'USER' | 'MANAGER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'
export type ResourceStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'INSPECTION'
  | 'DISPOSED'
export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
export type RentalStatus = 'REQUESTED' | 'RENTED' | 'RETURN_REQUESTED' | 'RETURNED' | 'OVERDUE'
export type ReturnCondition = 'NORMAL' | 'PARTIAL' | 'DAMAGED' | 'LOST'
export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REINSPECTION_REQUIRED'
export type InspectionType = 'PERIODIC' | 'RETURN' | 'ADHOC' | 'INCIDENT'
export type InspectionResult = 'NORMAL' | 'MINOR' | 'REPAIR' | 'DISPOSAL_REVIEW'
export type NotificationEventType =
  | 'RESERVATION_APPROVED'
  | 'RESERVATION_REJECTED'
  | 'RETURN_DUE'
  | 'RETURN_OVERDUE'
  | 'INSPECTION_COMPLETED'
  | 'SYSTEM'

export interface TimestampedEntity {
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface User extends TimestampedEntity {
  id: EntityId
  employeeNumber: string
  name: string
  email: string
  phone: string | null
  department: string
  position: string | null
  role: UserRole
  status: UserStatus
  profileImageUrl: string | null
  lastLoginAt: ISODateTime | null
  lastUsedAt: ISODateTime | null
}

export interface Admin extends User {
  role: 'MANAGER' | 'ADMIN'
  permissions: string[]
  managedLocationIds: EntityId[]
}

export interface ResourceCategory extends TimestampedEntity {
  id: EntityId
  name: string
  code: string
  description: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
}

export interface Resource extends TimestampedEntity {
  /** Firestore 문서 ID(문자열) 또는 mock 숫자 ID */
  id: EntityId | string
  resourceCode: string
  name: string
  categoryId: EntityId
  type: string
  location: string
  managerId: EntityId | null
  totalQuantity: number
  availableQuantity: number
  status: ResourceStatus
  purchaseDate: ISODate | null
  managementEndDate: ISODate | null
  description: string | null
  imageUrl: string | null
  notes: string | null
  isReservable: boolean
  maxRentalDays: number | null
}

export interface Reservation extends TimestampedEntity {
  id: EntityId | string
  reservationNumber: string
  resourceId: EntityId | string
  userId: EntityId | string
  startAt: ISODateTime
  endAt: ISODateTime
  quantity: number
  purpose: string
  requestNote: string | null
  usageLocation: string | null
  status: ReservationStatus
  reviewedBy: EntityId | string | null
  reviewedAt: ISODateTime | null
  rejectionReason: string | null
  cancelledAt: ISODateTime | null
  cancellationReason: string | null
  processedAt: ISODateTime | null
}

export interface Rental extends TimestampedEntity {
  id: EntityId | string
  rentalNumber: string
  reservationId: EntityId | string | null
  resourceId: EntityId | string
  userId: EntityId | string
  quantity: number
  requestedAt: ISODateTime
  rentedAt: ISODateTime | null
  dueAt: ISODateTime
  returnedAt: ISODateTime | null
  returnedQuantity: number | null
  status: RentalStatus
  processedBy: EntityId | string | null
  rentalProcessedAt: ISODateTime | null
  checkoutNote: string | null
  returnProcessedBy: EntityId | string | null
  returnProcessedAt: ISODateTime | null
  returnRequestedAt: ISODateTime | null
  returnStatus: ReturnCondition | null
  returnNote: string | null
}

export interface Return extends TimestampedEntity {
  id: EntityId
  rentalId: EntityId
  requestedAt: ISODateTime | null
  returnedAt: ISODateTime
  condition: ReturnCondition
  isDamaged: boolean
  isLost: boolean
  note: string | null
  processedBy: EntityId
}

export interface Inspection extends TimestampedEntity {
  id: EntityId
  inspectionNumber: string
  resourceId: EntityId
  rentalId: EntityId | null
  parentInspectionId: EntityId | null
  type: InspectionType
  status: InspectionStatus
  scheduledDate: ISODate
  inspectedDate: ISODate | null
  inspectorId: EntityId
  processorId: EntityId | null
  result: InspectionResult | null
  content: string | null
  issueDescription: string | null
  actionDescription: string | null
  note: string | null
}

export interface NotificationRecord extends TimestampedEntity {
  id: EntityId
  userId: EntityId
  type: NotificationEventType
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  readAt: ISODateTime | null
}

export interface DashboardStatistics {
  totalResources: number
  availableResources: number
  rentedResources: number
  reservedResources: number
  inspectionResources: number
  todayReservations: number
  todayReturns: number
  overdueRentals: number
  resourceStatusBreakdown: Array<{ status: ResourceStatus; count: number }>
  categoryBreakdown: Array<{ categoryId: EntityId; categoryName: string; count: number }>
  monthlyUsage: Array<{ month: string; reservations: number; rentals: number }>
}

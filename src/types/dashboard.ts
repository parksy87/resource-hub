import type {
  EntityId,
  ISODate,
  ISODateTime,
  ReservationStatus,
  ResourceStatus,
} from './domain'

export type DashboardSummaryKey =
  | 'total'
  | 'available'
  | 'reserved'
  | 'rented'
  | 'inspection'

export interface DashboardSummaryItem {
  key: DashboardSummaryKey
  label: string
  value: number
  description: string
  change?: number
  targetPath: string
}

export interface RecentReservation {
  id: EntityId
  reservationNumber: string
  resourceName: string
  applicantName: string
  startDate: ISODate
  endDate: ISODate
  status: ReservationStatus
  requestedAt: ISODateTime
}

export type UpcomingReturnStatus = 'ON_SCHEDULE' | 'DUE_SOON' | 'OVERDUE'

export interface UpcomingReturn {
  id: EntityId
  resourceName: string
  resourceCode: string
  userName: string
  dueDate: ISODate
  daysRemaining: number
  status: UpcomingReturnStatus
}

export interface ResourceStatusStatistic {
  status: ResourceStatus
  label: string
  count: number
  percentage: number
}

export interface ResourceCategoryStatistic {
  categoryId: EntityId
  categoryName: string
  count: number
  percentage: number
}

export interface RecentResource {
  id: EntityId
  resourceCode: string
  name: string
  categoryName: string
  status: ResourceStatus
  registeredAt: ISODate
}

export type WorkAlertTone = 'info' | 'warning' | 'danger' | 'success'

export interface WorkAlert {
  id: string
  title: string
  description: string
  count: number
  tone: WorkAlertTone
  targetPath: string
}

export interface DashboardData {
  generatedAt: ISODateTime
  summary: DashboardSummaryItem[]
  recentReservations: RecentReservation[]
  upcomingReturns: UpcomingReturn[]
  resourceStatuses: ResourceStatusStatistic[]
  resourceCategories: ResourceCategoryStatistic[]
  recentResources: RecentResource[]
  workAlerts: WorkAlert[]
}

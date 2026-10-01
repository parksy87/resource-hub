import type {
  EntityId,
  InspectionResult,
  InspectionType,
  ReservationStatus,
  ResourceStatus,
  ReturnCondition,
} from './domain'

export type StatisticsPeriod = 'TODAY' | '7D' | '30D' | '3M' | 'CUSTOM'

export type StatisticsCategory =
  | 'NOTEBOOK'
  | 'TABLET'
  | 'CAMERA'
  | 'PROJECTOR'
  | 'MEETING_ROOM'
  | 'VEHICLE'
  | 'ETC'

export interface StatisticsFilter {
  period: StatisticsPeriod
  startDate: string
  endDate: string
  category: StatisticsCategory | null
  resourceId: EntityId | null
}

export interface StatisticsSummaryItem {
  key:
    | 'reservations'
    | 'approved'
    | 'cancelled'
    | 'rentals'
    | 'returned'
    | 'overdue'
    | 'inspections'
    | 'users'
  label: string
  value: number
  changeRate: number
}

export interface StatisticsSummary {
  empty: boolean
  items: StatisticsSummaryItem[]
}

export interface StatisticsSeries {
  key: string
  label: string
}

export interface StatisticsTrendPoint {
  label: string
  [seriesKey: string]: string | number
}

export interface StatisticsTrend {
  series: StatisticsSeries[]
  points: StatisticsTrendPoint[]
}

export interface StatisticsCount<T extends string = string> {
  key: T
  label: string
  count: number
}

export interface PopularResource {
  rank: number
  resourceId: EntityId
  name: string
  categoryName: string
  usageCount: number
  utilizationRate: number
}

export interface ReservationStatistics {
  trend: StatisticsTrend
  statuses: StatisticsCount<ReservationStatus>[]
}

export interface ResourceUsageStatistics {
  statuses: StatisticsCount<ResourceStatus>[]
  categories: StatisticsCount<StatisticsCategory>[]
  topResources: PopularResource[]
  details: CategoryStatistics[]
}

export interface RentalStatistics {
  trend: StatisticsTrend
  returnConditions: StatisticsCount<ReturnCondition>[]
}

export interface InspectionStatistics {
  results: StatisticsCount<InspectionResult>[]
  types: StatisticsCount<InspectionType>[]
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  actualUsers: number
  reservationUsers: number
  rentalUsers: number
  trend: StatisticsTrend
}

export interface CategoryStatistics {
  category: StatisticsCategory
  categoryName: string
  total: number
  reservations: number
  rentals: number
  returns: number
  overdue: number
  inspections: number
  utilizationRate: number
}

export interface StatisticsResourceOption {
  id: EntityId
  name: string
  category: StatisticsCategory
}

export interface StatisticsBundle {
  summary: StatisticsSummary
  reservations: ReservationStatistics
  resources: ResourceUsageStatistics
  rentals: RentalStatistics
  inspections: InspectionStatistics
  users: UserStatistics
}

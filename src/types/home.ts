import type { EntityId, ISODate, ResourceStatus } from './domain'

export interface HomeResource {
  id: EntityId
  name: string
  categoryName: string
  description: string
  location: string
  status: ResourceStatus
  imageUrl: string | null
}

export interface PopularResource extends HomeResource {
  usageCount: number
}

export type RecentActivityKind = 'RESERVATION' | 'RENTAL' | 'RETURN_DUE'

export interface RecentActivity {
  id: EntityId
  kind: RecentActivityKind
  resourceId: EntityId
  resourceName: string
  usedOn: ISODate
  statusLabel: string
}

export interface HomeNotification {
  id: EntityId
  title: string
  publishedAt: ISODate
  important: boolean
}

export interface UserUsageSummary {
  reserving: number
  renting: number
  dueSoon: number
  unreadNotifications: number
}

export interface HomeBundle {
  popular: PopularResource[]
  available: HomeResource[]
  activities: RecentActivity[]
  notifications: HomeNotification[]
  summary: UserUsageSummary
}

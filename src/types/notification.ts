import type { EntityId, ISODateTime } from './domain'

export type NotificationType = 'reservation' | 'rental' | 'inspection' | 'system'
export type NotificationId = string

export type NotificationReadStatus = 'all' | 'unread' | 'read'

export type NotificationSort = 'latest' | 'oldest'

export interface NotificationRelatedTarget {
  type: 'reservation' | 'rental' | 'resource'
  id: EntityId
  name: string
}

export interface Notification {
  id: NotificationId
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  createdAt: ISODateTime
  relatedTarget?: NotificationRelatedTarget
}

export interface NotificationFilter {
  keyword: string
  type: NotificationType | 'all'
  status: NotificationReadStatus
  sort: NotificationSort
  page: number
  pageSize: number
}

export interface NotificationListResult {
  items: Notification[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  totalCount: number
  unreadCount: number
  hasAny: boolean
}

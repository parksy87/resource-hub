import type { BadgeTone } from '../components/ui'
import type { NotificationReadStatus, NotificationSort, NotificationType } from '../types/notification'

export const notificationPageSize = 10

export const notificationTypeMeta: Record<NotificationType, { label: string; tone: BadgeTone }> = {
  reservation: { label: '예약', tone: 'blue' },
  rental: { label: '대여·반납', tone: 'purple' },
  inspection: { label: '점검', tone: 'yellow' },
  system: { label: '시스템', tone: 'neutral' },
}

export const notificationTypeOptions: Array<{ label: string; value: NotificationType | 'all' }> = [
  { label: '전체', value: 'all' },
  { label: '예약', value: 'reservation' },
  { label: '대여·반납', value: 'rental' },
  { label: '점검', value: 'inspection' },
  { label: '시스템', value: 'system' },
]

export const notificationReadOptions: Array<{ label: string; value: NotificationReadStatus }> = [
  { label: '전체', value: 'all' },
  { label: '읽지 않음', value: 'unread' },
  { label: '읽음', value: 'read' },
]

export const notificationSortOptions: Array<{ label: string; value: NotificationSort }> = [
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
]

export const notificationTargetLabel = {
  reservation: '예약',
  rental: '대여·반납',
  resource: '자원',
} as const

import { notificationsMock } from '../data/notificationMock'
import type { Notification, NotificationFilter, NotificationListResult } from '../types/notification'

export interface NotificationService {
  getMyNotifications: (filter: NotificationFilter) => Promise<NotificationListResult>
  getMyNotification: (id: string) => Promise<Notification | null>
  markAsRead: (id: string) => Promise<Notification>
  markAllAsRead: () => Promise<number>
  getUnreadCount: () => Promise<number>
  subscribe: (listener: () => void) => () => void
}

let notifications = structuredClone(notificationsMock)
const listeners = new Set<() => void>()
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

function emit() {
  listeners.forEach((listener) => listener())
}

function unreadCount() {
  return notifications.filter((item) => !item.isRead).length
}

export const notificationService: NotificationService = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  async getUnreadCount() {
    await wait()
    return unreadCount()
  },

  async getMyNotifications(filter) {
    await wait()
    const keyword = filter.keyword.trim().toLocaleLowerCase()
    const matched = notifications.filter((item) => {
      const matchesKeyword = !keyword
        || item.title.toLocaleLowerCase().includes(keyword)
        || item.content.toLocaleLowerCase().includes(keyword)
      const matchesType = filter.type === 'all' || item.type === filter.type
      const matchesStatus = filter.status === 'all'
        || (filter.status === 'unread' ? !item.isRead : item.isRead)
      return matchesKeyword && matchesType && matchesStatus
    })
    const sorted = [...matched].sort((left, right) => (
      filter.sort === 'oldest'
        ? left.createdAt.localeCompare(right.createdAt)
        : right.createdAt.localeCompare(left.createdAt)
    ))
    const totalItems = sorted.length
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / filter.pageSize)
    const page = totalPages === 0 ? 1 : Math.min(Math.max(1, filter.page), totalPages)
    const start = (page - 1) * filter.pageSize
    return {
      items: structuredClone(sorted.slice(start, start + filter.pageSize)),
      page,
      pageSize: filter.pageSize,
      totalItems,
      totalPages,
      totalCount: notifications.length,
      unreadCount: unreadCount(),
      hasAny: notifications.length > 0,
    }
  },

  async getMyNotification(id) {
    await wait()
    const item = notifications.find((entry) => entry.id === id)
    return item ? structuredClone(item) : null
  },

  async markAsRead(id) {
    await wait()
    const index = notifications.findIndex((entry) => entry.id === id)
    if (index < 0) throw new Error('NOTIFICATION_NOT_FOUND')
    if (!notifications[index].isRead) {
      notifications[index] = { ...notifications[index], isRead: true }
      emit()
    }
    return structuredClone(notifications[index])
  },

  async markAllAsRead() {
    await wait()
    const hasUnread = notifications.some((item) => !item.isRead)
    if (hasUnread) {
      notifications = notifications.map((item) => (item.isRead ? item : { ...item, isRead: true }))
      emit()
    }
    return unreadCount()
  },
}

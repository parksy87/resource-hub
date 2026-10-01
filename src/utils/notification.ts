import { ROUTES } from '../routes/paths'
import type { NotificationRelatedTarget } from '../types/notification'

export function notificationSummary(content: string) {
  const compact = content.replace(/\s+/g, ' ').trim()
  return compact.length > 72 ? `${compact.slice(0, 72)}…` : compact
}

export function notificationTargetPath(target?: NotificationRelatedTarget) {
  if (!target) return null
  if (target.type === 'reservation') return ROUTES.user.reservationHistoryDetail(target.id)
  if (target.type === 'rental') return ROUTES.user.rentalDetail(target.id)
  return ROUTES.user.resourceDetail(target.id)
}

export function notificationTargetAction(target?: NotificationRelatedTarget) {
  if (!target) return '알림 상세'
  if (target.type === 'reservation') return '예약 상세'
  if (target.type === 'rental') return '대여 상세'
  return '자원 상세'
}

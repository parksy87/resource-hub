import type { ReservationStatus } from '../types'

export function formatReservationDate(value: string) {
  return value.slice(0, 10).replaceAll('-', '.')
}

export function formatReservationClock(value: string) {
  return value.slice(11, 16)
}

export function formatUsageDate(startAt: string, endAt: string) {
  const start = formatReservationDate(startAt)
  const end = formatReservationDate(endAt)
  return start === end ? start : `${start} – ${end}`
}

export function formatUsageTime(startAt: string, endAt: string) {
  return `${formatReservationClock(startAt)} – ${formatReservationClock(endAt)}`
}

export function canCancelReservation(status: ReservationStatus) {
  return status === 'PENDING' || status === 'APPROVED'
}

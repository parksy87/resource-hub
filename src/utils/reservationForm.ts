import { reservationToday } from '../config/userReservation'
import type {
  ReservationCreateRequest,
  ReservationForm,
  ReservationFormErrors,
  ReservationSchedule,
  ResourceStatus,
} from '../types'

export function toReservationDateTime(date: string, time: string) {
  return `${date}T${time}:00+09:00`
}

export function reservationRangeError(schedule: ReservationSchedule) {
  if (!schedule.startDate || !schedule.startTime || !schedule.endDate || !schedule.endTime) return null
  const start = toReservationDateTime(schedule.startDate, schedule.startTime)
  const end = toReservationDateTime(schedule.endDate, schedule.endTime)
  if (end <= start) return '종료일시는 시작일시보다 이후로 입력해 주세요.'
  return null
}

export function formatReservationWhen(value: string) {
  return value.slice(0, 16).replace('T', ' ').replaceAll('-', '.')
}

interface ValidationInput {
  form: ReservationForm
  resourceStatus: ResourceStatus | null
  availabilityMessage: string | null
}

export function validateReservationForm({
  form,
  resourceStatus,
  availabilityMessage,
}: ValidationInput): ReservationFormErrors {
  const errors: ReservationFormErrors = {}
  const { schedule } = form

  if (!resourceStatus) errors.resource = '예약할 자원을 선택해 주세요.'
  else if (resourceStatus !== 'AVAILABLE') errors.resource = '이용할 수 없는 자원입니다.'

  if (!schedule.startDate) errors.startDate = '이용 시작일을 입력해 주세요.'
  else if (schedule.startDate < reservationToday) errors.startDate = '과거 날짜는 선택할 수 없습니다.'

  if (!schedule.startTime) errors.startTime = '이용 시작 시간을 선택해 주세요.'

  if (!schedule.endDate) errors.endDate = '이용 종료일을 입력해 주세요.'
  else if (schedule.endDate < reservationToday) errors.endDate = '과거 날짜는 선택할 수 없습니다.'

  if (!schedule.endTime) errors.endTime = '이용 종료 시간을 선택해 주세요.'

  const rangeError = reservationRangeError(schedule)
  if (rangeError) errors.endTime = rangeError
  if (availabilityMessage) errors.schedule = availabilityMessage

  if (!form.purpose.trim()) errors.purpose = '이용 목적을 입력해 주세요.'
  if (!form.usageLocation.trim()) errors.usageLocation = '이용 장소를 입력해 주세요.'

  const attendeeCount = Number(form.attendeeCount)
  if (!form.attendeeCount.trim()) errors.attendeeCount = '참석 인원을 입력해 주세요.'
  else if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
    errors.attendeeCount = '참석 인원은 1명 이상이어야 합니다.'
  }

  if (!form.agreement.usageGuide || !form.agreement.privacy) {
    errors.agreement = '필수 동의 항목을 확인해 주세요.'
  }

  return errors
}

export function hasReservationErrors(errors: ReservationFormErrors) {
  return Object.values(errors).some(Boolean)
}

export function toReservationRequest(
  form: ReservationForm,
  resourceId: number | string,
  userId: number | string,
): ReservationCreateRequest {
  return {
    resourceId,
    userId,
    startAt: toReservationDateTime(form.schedule.startDate, form.schedule.startTime),
    endAt: toReservationDateTime(form.schedule.endDate, form.schedule.endTime),
    purpose: form.purpose.trim(),
    usageLocation: form.usageLocation.trim(),
    attendeeCount: Number(form.attendeeCount),
    requestNote: form.requestNote.trim() || null,
    notificationAgreed: form.agreement.notifications,
  }
}

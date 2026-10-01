import type {
  OperationSettings,
  RentalSettings,
  ReservationSettings,
  SystemSettings,
} from '../types'
import { isValidEmail, isValidPhone } from './user'

export type SettingsFieldErrors = Record<string, string>

export function validateBasic(values: SystemSettings): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {}
  if (!values.systemName.trim()) errors.systemName = '시스템명을 입력해 주세요.'
  if (!isValidEmail(values.adminEmail)) errors.adminEmail = '이메일 형식을 확인해 주세요.'
  if (!isValidPhone(values.phone)) errors.phone = '010-0000-0000 형식으로 입력해 주세요.'
  if (!values.organizationName.trim()) errors.organizationName = '운영기관명을 입력해 주세요.'
  if (![10, 20, 50].includes(values.pageSize)) errors.pageSize = '표시 건수를 선택해주세요.'
  return errors
}

export function validateReservation(values: ReservationSettings): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {}
  if (!Number.isInteger(values.maxCount) || values.maxCount < 1) {
    errors.maxCount = '1 이상의 정수를 입력해 주세요.'
  }
  if (values.cancelEnabled && (!Number.isInteger(values.cancelBeforeHours) || values.cancelBeforeHours < 0)) {
    errors.cancelBeforeHours = '0 이상의 정수를 입력해 주세요.'
  }
  return errors
}

export function validateRental(values: RentalSettings): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {}
  if (!Number.isInteger(values.defaultDays) || values.defaultDays < 1) {
    errors.defaultDays = '1 이상의 정수를 입력해 주세요.'
  }
  if (!Number.isInteger(values.maxExtensions) || values.maxExtensions < 0) {
    errors.maxExtensions = '0 이상의 정수를 입력해 주세요.'
  }
  if (values.overdueEnabled && (!Number.isInteger(values.overdueNoticeHours) || values.overdueNoticeHours < 0)) {
    errors.overdueNoticeHours = '0 이상의 정수를 입력해 주세요.'
  }
  return errors
}

export function validateOperation(values: OperationSettings): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {}
  if (values.maintenanceMode && !values.maintenanceMessage.trim()) {
    errors.maintenanceMessage = '점검 안내문을 입력해 주세요.'
  }
  return errors
}

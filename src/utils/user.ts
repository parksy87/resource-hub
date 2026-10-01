import type { UserRole, UserStatus } from '../types'

export function canManageUser(status: UserStatus) {
  return status !== 'WITHDRAWN'
}

export function isAdminRole(role: UserRole) {
  return role === 'ADMIN' || role === 'MANAGER'
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidPhone(value: string) {
  return /^010-\d{3,4}-\d{4}$/.test(value.trim())
}

export function userErrorMessage(error: unknown, fallback: string) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'DUPLICATE_EMAIL') return '이미 사용 중인 이메일입니다.'
  if (code === 'REASON_REQUIRED') return '이용정지 사유를 입력해 주세요.'
  if (code === 'INVALID_STATUS') return '현재 상태에서는 처리할 수 없습니다.'
  if (code === 'USER_NOT_FOUND') return '사용자를 찾을 수 없습니다.'
  return fallback
}

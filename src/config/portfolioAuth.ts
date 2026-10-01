import { AuthServiceError } from '../types/auth'

/** 포트폴리오 시연용 사용자 mock 로그인 (Firebase 미사용) */
export const PORTFOLIO_DEMO_USER_ID = 'user'
export const PORTFOLIO_DEMO_USER_PASSWORD = '1111'

/** 관리자 로그인 화면 표시 ID */
export const PORTFOLIO_ADMIN_DISPLAY_ID = 'admin'

/**
 * 화면 ID `admin` → Firebase Auth 이메일.
 * 실제 이메일은 .env의 VITE_ADMIN_AUTH_EMAIL에만 두고, @ 포함 입력은 이메일로 그대로 사용합니다.
 */
export function resolveAdminFirebaseEmail(loginIdOrEmail: string): string {
  const trimmed = loginIdOrEmail.trim()
  if (!trimmed) {
    throw new AuthServiceError('INVALID_CREDENTIALS', '아이디와 비밀번호를 입력해 주세요.')
  }

  if (trimmed.includes('@')) {
    return trimmed
  }

  if (trimmed.toLowerCase() !== PORTFOLIO_ADMIN_DISPLAY_ID) {
    throw new AuthServiceError('INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  const mappedEmail = import.meta.env.VITE_ADMIN_AUTH_EMAIL?.trim()
  if (!mappedEmail) {
    throw new AuthServiceError(
      'ADMIN_EMAIL_NOT_CONFIGURED',
      '관리자 Firebase 이메일이 설정되지 않았습니다. .env에 VITE_ADMIN_AUTH_EMAIL을 입력해 주세요.',
    )
  }

  return mappedEmail
}

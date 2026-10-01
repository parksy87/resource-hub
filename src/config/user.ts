import type { BadgeTone } from '../components/ui'
import type { UserRole, UserStatus } from '../types'

export const userStatusMeta: Record<UserStatus, { label: string; tone: BadgeTone; description: string }> = {
  ACTIVE: { label: '정상', tone: 'green', description: '서비스를 이용할 수 있는 상태입니다.' },
  SUSPENDED: { label: '이용정지', tone: 'red', description: '이용이 제한된 상태입니다.' },
  WITHDRAWN: { label: '탈퇴', tone: 'neutral', description: '탈퇴 처리된 사용자입니다.' },
}

export const userRoleMeta: Record<UserRole, { label: string; tone: BadgeTone }> = {
  USER: { label: '일반 사용자', tone: 'blue' },
  MANAGER: { label: '관리자', tone: 'purple' },
  ADMIN: { label: '관리자', tone: 'purple' },
}

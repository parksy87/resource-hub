import type { UserRole } from './domain'

/** Firestore `users/{uid}` 문서 (다음 단계에서 생성·동기화) */
export type FirestoreAppRole = 'USER' | 'ADMIN'

export interface FirebaseUserProfile {
  email: string
  name: string
  role: FirestoreAppRole
  createdAt: unknown
}

/** Firebase Authentication + 프로필(role)을 합친 앱 사용자 */
export interface AuthUser {
  uid: string
  email: string | null
  name: string
  role: UserRole
}

export class AuthServiceError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

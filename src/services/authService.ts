import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { PORTFOLIO_ADMIN_DISPLAY_ID, resolveAdminFirebaseEmail } from '../config/portfolioAuth'
import { auth, isFirebaseConfigured, requireAuth, requireDb } from '../lib/firebase'
import type { AuthUser, FirebaseUserProfile } from '../types/auth'
import { AuthServiceError } from '../types/auth'
import type { UserRole } from '../types'

const USERS_COLLECTION = 'users'

function mapFirestoreRole(role: FirebaseUserProfile['role'] | undefined): UserRole {
  if (role === 'ADMIN') return 'ADMIN'
  return 'USER'
}

function mapFirebaseAuthError(error: unknown): AuthServiceError {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : 'auth/unknown'

  switch (code) {
    case 'auth/invalid-email':
      return new AuthServiceError('INVALID_EMAIL', '이메일 형식이 올바르지 않습니다.')
    case 'auth/user-disabled':
      return new AuthServiceError('USER_DISABLED', '사용이 중지된 계정입니다. 관리자에게 문의해 주세요.')
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new AuthServiceError('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.')
    case 'auth/too-many-requests':
      return new AuthServiceError('TOO_MANY_REQUESTS', '로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.')
    case 'auth/network-request-failed':
      return new AuthServiceError('NETWORK_ERROR', '네트워크 연결을 확인한 후 다시 시도해 주세요.')
    case 'permission-denied':
      return new AuthServiceError(
        'PROFILE_ACCESS_DENIED',
        '사용자 정보를 불러올 수 없습니다. Firestore 보안 규칙을 확인해 주세요.',
      )
    default:
      return new AuthServiceError(code, '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }
}

async function getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  const snapshot = await getDoc(doc(requireDb(), USERS_COLLECTION, uid))
  if (!snapshot.exists()) return null
  return snapshot.data() as FirebaseUserProfile
}

async function toAuthUser(fbUser: FirebaseAuthUser, options?: { requireProfile?: boolean }): Promise<AuthUser> {
  let profile: FirebaseUserProfile | null = null

  if (isFirebaseConfigured) {
    try {
      profile = await getUserProfile(fbUser.uid)
    } catch (error) {
      throw mapFirebaseAuthError(error)
    }
  }

  if (options?.requireProfile && !profile) {
    throw new AuthServiceError(
      'PROFILE_NOT_FOUND',
      '등록된 사용자 정보가 없습니다. Firestore users 문서를 확인해 주세요.',
    )
  }

  const email = profile?.email ?? fbUser.email
  const name =
    profile?.name ??
    fbUser.displayName ??
    (email ? email.split('@')[0] : '사용자')

  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name,
    role: mapFirestoreRole(profile?.role),
  }
}

/** Firebase Console에서 생성한 관리자 계정 — Firestore users 문서 없이 ADMIN 처리 */
function toAdminAuthUser(fbUser: FirebaseAuthUser): AuthUser {
  const email = fbUser.email
  return {
    uid: fbUser.uid,
    email,
    name: PORTFOLIO_ADMIN_DISPLAY_ID,
    role: 'ADMIN',
  }
}

export const authService = {
  isConfigured: () => isFirebaseConfigured,

  getUserProfile,

  getFirebaseUser(): FirebaseAuthUser | null {
    if (!auth) return null
    return auth.currentUser
  },

  async loginAsAdmin(loginIdOrEmail: string, password: string): Promise<AuthUser> {
    if (!isFirebaseConfigured) {
      throw new AuthServiceError(
        'AUTH_NOT_CONFIGURED',
        'Firebase 설정이 없습니다. .env에 VITE_FIREBASE_* 값을 입력해 주세요.',
      )
    }

    if (!password) {
      throw new AuthServiceError('INVALID_CREDENTIALS', '아이디와 비밀번호를 입력해 주세요.')
    }

    let firebaseEmail: string
    try {
      firebaseEmail = resolveAdminFirebaseEmail(loginIdOrEmail)
    } catch (error) {
      if (error instanceof AuthServiceError) throw error
      throw mapFirebaseAuthError(error)
    }

    try {
      const credential = await signInWithEmailAndPassword(requireAuth(), firebaseEmail, password)
      return toAdminAuthUser(credential.user)
    } catch (error) {
      if (error instanceof AuthServiceError) throw error
      throw mapFirebaseAuthError(error)
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    if (!isFirebaseConfigured) {
      throw new AuthServiceError(
        'AUTH_NOT_CONFIGURED',
        'Firebase 설정이 없습니다. .env에 VITE_FIREBASE_* 값을 입력해 주세요.',
      )
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      throw new AuthServiceError('INVALID_CREDENTIALS', '이메일과 비밀번호를 입력해 주세요.')
    }

    try {
      const credential = await signInWithEmailAndPassword(requireAuth(), trimmedEmail, password)
      try {
        return await toAuthUser(credential.user, { requireProfile: true })
      } catch (profileError) {
        await signOut(requireAuth())
        throw profileError
      }
    } catch (error) {
      if (error instanceof AuthServiceError) throw error
      throw mapFirebaseAuthError(error)
    }
  },

  async logout(): Promise<void> {
    if (!isFirebaseConfigured || !auth) return
    await signOut(auth)
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const current = this.getFirebaseUser()
    if (!current) return null
    try {
      return await toAuthUser(current)
    } catch {
      return {
        uid: current.uid,
        email: current.email,
        name: current.displayName ?? current.email?.split('@')[0] ?? '사용자',
        role: 'USER',
      }
    }
  },

  async getIdToken(forceRefresh = false): Promise<string | null> {
    const current = this.getFirebaseUser()
    if (!current) return null
    return current.getIdToken(forceRefresh)
  },

  /** 관리자 세션 복원용 — Firebase 로그인 사용자를 ADMIN으로 간주 */
  subscribeAdminAuthState(listener: (user: AuthUser | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      listener(null)
      return () => {}
    }

    return onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        listener(null)
        return
      }
      listener(toAdminAuthUser(fbUser))
    })
  },

  subscribeAuthState(listener: (user: AuthUser | null) => void): () => void {
    return this.subscribeAdminAuthState(listener)
  },
}

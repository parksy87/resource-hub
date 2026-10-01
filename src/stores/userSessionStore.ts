import { create } from 'zustand'

import type { AuthUser } from '../types/auth'

import type { EntityId, UserRole } from '../types'



export const demoUserName = '김민수'



interface UserSessionState {

  /** Firebase Auth + 프로필 */

  user: AuthUser | null

  isAuthenticated: boolean

  isLoading: boolean

  /** @deprecated isAuthenticated와 동기화 — 기존 화면 호환 */

  isLoggedIn: boolean

  firebaseUid: string | null

  userId: EntityId | null

  name: string

  role: UserRole | null

  accessToken: string | null

  setAuthLoading: (isLoading: boolean) => void

  applyAuthUser: (user: AuthUser, accessToken: string | null) => void

  clearAuthSession: () => void

  /** Firebase 미설정 시 로컬 mock 데이터 연동용 (데모) */

  login: () => void

  loginAsAdmin: () => void

  logout: () => void

}



const idleSession = {

  user: null as AuthUser | null,

  isAuthenticated: false,

  isLoggedIn: false,

  firebaseUid: null as string | null,

  userId: null as EntityId | null,

  name: demoUserName,

  role: null as UserRole | null,

  accessToken: null as string | null,

}



export const useUserSessionStore = create<UserSessionState>((set) => ({

  ...idleSession,

  isLoading: true,



  setAuthLoading: (isLoading) => set({ isLoading }),



  applyAuthUser: (user, accessToken) => set({

    user,

    isAuthenticated: true,

    isLoggedIn: true,

    isLoading: false,

    firebaseUid: user.uid,

    userId: null,

    name: user.name,

    role: user.role,

    accessToken,

  }),



  clearAuthSession: () => set({

    ...idleSession,

    isLoading: false,

  }),



  login: () => set({

    user: null,

    isAuthenticated: true,

    isLoggedIn: true,

    isLoading: false,

    firebaseUid: null,

    userId: 102,

    name: demoUserName,

    role: 'USER',

    accessToken: null,

  }),



  loginAsAdmin: () => set({

    user: null,

    isAuthenticated: true,

    isLoggedIn: true,

    isLoading: false,

    firebaseUid: null,

    userId: 100,

    name: '김관리',

    role: 'ADMIN',

    accessToken: null,

  }),



  logout: () => set({

    ...idleSession,

    isLoading: false,

  }),

}))



export function hasAdminRole(role: UserRole | null) {

  return role === 'ADMIN' || role === 'MANAGER'

}



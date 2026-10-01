import { create } from 'zustand'

import type { AuthUser } from '../types/auth'
import type { UserRole } from '../types'

interface AdminSessionState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  firebaseUid: string | null
  name: string
  role: UserRole | null
  accessToken: string | null
  setAuthLoading: (isLoading: boolean) => void
  applyAdminUser: (user: AuthUser, accessToken: string | null) => void
  clearAdminSession: () => void
}

const idleAdminSession = {
  user: null as AuthUser | null,
  isAuthenticated: false,
  firebaseUid: null as string | null,
  name: '',
  role: null as UserRole | null,
  accessToken: null as string | null,
}

export const useAdminSessionStore = create<AdminSessionState>((set) => ({
  ...idleAdminSession,
  isLoading: true,

  setAuthLoading: (isLoading) => set({ isLoading }),

  applyAdminUser: (user, accessToken) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      firebaseUid: user.uid,
      name: user.name,
      role: user.role,
      accessToken,
    }),

  clearAdminSession: () =>
    set({
      ...idleAdminSession,
      isLoading: false,
    }),
}))

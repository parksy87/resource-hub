import { useEffect, type ReactNode } from 'react'
import { authService } from '../../services/authService'
import { setAccessTokenProvider } from '../../services/http'
import { useAdminSessionStore } from '../../stores/adminSessionStore'
import { useUserSessionStore } from '../../stores/userSessionStore'

/** Firebase Auth(관리자)만 adminSessionStore에 동기화. 사용자 화면은 demo 세션과 분리합니다. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const applyAdminUser = useAdminSessionStore((state) => state.applyAdminUser)
  const clearAdminSession = useAdminSessionStore((state) => state.clearAdminSession)
  const setAdminAuthLoading = useAdminSessionStore((state) => state.setAuthLoading)

  useEffect(() => {
    setAccessTokenProvider(() => {
      if (!authService.isConfigured()) return null
      const current = authService.getFirebaseUser()
      if (!current) return null
      return useAdminSessionStore.getState().accessToken
    })
  }, [])

  useEffect(() => {
    useUserSessionStore.getState().setAuthLoading(false)

    if (!authService.isConfigured()) {
      setAdminAuthLoading(false)
      return undefined
    }

    setAdminAuthLoading(true)
    const unsubscribe = authService.subscribeAdminAuthState((user) => {
      void (async () => {
        if (!user) {
          clearAdminSession()
          setAdminAuthLoading(false)
          return
        }
        const token = await authService.getIdToken()
        applyAdminUser(user, token)
        setAdminAuthLoading(false)
      })()
    })

    return unsubscribe
  }, [applyAdminUser, clearAdminSession, setAdminAuthLoading])

  return children
}

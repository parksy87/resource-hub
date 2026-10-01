import { useEffect, useState } from 'react'
import { notificationService } from '../services/notificationService'
import { useUserSessionStore } from '../stores/userSessionStore'

export function useUnreadNotificationCount() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) return undefined
    let active = true
    const load = () => {
      void notificationService.getUnreadCount().then((value) => {
        if (active) setCount(value)
      })
    }
    load()
    const unsubscribe = notificationService.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [isLoggedIn])

  return isLoggedIn ? count : 0
}

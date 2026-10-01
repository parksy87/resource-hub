import { NotificationGate } from '../../components/user/NotificationGate'
import { UserNotificationDetail } from '../../components/user/UserNotificationDetail'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function NotificationDetail() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <NotificationGate />
  return <UserNotificationDetail />
}

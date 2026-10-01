import { NotificationGate } from '../../components/user/NotificationGate'
import { UserNotificationList } from '../../components/user/UserNotificationList'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function Notifications() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <NotificationGate />
  return <UserNotificationList />
}

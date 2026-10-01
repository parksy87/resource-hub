import { UserReservationHistory } from '../../components/user/UserReservationHistory'
import { ReservationHistoryGate } from '../../components/user/ReservationHistoryGate'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function ReservationHistory() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <ReservationHistoryGate />
  return <UserReservationHistory />
}

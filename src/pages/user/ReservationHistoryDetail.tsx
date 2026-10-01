import { UserReservationDetail } from '../../components/user/UserReservationDetail'
import { ReservationHistoryGate } from '../../components/user/ReservationHistoryGate'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function ReservationHistoryDetail() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <ReservationHistoryGate />
  return <UserReservationDetail />
}

import { UserRentalDetail } from '../../components/user/UserRentalDetail'
import { RentalGate } from '../../components/user/RentalGate'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function RentalDetail() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <RentalGate />
  return <UserRentalDetail />
}

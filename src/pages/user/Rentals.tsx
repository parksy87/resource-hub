import { UserRentalHistory } from '../../components/user/UserRentalHistory'
import { RentalGate } from '../../components/user/RentalGate'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function Rentals() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <RentalGate />
  return <UserRentalHistory />
}

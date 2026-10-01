import type { User, UserRole, UserStatus } from './domain'
import type { Notification } from './notification'
import type { RentalListItem } from './rental'
import type { ReservationListItem } from './reservation'

export interface MyProfile {
  id: User['id']
  name: string
  email: string
  phone: string
  organization: string
  joinedAt: string
  status: UserStatus
  role: UserRole
  withdrawalRequested: boolean
}

export interface MyProfileForm {
  name: string
  phone: string
  organization: string
  email: string
}

export interface MyUsageSummary {
  reservationRequests: number
  approvedReservations: number
  activeRentals: number
  dueSoon: number
  overdueRentals: number
  unreadNotifications: number
}

export type MyPageReservation = Pick<
  ReservationListItem,
  'id' | 'reservationNumber' | 'resourceName' | 'startAt' | 'endAt' | 'status' | 'createdAt'
>

export type MyPageRental = Pick<
  RentalListItem,
  'id' | 'rentalNumber' | 'resourceName' | 'requestedAt' | 'rentedAt' | 'dueAt' | 'returnedAt' | 'displayStatus'
>

export type MyPageNotification = Pick<
  Notification,
  'id' | 'type' | 'title' | 'content' | 'isRead' | 'createdAt' | 'relatedTarget'
>

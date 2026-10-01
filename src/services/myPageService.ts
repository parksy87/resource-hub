import { usersMock } from '../data/userMock'
import { demoUserName } from '../stores/userSessionStore'
import type {
  MyPageNotification,
  MyPageRental,
  MyPageReservation,
  MyProfile,
  MyProfileForm,
  MyUsageSummary,
  RentalHistoryFilter,
  ReservationHistoryFilter,
} from '../types'
import { isValidEmail, isValidPhone } from '../utils/user'
import { notificationService } from './notificationService'
import { rentalService } from './rentalService'
import { reservationService } from './reservationService'

export interface MyPageService {
  getMyProfile: () => Promise<MyProfile>
  updateMyProfile: (form: MyProfileForm) => Promise<MyProfile>
  getMyUsageSummary: () => Promise<MyUsageSummary>
  getMyRecentReservations: () => Promise<MyPageReservation[]>
  getMyRecentRentals: () => Promise<MyPageRental[]>
  getMyRecentNotifications: () => Promise<MyPageNotification[]>
  withdrawMyAccount: () => Promise<void>
}

const recentLimit = 5
const dueSoonDays = 7
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

let profileDraft: MyProfileForm | null = null
let withdrawalRequested = false

const reservationQuery: ReservationHistoryFilter = {
  keyword: '',
  status: null,
  categoryId: null,
  periodStart: '',
  periodEnd: '',
  appliedDate: '',
  page: 1,
  pageSize: recentLimit,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

const rentalQuery: RentalHistoryFilter = {
  keyword: '',
  status: null,
  categoryId: null,
  periodStart: '',
  periodEnd: '',
  dueDate: '',
  page: 1,
  pageSize: 100,
  sortBy: 'requestedAt',
  sortDirection: 'desc',
}

function seoulDay(offset = 0) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  if (offset === 0) return formatted
  const [year, month, day] = formatted.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10)
}

function readProfile(): MyProfile {
  const user = usersMock.find((item) => item.name === demoUserName)
  if (!user) throw new Error('PROFILE_NOT_FOUND')
  return {
    id: user.id,
    name: profileDraft?.name ?? user.name,
    email: profileDraft?.email ?? user.email,
    phone: profileDraft?.phone ?? user.phone ?? '',
    organization: profileDraft?.organization ?? user.department,
    joinedAt: user.createdAt,
    status: user.status,
    role: user.role,
    withdrawalRequested,
  }
}

function toReservation(item: MyPageReservation): MyPageReservation {
  return {
    id: item.id,
    reservationNumber: item.reservationNumber,
    resourceName: item.resourceName,
    startAt: item.startAt,
    endAt: item.endAt,
    status: item.status,
    createdAt: item.createdAt,
  }
}

function toRental(item: MyPageRental): MyPageRental {
  return {
    id: item.id,
    rentalNumber: item.rentalNumber,
    resourceName: item.resourceName,
    requestedAt: item.requestedAt,
    rentedAt: item.rentedAt,
    dueAt: item.dueAt,
    returnedAt: item.returnedAt,
    displayStatus: item.displayStatus,
  }
}

function toNotification(item: MyPageNotification): MyPageNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    isRead: item.isRead,
    createdAt: item.createdAt,
    relatedTarget: item.relatedTarget,
  }
}

async function loadMyRentals() {
  const first = await rentalService.getMyRentals(rentalQuery)
  if (first.totalPages <= 1) return first
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      rentalService.getMyRentals({ ...rentalQuery, page: index + 2 }),
    ),
  )
  return {
    ...first,
    items: [...first.items, ...rest.flatMap((page) => page.items)],
  }
}

export const myPageService: MyPageService = {
  async getMyProfile() {
    await wait()
    return structuredClone(readProfile())
  },

  async updateMyProfile(form) {
    await wait()
    const next: MyProfileForm = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      organization: form.organization.trim(),
      email: form.email.trim(),
    }
    if (!next.name || !next.organization || !isValidEmail(next.email) || !isValidPhone(next.phone)) {
      throw new Error('INVALID_PROFILE')
    }
    profileDraft = next
    return structuredClone(readProfile())
  },

  async getMyUsageSummary() {
    const today = seoulDay()
    const dueLimit = seoulDay(dueSoonDays)
    const [reservations, rentals, unreadNotifications] = await Promise.all([
      reservationService.getMyReservations({ ...reservationQuery, pageSize: 1 }),
      loadMyRentals(),
      notificationService.getUnreadCount(),
    ])
    const dueSoon = rentals.items.filter((item) => {
      const due = item.dueAt.slice(0, 10)
      return item.displayStatus === 'RENTED' && due >= today && due <= dueLimit
    }).length
    const summary: MyUsageSummary = {
      reservationRequests: reservations.counts.ALL,
      approvedReservations: reservations.counts.APPROVED,
      activeRentals: rentals.counts.RENTED,
      dueSoon,
      overdueRentals: rentals.counts.OVERDUE,
      unreadNotifications,
    }
    return summary
  },

  async getMyRecentReservations() {
    const result = await reservationService.getMyReservations(reservationQuery)
    return result.items.slice(0, recentLimit).map(toReservation)
  },

  async getMyRecentRentals() {
    const result = await rentalService.getMyRentals({ ...rentalQuery, pageSize: recentLimit })
    return result.items.slice(0, recentLimit).map(toRental)
  },

  async getMyRecentNotifications() {
    const result = await notificationService.getMyNotifications({
      keyword: '',
      type: 'all',
      status: 'all',
      sort: 'latest',
      page: 1,
      pageSize: recentLimit,
    })
    return result.items.slice(0, recentLimit).map(toNotification)
  },

  async withdrawMyAccount() {
    await wait()
    withdrawalRequested = true
  },
}

import { userStatusHistoriesMock, usersMock } from '../data/userMock'
import { rentalsMock } from '../data/rentalMock'
import { reservationsMock } from '../data/reservationMock'
import { resourcesMock } from '../data/resourceMock'
import type {
  EntityId,
  PaginatedResponse,
  User,
  UserActionResult,
  UserActivity,
  UserDetail,
  UserFilter,
  UserListItem,
  UserPayload,
  UserStatusHistory,
  UserStatusPayload,
} from '../types'
import { getRentalDisplayStatus } from '../utils/rental'
import { isAdminRole } from '../utils/user'

export interface UserService {
  getUsers: (filter: UserFilter) => Promise<PaginatedResponse<UserListItem>>
  getUser: (id: EntityId) => Promise<UserDetail | null>
  updateUser: (id: EntityId, payload: UserPayload) => Promise<UserActionResult>
  changeStatus: (id: EntityId, payload: UserStatusPayload) => Promise<UserActionResult>
}

const processorName = '김관리'
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

let users = structuredClone(usersMock)
let statusHistories = structuredClone(userStatusHistoriesMock)
let manualActivities: UserActivity[] = []

function resourceName(id: EntityId | string) {
  return resourcesMock.find((item) => String(item.id) === String(id))?.name ?? '삭제된 자원'
}

function latestUsedAt(userId: EntityId, stored: string | null) {
  const stamps = [
    stored,
    ...reservationsMock.filter((item) => item.userId === userId).map((item) => item.createdAt),
    ...rentalsMock.filter((item) => item.userId === userId).map((item) => item.returnedAt ?? item.rentedAt ?? item.requestedAt),
  ].filter((value): value is string => Boolean(value))
  return stamps.sort((a, b) => b.localeCompare(a))[0] ?? null
}

function toListItem(user: User): UserListItem {
  return {
    ...user,
    organization: user.department,
    joinedAt: user.createdAt,
    lastUsedAt: latestUsedAt(user.id, user.lastUsedAt),
    displayRole: isAdminRole(user.role) ? 'ADMIN' : 'USER',
  }
}

function rentalSummaries(userId: EntityId) {
  return rentalsMock
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => ({
      id: item.id,
      rentalNumber: item.rentalNumber,
      resourceName: resourceName(item.resourceId),
      rentedAt: item.rentedAt,
      dueAt: item.dueAt,
      returnedAt: item.returnedAt,
      status: getRentalDisplayStatus(item),
    }))
}

function buildActivities(user: User): UserActivity[] {
  const joined: UserActivity = {
    id: `joined-${user.id}`,
    userId: user.id,
    action: 'JOINED',
    title: '가입',
    description: '사용자 계정이 등록되었습니다.',
    occurredAt: user.createdAt,
  }
  const statusEvents: UserActivity[] = statusHistories
    .filter((item) => item.userId === user.id)
    .map((item) => ({
      id: `status-${item.id}`,
      userId: user.id,
      action: 'STATUS_CHANGED',
      title: '상태 변경',
      description: item.reason,
      occurredAt: item.changedAt,
    }))
  const reservationEvents: UserActivity[] = reservationsMock
    .filter((item) => item.userId === user.id)
    .map((item) => ({
      id: `reservation-${item.id}`,
      userId: user.id,
      action: 'RESERVED',
      title: '예약',
      description: `${item.reservationNumber} · ${resourceName(item.resourceId as number)}`,
      occurredAt: item.createdAt,
    }))
  const rentalEvents: UserActivity[] = rentalsMock
    .filter((item) => item.userId === user.id)
    .flatMap((item) => {
      const events: UserActivity[] = [{
        id: `rental-${item.id}`,
        userId: user.id,
        action: 'RENTED',
        title: '대여',
        description: `${item.rentalNumber} · ${resourceName(item.resourceId)}`,
        occurredAt: item.rentedAt ?? item.requestedAt,
      }]
      if (item.returnedAt) {
        events.push({
          id: `return-${item.id}`,
          userId: user.id,
          action: 'RETURNED',
          title: '반납',
          description: `${item.rentalNumber} · ${resourceName(item.resourceId)}`,
          occurredAt: item.returnedAt,
        })
      }
      return events
    })
  return [joined, ...manualActivities.filter((item) => item.userId === user.id), ...statusEvents, ...reservationEvents, ...rentalEvents]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

function toDetail(user: User): UserDetail {
  const rentals = rentalSummaries(user.id)
  const reservations = reservationsMock
    .filter((item) => item.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((item) => ({
      id: typeof item.id === 'number' ? item.id : 0,
      reservationNumber: item.reservationNumber,
      resourceName: resourceName(item.resourceId as number),
      startAt: item.startAt,
      endAt: item.endAt,
      status: item.status,
    }))
  const activeRentals = rentals.filter((item) => item.status === 'RENTED' || item.status === 'RETURN_REQUESTED' || item.status === 'OVERDUE')
  return {
    ...toListItem(user),
    reservationCount: reservationsMock.filter((item) => item.userId === user.id).length,
    rentalCount: rentals.length,
    returnCount: rentals.filter((item) => item.status === 'RETURNED').length,
    activeRentals,
    reservations,
    rentals: rentals.slice(0, 5),
    activities: buildActivities(user),
    statusHistories: statusHistories.filter((item) => item.userId === user.id).sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
  }
}

function getRequired(id: EntityId) {
  const current = users.find((item) => item.id === id)
  if (!current) throw new Error('USER_NOT_FOUND')
  return current
}

function assertManageable(user: User) {
  if (user.status === 'WITHDRAWN') throw new Error('INVALID_STATUS')
}

function recordStatus(userId: EntityId, fromStatus: User['status'], toStatus: User['status'], reason: string | null, changedAt: string) {
  const history: UserStatusHistory = {
    id: statusHistories.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    userId,
    fromStatus,
    toStatus,
    reason,
    changedAt,
    processorName,
  }
  statusHistories = [history, ...statusHistories]
}

export const userService: UserService = {
  async getUsers(filter) {
    await wait()
    const keyword = filter.keyword.trim().toLowerCase()
    let items = users.map(toListItem).filter((item) => {
      const matchesKeyword = !keyword || [item.name, item.email, item.phone ?? '', item.organization].join(' ').toLowerCase().includes(keyword)
      const matchesRole = !filter.role || (filter.role === 'ADMIN' ? isAdminRole(item.role) : item.role === 'USER')
      return (
        matchesKeyword &&
        matchesRole &&
        (!filter.status || item.status === filter.status) &&
        (!filter.joinedDate || item.joinedAt.slice(0, 10) === filter.joinedDate)
      )
    })
    items = items.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    const totalItems = items.length
    const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize))
    const page = Math.min(filter.page, totalPages)
    const start = (page - 1) * filter.pageSize
    return {
      items: structuredClone(items.slice(start, start + filter.pageSize)),
      page,
      pageSize: filter.pageSize,
      totalItems,
      totalPages,
    }
  },

  async getUser(id) {
    await wait()
    const user = users.find((item) => item.id === id)
    return user ? structuredClone(toDetail(user)) : null
  },

  async updateUser(id, payload) {
    await wait()
    const current = getRequired(id)
    assertManageable(current)
    const emailTaken = users.some((item) => item.id !== id && item.email.toLowerCase() === payload.email.trim().toLowerCase())
    if (emailTaken) throw new Error('DUPLICATE_EMAIL')
    if (payload.status === 'SUSPENDED' && current.status !== 'SUSPENDED' && !payload.statusReason?.trim()) {
      throw new Error('REASON_REQUIRED')
    }
    const now = new Date().toISOString()
    if (payload.status !== current.status) recordStatus(id, current.status, payload.status, payload.statusReason, now)
    const next: User = {
      ...current,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      department: payload.organization.trim(),
      role: payload.role,
      status: payload.status,
      updatedAt: now,
    }
    users = users.map((item) => (item.id === id ? next : item))
    manualActivities = [{
      id: `updated-${id}-${manualActivities.length + 1}`,
      userId: id,
      action: 'UPDATED',
      title: current.role !== payload.role && isAdminRole(payload.role) ? '관리자 권한 변경' : '정보 수정',
      description: current.role !== payload.role ? '사용자 유형이 변경되었습니다.' : '사용자 기본 정보가 수정되었습니다.',
      occurredAt: now,
    }, ...manualActivities]
    return { user: structuredClone(toDetail(next)), message: '사용자 정보를 수정했습니다.' }
  },

  async changeStatus(id, payload) {
    await wait()
    const current = getRequired(id)
    assertManageable(current)
    if (current.status === payload.status) throw new Error('INVALID_STATUS')
    if (payload.status === 'SUSPENDED' && !payload.reason?.trim()) throw new Error('REASON_REQUIRED')
    const now = new Date().toISOString()
    recordStatus(id, current.status, payload.status, payload.reason, now)
    const next: User = { ...current, status: payload.status, updatedAt: now }
    users = users.map((item) => (item.id === id ? next : item))
    return { user: structuredClone(toDetail(next)), message: '사용자 상태를 변경했습니다.' }
  },
}

import { rentalsMock } from '../data/rentalMock'
import { reservationUsers, reservationsMock } from '../data/reservationMock'
import { resourceCategories, resourcesMock, resourceTypes } from '../data/resourceMock'
import { useFirestoreRentals, useFirestoreResources } from '../config/backendMode'
import { useAdminSessionStore } from '../stores/adminSessionStore'
import { hasAdminRole } from '../stores/userSessionStore'
import type {
  EntityId,
  PaginatedResponse,
  Rental,
  RentalActionResult,
  RentalDetail,
  RentalFilter,
  RentalHistory,
  RentalHistoryFilter,
  RentalHistoryResult,
  RentalListItem,
  RentalReturnPayload,
  ReservationDetail,
  ResourceStatus,
  ReturnForm,
} from '../types'
import { getRentalDisplayStatus, getUserRentalDisplayStatus, overdueDayCount } from '../utils/rental'
import { nextRentalNumber } from '../utils/rentalNumber'
import { resourceFormToPayload, resourceToFormValues } from '../utils/resourceForm'
import { demoUserName } from '../stores/userSessionStore'
import { authService } from './authService'
import {
  createFirestoreRental,
  findFirestoreRentalByReservationId,
  getFirestoreRentalRecord,
  listFirestoreRentals,
  listFirestoreRentalsByUser,
  patchFirestoreRental,
  RentalFirestoreError,
} from './rentalFirestoreRepository'
import { toFirestoreRentalListItem, type RentalDenormalized } from './rentalMapper'
import { resourceService } from './resourceService'

export class RentalServiceError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'RentalServiceError'
    this.code = code
  }
}

export interface RentalService {
  getRentals: (filter: RentalFilter) => Promise<PaginatedResponse<RentalListItem>>
  getRental: (id: EntityId | string) => Promise<RentalDetail | null>
  processRental: (id: EntityId | string, note?: string) => Promise<RentalActionResult>
  processReturn: (id: EntityId | string, payload: RentalReturnPayload) => Promise<RentalActionResult>
  getMyRentals: (filter: RentalHistoryFilter) => Promise<RentalHistoryResult>
  getMyRental: (id: EntityId | string) => Promise<RentalDetail | null>
  requestReturn: (id: EntityId | string, form: ReturnForm) => Promise<RentalActionResult>
  createFromApprovedReservation: (reservation: ReservationDetail) => Promise<void>
}

let rentals = structuredClone(rentalsMock)
const processorName = '김관리'
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

function normalizeId(id: EntityId | string) {
  return String(id)
}

function nowLocalIso() {
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date())
  return `${formatted.replace(' ', 'T')}+09:00`
}

function mapFirestoreError(error: unknown): never {
  if (error instanceof RentalFirestoreError) {
    throw new RentalServiceError(error.code, error.message)
  }
  throw error
}

async function assertAdminMutation() {
  const { isAuthenticated, role } = useAdminSessionStore.getState()
  if (!isAuthenticated || !hasAdminRole(role)) {
    throw new RentalServiceError('FORBIDDEN', '관리자만 처리할 수 있습니다.')
  }
}

function getAdminActorId(): string | null {
  return useAdminSessionStore.getState().firebaseUid ?? authService.getFirebaseUser()?.uid ?? null
}

function currentApplicant() {
  return reservationUsers.find((entry) => entry.name === demoUserName) ?? reservationUsers[0]
}

function mockApplicantId() {
  return String(currentApplicant().id)
}

async function syncResourceStatus(resourceId: string, status: ResourceStatus) {
  if (!useFirestoreResources()) return
  const detail = await resourceService.getResource(resourceId)
  if (!detail) return
  const values = resourceToFormValues(detail)
  await resourceService.updateResource(resourceId, resourceFormToPayload({ ...values, status }))
}

function toUserListItem(item: Rental): RentalListItem {
  const displayStatus = getUserRentalDisplayStatus(item)
  return {
    ...toListItem(item),
    displayStatus,
    overdueDays: displayStatus === 'OVERDUE' ? overdueDayCount(item.dueAt) : 0,
  }
}

function toUserDetail(item: Rental): RentalDetail {
  const detail = toDetail(item)
  const histories = [...detail.histories]
  if (item.rentedAt) {
    histories.push({
      id: `${item.id}-started`,
      rentalId: item.id,
      action: 'STARTED',
      title: '대여 시작',
      description: item.checkoutNote,
      actorName: processorName,
      occurredAt: item.rentedAt,
    })
  }
  histories.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
  return { ...detail, ...toUserListItem(item), histories }
}

function toListItem(item: Rental): RentalListItem {
  const user = reservationUsers.find((entry) => String(entry.id) === String(item.userId))
  const resource = resourcesMock.find((entry) => String(entry.id) === String(item.resourceId))
  const reservation = reservationsMock.find((entry) => String(entry.id) === String(item.reservationId))
  const category = resourceCategories.find((entry) => entry.id === resource?.categoryId)

  const displayStatus = getRentalDisplayStatus(item)
  return {
    ...item,
    reservationNumber: reservation?.reservationNumber ?? null,
    userName: user?.name ?? '알 수 없음',
    userEmail: user?.email ?? '-',
    resourceName: resource?.name ?? '삭제된 자원',
    resourceCode: resource?.resourceCode ?? '-',
    resourceCategoryId: resource?.categoryId ?? 0,
    resourceCategoryName: category?.name ?? '미분류',
    displayStatus,
    overdueDays: displayStatus === 'OVERDUE' ? overdueDayCount(item.dueAt) : 0,
  }
}

function buildHistories(item: Rental, listItem: RentalListItem): RentalHistory[] {
  const histories: RentalHistory[] = [
    {
      id: `${item.id}-requested`,
      rentalId: item.id,
      action: 'REQUESTED',
      title: '대여 신청',
      description: `${listItem.resourceName} ${item.quantity}개 대여를 신청했습니다.`,
      actorName: listItem.userName,
      occurredAt: item.requestedAt,
    },
  ]

  if (item.rentalProcessedAt) {
    histories.push({
      id: `${item.id}-processed`,
      rentalId: item.id,
      action: 'PROCESSED',
      title: '대여 처리',
      description: item.checkoutNote,
      actorName: processorName,
      occurredAt: item.rentalProcessedAt,
    })
  }
  if (item.status === 'RETURN_REQUESTED') {
    histories.push({
      id: `${item.id}-return-req`,
      rentalId: item.id,
      action: 'RETURN_REQUESTED',
      title: '반납 신청',
      description: item.returnNote ?? '사용자가 반납 확인을 요청했습니다.',
      actorName: listItem.userName,
      occurredAt: item.returnRequestedAt ?? item.updatedAt,
    })
  }
  if (item.returnProcessedAt) {
    histories.push({
      id: `${item.id}-returned`,
      rentalId: item.id,
      action: 'RETURNED',
      title: '반납 완료',
      description: item.returnNote,
      actorName: processorName,
      occurredAt: item.returnProcessedAt,
    })
  }
  if (listItem.displayStatus === 'OVERDUE') {
    histories.push({
      id: `${item.id}-overdue`,
      rentalId: item.id,
      action: 'STATUS_CHANGED',
      title: '연체 상태 변경',
      description: '반납 예정일이 지나 연체 상태로 계산되었습니다.',
      actorName: '시스템',
      occurredAt: item.dueAt,
    })
  }

  return histories.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
}

function toDetail(item: Rental, denormalized?: RentalDenormalized): RentalDetail {
  const listItem = denormalized ? toFirestoreRentalListItem(item, denormalized) : toListItem(item)
  const user = reservationUsers.find((entry) => String(entry.id) === String(item.userId))
  const resource = resourcesMock.find((entry) => String(entry.id) === String(item.resourceId))
  const resourceType = resourceTypes.find((entry) => entry.code === resource?.type)
  const reservation = reservationsMock.find((entry) => String(entry.id) === String(item.reservationId))

  return {
    ...listItem,
    userPhone: user?.phone ?? '-',
    organization: user?.organization ?? '-',
    resourceTypeName: resourceType?.name ?? resource?.type ?? listItem.resourceCategoryName,
    resourceLocation: resource?.location ?? '-',
    resourceImageUrl: resource?.imageUrl ?? null,
    reservationPurpose: reservation?.purpose ?? '-',
    reservationCreatedAt: reservation?.createdAt ?? null,
    rentalProcessorName: item.rentalProcessedAt ? processorName : null,
    returnProcessorName: item.returnProcessedAt ? processorName : null,
    histories: buildHistories(item, listItem),
  }
}

async function toFirestoreDetail(record: { item: Rental; denormalized: RentalDenormalized }): Promise<RentalDetail> {
  const listItem = toFirestoreRentalListItem(record.item, record.denormalized)
  const resource = await resourceService.getResource(String(record.item.resourceId))
  return {
    ...listItem,
    userPhone: '-',
    organization: '-',
    resourceTypeName: resource?.typeName ?? '-',
    resourceLocation: resource?.location ?? '-',
    resourceImageUrl: resource?.imageUrl ?? null,
    reservationPurpose: '-',
    reservationCreatedAt: record.item.requestedAt,
    rentalProcessorName: record.item.rentalProcessedAt ? processorName : null,
    returnProcessorName: record.item.returnProcessedAt ? processorName : null,
    histories: buildHistories(record.item, listItem),
  }
}

function replaceRental(next: Rental) {
  rentals = rentals.map((item) => String(item.id) === String(next.id) ? next : item)
  return toDetail(next)
}

function getRequired(id: EntityId | string) {
  const item = rentals.find((entry) => String(entry.id) === normalizeId(id))
  if (!item) throw new Error('RENTAL_NOT_FOUND')
  return item
}

function paginateRentals(filter: RentalFilter, source: RentalListItem[]): PaginatedResponse<RentalListItem> {
  const keyword = filter.keyword.trim().toLocaleLowerCase()
  let filtered = source.filter((item) => {
    const matchesKeyword =
      !keyword ||
      item.rentalNumber.toLocaleLowerCase().includes(keyword) ||
      (item.reservationNumber ?? '').toLocaleLowerCase().includes(keyword) ||
      item.userName.toLocaleLowerCase().includes(keyword) ||
      item.resourceName.toLocaleLowerCase().includes(keyword) ||
      item.resourceCode.toLocaleLowerCase().includes(keyword)
    const rentalDate = (item.rentedAt ?? item.requestedAt).slice(0, 10)
    const dueDate = item.dueAt.slice(0, 10)

    return (
      matchesKeyword &&
      (!filter.status || item.displayStatus === filter.status) &&
      (!filter.categoryId || item.resourceCategoryId === filter.categoryId) &&
      (!filter.periodStart || rentalDate >= filter.periodStart) &&
      (!filter.periodEnd || rentalDate <= filter.periodEnd) &&
      (!filter.dueDate || dueDate === filter.dueDate)
    )
  })

  const direction = filter.sortDirection === 'asc' ? 1 : -1
  const sortKey = filter.sortBy ?? 'createdAt'
  filtered = filtered.sort((a, b) => {
    const aValue = String(a[sortKey as keyof RentalListItem] ?? '')
    const bValue = String(b[sortKey as keyof RentalListItem] ?? '')
    return aValue.localeCompare(bValue, 'ko', { numeric: true }) * direction
  })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize))
  const safePage = Math.min(filter.page, totalPages)
  const start = (safePage - 1) * filter.pageSize

  return {
    items: structuredClone(filtered.slice(start, start + filter.pageSize)),
    page: safePage,
    pageSize: filter.pageSize,
    totalItems,
    totalPages,
  }
}

function buildMyHistory(
  filter: RentalHistoryFilter,
  matchedSource: RentalListItem[],
  hasAny: boolean,
): RentalHistoryResult {
  const keyword = filter.keyword.trim().toLocaleLowerCase()
  const matched = matchedSource.filter((item) => {
    const rentalDate = (item.rentedAt ?? item.requestedAt).slice(0, 10)
    const dueDate = item.dueAt.slice(0, 10)
    const matchesKeyword =
      !keyword ||
      item.rentalNumber.toLocaleLowerCase().includes(keyword) ||
      item.resourceName.toLocaleLowerCase().includes(keyword) ||
      (item.reservationNumber ?? '').toLocaleLowerCase().includes(keyword)
    return (
      matchesKeyword &&
      (!filter.categoryId || item.resourceCategoryId === filter.categoryId) &&
      (!filter.periodStart || rentalDate >= filter.periodStart) &&
      (!filter.periodEnd || rentalDate <= filter.periodEnd) &&
      (!filter.dueDate || dueDate === filter.dueDate)
    )
  })
  const counts = {
    ALL: matched.length,
    REQUESTED: matched.filter((item) => item.displayStatus === 'REQUESTED').length,
    RENTED: matched.filter((item) => item.displayStatus === 'RENTED').length,
    RETURN_REQUESTED: matched.filter((item) => item.displayStatus === 'RETURN_REQUESTED').length,
    RETURNED: matched.filter((item) => item.displayStatus === 'RETURNED').length,
    OVERDUE: matched.filter((item) => item.displayStatus === 'OVERDUE').length,
  }
  const visible = filter.status ? matched.filter((item) => item.displayStatus === filter.status) : matched
  const direction = filter.sortDirection === 'asc' ? 1 : -1
  const sortKey = filter.sortBy ?? 'requestedAt'
  visible.sort((a, b) => {
    const aValue = String(a[sortKey as keyof typeof a] ?? '')
    const bValue = String(b[sortKey as keyof typeof b] ?? '')
    return aValue.localeCompare(bValue, 'ko', { numeric: true }) * direction
  })
  const totalItems = visible.length
  const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize))
  const safePage = Math.min(filter.page, totalPages)
  const start = (safePage - 1) * filter.pageSize
  return {
    items: structuredClone(visible.slice(start, start + filter.pageSize)),
    page: safePage,
    pageSize: filter.pageSize,
    totalItems,
    totalPages,
    counts,
    hasAny,
  }
}

export const rentalService: RentalService = {
  async createFromApprovedReservation(reservation) {
    if (!useFirestoreRentals()) return
    const reservationId = String(reservation.id)
    try {
      const existing = await findFirestoreRentalByReservationId(reservationId)
      if (existing) return
      const now = nowLocalIso()
      await createFirestoreRental({
        rentalNumber: nextRentalNumber(),
        reservationId,
        reservationNumber: reservation.reservationNumber,
        resourceId: String(reservation.resourceId),
        resourceName: reservation.resourceName,
        resourceCode: reservation.resourceCode,
        resourceCategoryId: reservation.resourceCategoryId,
        resourceCategoryName: reservation.resourceCategoryName,
        userId: String(reservation.userId),
        userName: reservation.userName,
        userEmail: reservation.userEmail,
        quantity: reservation.quantity,
        requestedAt: now,
        dueAt: reservation.endAt,
        status: 'REQUESTED',
      })
    } catch (error) {
      mapFirestoreError(error)
    }
  },

  async getRentals(filter) {
    if (!useFirestoreRentals()) {
      await wait()
      return paginateRentals(filter, rentals.map(toListItem))
    }
    try {
      const records = await listFirestoreRentals()
      const items = records.map(({ item, denormalized }) => toFirestoreRentalListItem(item, denormalized))
      return paginateRentals(filter, items)
    } catch (error) {
      mapFirestoreError(error)
    }
  },

  async getRental(id) {
    const rentalId = normalizeId(id)
    if (!useFirestoreRentals()) {
      await wait()
      const item = rentals.find((entry) => String(entry.id) === rentalId)
      return item ? structuredClone(toDetail(item)) : null
    }
    try {
      const record = await getFirestoreRentalRecord(rentalId)
      if (!record) return null
      return structuredClone(await toFirestoreDetail(record))
    } catch (error) {
      mapFirestoreError(error)
    }
  },

  async processRental(id, note) {
    await assertAdminMutation()
    const rentalId = normalizeId(id)
    const now = nowLocalIso()
    const adminUid = getAdminActorId()

    if (!useFirestoreRentals()) {
      await wait()
      const current = getRequired(id)
      if (current.status !== 'REQUESTED') throw new Error('INVALID_STATUS')
      const rental = replaceRental({
        ...current,
        status: 'RENTED',
        rentedAt: now,
        processedBy: adminUid ?? 1,
        rentalProcessedAt: now,
        checkoutNote: note?.trim() || '관리자가 대여 처리를 완료했습니다.',
        updatedAt: now,
      })
      return { rental: structuredClone(rental), message: '대여 처리를 완료했습니다.' }
    }

    try {
      const current = await getFirestoreRentalRecord(rentalId)
      if (!current || current.item.status !== 'REQUESTED') throw new Error('INVALID_STATUS')
      const updated = await patchFirestoreRental(rentalId, {
        status: 'RENTED',
        rentedAt: now,
        rentalDate: now.slice(0, 10),
        processedBy: adminUid,
        rentalProcessedAt: now,
        checkoutNote: note?.trim() || '관리자가 대여 처리를 완료했습니다.',
      })
      await syncResourceStatus(String(updated.item.resourceId), 'RENTED')
      const detail = await toFirestoreDetail(updated)
      return { rental: detail, message: '대여 처리를 완료했습니다.' }
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_STATUS') throw error
      mapFirestoreError(error)
    }
  },

  async processReturn(id, payload) {
    await assertAdminMutation()
    const rentalId = normalizeId(id)
    const now = nowLocalIso()
    const adminUid = getAdminActorId()

    if (!useFirestoreRentals()) {
      await wait()
      const current = getRequired(id)
      const displayStatus = getRentalDisplayStatus(current)
      if (!['RENTED', 'RETURN_REQUESTED', 'OVERDUE'].includes(displayStatus)) {
        throw new Error('INVALID_STATUS')
      }
      if (payload.returnedQuantity < 0 || payload.returnedQuantity > current.quantity) {
        throw new Error('INVALID_QUANTITY')
      }
      const rental = replaceRental({
        ...current,
        status: 'RETURNED',
        returnedAt: payload.returnedAt,
        returnedQuantity: payload.returnedQuantity,
        returnStatus: payload.returnStatus,
        returnNote: payload.returnNote,
        returnProcessedBy: adminUid ?? 1,
        returnProcessedAt: now,
        updatedAt: now,
      })
      return { rental: structuredClone(rental), message: '반납 처리를 완료했습니다.' }
    }

    try {
      const current = await getFirestoreRentalRecord(rentalId)
      if (!current) throw new Error('RENTAL_NOT_FOUND')
      const displayStatus = getRentalDisplayStatus(current.item)
      if (!['RENTED', 'RETURN_REQUESTED', 'OVERDUE'].includes(displayStatus)) {
        throw new Error('INVALID_STATUS')
      }
      if (payload.returnedQuantity < 0 || payload.returnedQuantity > current.item.quantity) {
        throw new Error('INVALID_QUANTITY')
      }
      const updated = await patchFirestoreRental(rentalId, {
        status: 'RETURNED',
        returnedAt: payload.returnedAt,
        returnDate: payload.returnedAt.slice(0, 10),
        returnedQuantity: payload.returnedQuantity,
        returnStatus: payload.returnStatus,
        returnNote: payload.returnNote,
        returnProcessedBy: adminUid,
        returnProcessedAt: now,
      })
      await syncResourceStatus(String(updated.item.resourceId), 'AVAILABLE')
      const detail = await toFirestoreDetail(updated)
      return { rental: detail, message: '반납 처리를 완료했습니다.' }
    } catch (error) {
      if (
        error instanceof Error &&
        ['INVALID_STATUS', 'INVALID_QUANTITY', 'RENTAL_NOT_FOUND'].includes(error.message)
      ) {
        throw error
      }
      mapFirestoreError(error)
    }
  },

  async getMyRentals(filter) {
    if (!useFirestoreRentals()) {
      await wait()
      const userId = currentApplicant().id
      const owned = rentals.filter((item) => String(item.userId) === String(userId))
      return buildMyHistory(filter, owned.map(toUserListItem), owned.length > 0)
    }
    try {
      const records = await listFirestoreRentalsByUser(mockApplicantId())
      const owned = records.map(({ item, denormalized }) => toFirestoreRentalListItem(item, denormalized))
      return buildMyHistory(filter, owned, records.length > 0)
    } catch (error) {
      mapFirestoreError(error)
    }
  },

  async getMyRental(id) {
    const rentalId = normalizeId(id)
    if (!useFirestoreRentals()) {
      await wait()
      const item = rentals.find(
        (entry) => String(entry.id) === rentalId && String(entry.userId) === String(currentApplicant().id),
      )
      return item ? structuredClone(toUserDetail(item)) : null
    }
    try {
      const record = await getFirestoreRentalRecord(rentalId)
      if (!record || normalizeId(record.item.userId) !== mockApplicantId()) return null
      return structuredClone(await toFirestoreDetail(record))
    } catch (error) {
      mapFirestoreError(error)
    }
  },

  async requestReturn(id, form) {
    if (!form.dueDate) throw new Error('DUE_DATE_REQUIRED')
    const rentalId = normalizeId(id)
    const now = nowLocalIso()

    if (!useFirestoreRentals()) {
      await wait()
      const current = getRequired(id)
      if (String(current.userId) !== String(currentApplicant().id)) throw new Error('RENTAL_NOT_FOUND')
      const displayStatus = getUserRentalDisplayStatus(current)
      if (displayStatus !== 'RENTED' && displayStatus !== 'OVERDUE') throw new Error('INVALID_STATUS')
      const dueTime = current.dueAt.slice(11, 19) || '18:00:00'
      replaceRental({
        ...current,
        status: 'RETURN_REQUESTED',
        dueAt: `${form.dueDate}T${dueTime}+09:00`,
        returnRequestedAt: now,
        returnNote: form.note.trim() || null,
        updatedAt: now,
      })
      return { rental: structuredClone(toUserDetail(getRequired(id))), message: '반납을 신청했습니다.' }
    }

    try {
      const current = await getFirestoreRentalRecord(rentalId)
      if (!current || normalizeId(current.item.userId) !== mockApplicantId()) {
        throw new Error('RENTAL_NOT_FOUND')
      }
      const displayStatus = getUserRentalDisplayStatus(current.item)
      if (displayStatus !== 'RENTED' && displayStatus !== 'OVERDUE') throw new Error('INVALID_STATUS')
      const dueTime = current.item.dueAt.slice(11, 19) || '18:00:00'
      const dueAt = `${form.dueDate}T${dueTime}+09:00`
      const patched = await patchFirestoreRental(rentalId, {
        status: 'RETURN_REQUESTED',
        dueAt,
        returnRequestedAt: now,
        returnNote: form.note.trim() || null,
      })
      const detail = await toFirestoreDetail(patched)
      return { rental: detail, message: '반납을 신청했습니다.' }
    } catch (error) {
      if (
        error instanceof Error &&
        ['DUE_DATE_REQUIRED', 'RENTAL_NOT_FOUND', 'INVALID_STATUS'].includes(error.message)
      ) {
        throw error
      }
      mapFirestoreError(error)
    }
  },
}

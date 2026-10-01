import { reservationsMock, reservationUsers } from '../data/reservationMock'

import { useFirestoreReservations } from '../config/backendMode'

import { useAdminSessionStore } from '../stores/adminSessionStore'

import { hasAdminRole } from '../stores/userSessionStore'

import { demoUserName } from '../stores/userSessionStore'

import type {

  EntityId,

  PaginatedResponse,

  Reservation,

  ReservationActionResult,

  ReservationApplicant,

  ReservationAvailability,

  ReservationAvailabilityQuery,

  ReservationCreateRequest,

  ReservationCreateResult,

  ReservationDetail,

  ReservationFilter,

  ReservationHistoryFilter,

  ReservationHistoryResult,

  ReservationListItem,

} from '../types'

import { nextPreviewReservationNumber, nextReservationNumber } from '../utils/reservationPreview'

import { authService } from './authService'

import {

  createFirestoreReservation,

  getFirestoreReservationRecord,

  listFirestoreReservations,

  listFirestoreReservationsByResource,

  listFirestoreReservationsByUser,

  patchFirestoreReservation,

  ReservationFirestoreError,

} from './reservationFirestoreRepository'

import {

  toFirestoreListItem,

  toMockDetail,

  toMockListItem,

  toReservationDetail,

} from './reservationMapper'

import { rentalService } from './rentalService'
import { resourceService } from './resourceService'



export class ReservationServiceError extends Error {

  code: string



  constructor(code: string, message: string) {

    super(message)

    this.name = 'ReservationServiceError'

    this.code = code

  }

}



export interface ReservationService {

  getReservations: (filter: ReservationFilter) => Promise<PaginatedResponse<ReservationListItem>>

  getReservation: (id: EntityId | string) => Promise<ReservationDetail | null>

  approveReservation: (id: EntityId | string) => Promise<ReservationActionResult>

  rejectReservation: (id: EntityId | string, reason: string) => Promise<ReservationActionResult>

  cancelReservation: (id: EntityId | string, reason?: string) => Promise<ReservationActionResult>

  getApplicant: () => Promise<ReservationApplicant>

  checkReservationAvailability: (query: ReservationAvailabilityQuery) => Promise<ReservationAvailability>

  createReservation: (request: ReservationCreateRequest) => Promise<ReservationCreateResult>

  getMyReservations: (filter: ReservationHistoryFilter) => Promise<ReservationHistoryResult>

  getMyReservation: (id: EntityId | string) => Promise<ReservationDetail | null>

  cancelMyReservation: (id: EntityId | string, reason: string) => Promise<ReservationActionResult>

}



let reservations = structuredClone(reservationsMock)

const mockProcessorName = '김관리'

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

  if (error instanceof ReservationFirestoreError) {

    throw new ReservationServiceError(error.code, error.message)

  }

  throw error

}



async function assertAdminMutation() {

  const { isAuthenticated, role } = useAdminSessionStore.getState()

  if (!isAuthenticated || !hasAdminRole(role)) {

    throw new ReservationServiceError('FORBIDDEN', '관리자만 처리할 수 있습니다.')

  }

}



function getAdminActorId(): string | null {

  return useAdminSessionStore.getState().firebaseUid ?? authService.getFirebaseUser()?.uid ?? null

}



function mockApplicantId(): string {

  return String(currentMockApplicant().id)

}



function currentMockApplicant() {

  return reservationUsers.find((entry) => entry.name === demoUserName) ?? reservationUsers[0]

}



function rangesOverlap(startAt: string, endAt: string, otherStart: string, otherEnd: string) {

  return startAt < otherEnd && endAt > otherStart

}



function isBlockingStatus(status: Reservation['status']) {

  return status === 'PENDING' || status === 'APPROVED'

}



function paginateList<T extends ReservationListItem>(

  filter: ReservationFilter,

  source: T[],

): PaginatedResponse<T> {

  const keyword = filter.keyword.trim().toLocaleLowerCase()

  let filtered = source.filter((item) => {

    const matchesKeyword =

      !keyword ||

      item.reservationNumber.toLocaleLowerCase().includes(keyword) ||

      item.userName.toLocaleLowerCase().includes(keyword) ||

      item.userEmail.toLocaleLowerCase().includes(keyword) ||

      item.resourceName.toLocaleLowerCase().includes(keyword)

    const appliedDate = item.createdAt.slice(0, 10)



    return (

      matchesKeyword &&

      (!filter.status || item.status === filter.status) &&

      (!filter.categoryId || item.resourceCategoryId === filter.categoryId) &&

      (!filter.periodStart || item.endAt.slice(0, 10) >= filter.periodStart) &&

      (!filter.periodEnd || item.startAt.slice(0, 10) <= filter.periodEnd) &&

      (!filter.appliedDate || appliedDate === filter.appliedDate)

    )

  })



  const direction = filter.sortDirection === 'asc' ? 1 : -1

  const sortKey = filter.sortBy ?? 'createdAt'

  filtered = filtered.sort((a, b) => {

    const aValue = String(a[sortKey as keyof ReservationListItem] ?? '')

    const bValue = String(b[sortKey as keyof ReservationListItem] ?? '')

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



async function readAvailability(query: ReservationAvailabilityQuery): Promise<ReservationAvailability> {

  const resourceId = normalizeId(query.resourceId)

  const resource = await resourceService.getResource(resourceId)

  if (!resource || resource.status !== 'AVAILABLE') {

    return { status: 'unavailable', message: '현재 이용할 수 없는 자원입니다.' }

  }



  let blocked = false

  if (useFirestoreReservations()) {

    try {

      const records = await listFirestoreReservationsByResource(resourceId)

      blocked = records.some(

        (item) =>

          isBlockingStatus(item.status) &&

          rangesOverlap(query.startAt, query.endAt, item.startAt, item.endAt),

      )

    } catch (error) {

      mapFirestoreError(error)

    }

  } else {

    blocked = reservations.some(

      (item) =>

        normalizeId(item.resourceId) === resourceId &&

        isBlockingStatus(item.status) &&

        rangesOverlap(query.startAt, query.endAt, item.startAt, item.endAt),

    )

  }



  if (blocked) {

    return { status: 'unavailable', message: '선택한 일정에는 이미 예약이 존재합니다.' }

  }

  return { status: 'available', message: '선택한 일정에 예약 가능한 자원입니다.' }

}



function replaceMockReservation(next: Reservation) {

  reservations = reservations.map((item) => (item.id === next.id ? next : item))

  return toMockDetail(next, mockProcessorName)

}



function getMockRequired(id: EntityId | string) {

  const item = reservations.find((entry) => normalizeId(entry.id) === normalizeId(id))

  if (!item) throw new Error('RESERVATION_NOT_FOUND')

  return item

}



async function recordToDetail(record: Awaited<ReturnType<typeof getFirestoreReservationRecord>>) {

  if (!record) return null

  const listItem = toFirestoreListItem(record.item, record.denormalized)

  return structuredClone(await toReservationDetail(record.item, listItem, mockProcessorName))

}



export const reservationService: ReservationService = {

  async getReservations(filter) {

    if (!useFirestoreReservations()) {

      await wait()

      return paginateList(filter, reservations.map(toMockListItem))

    }

    try {

      const records = await listFirestoreReservations()

      const items = records.map(({ item, denormalized }) => toFirestoreListItem(item, denormalized))

      return paginateList(filter, items)

    } catch (error) {

      mapFirestoreError(error)

    }

  },



  async getReservation(id) {

    const reservationId = normalizeId(id)

    if (!useFirestoreReservations()) {

      await wait()

      const item = reservations.find((entry) => normalizeId(entry.id) === reservationId)

      return item ? structuredClone(toMockDetail(item, mockProcessorName)) : null

    }

    try {

      const record = await getFirestoreReservationRecord(reservationId)

      return recordToDetail(record)

    } catch (error) {

      mapFirestoreError(error)

    }

  },



  async approveReservation(id) {

    await assertAdminMutation()

    const reservationId = normalizeId(id)

    const now = nowLocalIso()

    const adminUid = getAdminActorId()



    if (!useFirestoreReservations()) {

      await wait()

      const current = getMockRequired(id)

      if (current.status !== 'PENDING') throw new Error('INVALID_STATUS')

      const reservation = replaceMockReservation({

        ...current,

        status: 'APPROVED',

        reviewedBy: adminUid ?? 1,

        reviewedAt: now,

        processedAt: now,

        updatedAt: now,

      })

      return { reservation: structuredClone(reservation), message: '예약을 승인했습니다.' }

    }



    try {

      const current = await getFirestoreReservationRecord(reservationId)

      if (!current || current.item.status !== 'PENDING') throw new Error('INVALID_STATUS')

      const updated = await patchFirestoreReservation(reservationId, {

        status: 'APPROVED',

        reviewedBy: adminUid,

        reviewedAt: now,

        processedAt: now,

      })

      const detail = await recordToDetail({ item: updated, denormalized: current.denormalized })

      if (!detail) throw new Error('RESERVATION_NOT_FOUND')

      await rentalService.createFromApprovedReservation(detail)

      return { reservation: detail, message: '예약을 승인했습니다.' }

    } catch (error) {

      if (error instanceof Error && error.message === 'INVALID_STATUS') throw error

      mapFirestoreError(error)

    }

  },



  async rejectReservation(id, reason) {

    await assertAdminMutation()

    if (!reason.trim()) throw new Error('REASON_REQUIRED')

    const reservationId = normalizeId(id)

    const now = nowLocalIso()

    const adminUid = getAdminActorId()



    if (!useFirestoreReservations()) {

      await wait()

      const current = getMockRequired(id)

      if (current.status !== 'PENDING') throw new Error('INVALID_STATUS')

      const reservation = replaceMockReservation({

        ...current,

        status: 'REJECTED',

        reviewedBy: adminUid ?? 1,

        reviewedAt: now,

        rejectionReason: reason.trim(),

        processedAt: now,

        updatedAt: now,

      })

      return { reservation: structuredClone(reservation), message: '예약을 반려했습니다.' }

    }



    try {

      const current = await getFirestoreReservationRecord(reservationId)

      if (!current || current.item.status !== 'PENDING') throw new Error('INVALID_STATUS')

      const updated = await patchFirestoreReservation(reservationId, {

        status: 'REJECTED',

        reviewedBy: adminUid,

        reviewedAt: now,

        rejectionReason: reason.trim(),

        processedAt: now,

      })

      const detail = await recordToDetail({ item: updated, denormalized: current.denormalized })

      if (!detail) throw new Error('RESERVATION_NOT_FOUND')

      return { reservation: detail, message: '예약을 반려했습니다.' }

    } catch (error) {

      if (error instanceof Error && (error.message === 'INVALID_STATUS' || error.message === 'REASON_REQUIRED')) {

        throw error

      }

      mapFirestoreError(error)

    }

  },



  async cancelReservation(id, reason) {

    await assertAdminMutation()

    const reservationId = normalizeId(id)

    const now = nowLocalIso()

    const adminUid = getAdminActorId()



    if (!useFirestoreReservations()) {

      await wait()

      const current = getMockRequired(id)

      if (current.status !== 'PENDING' && current.status !== 'APPROVED') throw new Error('INVALID_STATUS')

      const reservation = replaceMockReservation({

        ...current,

        status: 'CANCELLED',

        reviewedBy: adminUid ?? 1,

        cancelledAt: now,

        cancellationReason: reason?.trim() || '관리자에 의해 취소되었습니다.',

        processedAt: now,

        updatedAt: now,

      })

      return { reservation: structuredClone(reservation), message: '예약을 취소했습니다.' }

    }



    try {

      const current = await getFirestoreReservationRecord(reservationId)

      if (!current || (current.item.status !== 'PENDING' && current.item.status !== 'APPROVED')) {

        throw new Error('INVALID_STATUS')

      }

      const updated = await patchFirestoreReservation(reservationId, {

        status: 'CANCELLED',

        reviewedBy: adminUid,

        cancelledAt: now,

        cancellationReason: reason?.trim() || '관리자에 의해 취소되었습니다.',

        processedAt: now,

      })

      const detail = await recordToDetail({ item: updated, denormalized: current.denormalized })

      if (!detail) throw new Error('RESERVATION_NOT_FOUND')

      return { reservation: detail, message: '예약을 취소했습니다.' }

    } catch (error) {

      if (error instanceof Error && error.message === 'INVALID_STATUS') throw error

      mapFirestoreError(error)

    }

  },



  async getApplicant() {

    if (!useFirestoreReservations()) await wait()

    const user = currentMockApplicant()

    return {

      userId: user.id,

      name: user.name,

      email: user.email,

      phone: user.phone,

      organization: user.organization,

    }

  },



  async checkReservationAvailability(query) {

    if (!useFirestoreReservations()) await wait()

    return readAvailability(query)

  },



  async createReservation(request) {

    const availability = await readAvailability(request)

    if (availability.status !== 'available') {

      throw new ReservationServiceError('RESERVATION_OVERLAP', availability.message)

    }



    if (!useFirestoreReservations()) {

      await wait()

      const user = currentMockApplicant()

      if (normalizeId(request.userId) !== normalizeId(user.id)) {

        throw new ReservationServiceError('FORBIDDEN', '본인 계정으로만 예약할 수 있습니다.')

      }

      const resource = await resourceService.getResource(request.resourceId)

      if (!resource) throw new Error('RESERVATION_CREATE_FAILED')

      const now = nowLocalIso()

      const nextId = Math.max(...reservations.map((item) => Number(item.id)), 1000) + 1

      const created: Reservation = {

        id: nextId,

        reservationNumber: nextPreviewReservationNumber(),

        resourceId: request.resourceId,

        userId: user.id,

        startAt: request.startAt,

        endAt: request.endAt,

        quantity: 1,

        purpose: request.purpose,

        requestNote: request.requestNote,

        usageLocation: request.usageLocation,

        status: 'PENDING',

        reviewedBy: null,

        reviewedAt: null,

        rejectionReason: null,

        cancelledAt: null,

        cancellationReason: null,

        processedAt: null,

        createdAt: now,

        updatedAt: now,

      }

      reservations = [created, ...reservations]

      return {

        reservationNumber: created.reservationNumber,

        resourceName: resource.name,

        startAt: created.startAt,

        endAt: created.endAt,

        status: created.status,

      }

    }



    const applicant = currentMockApplicant()

    if (normalizeId(request.userId) !== normalizeId(applicant.id)) {

      throw new ReservationServiceError('FORBIDDEN', '본인 계정으로만 예약할 수 있습니다.')

    }



    const resource = await resourceService.getResource(String(request.resourceId))

    if (!resource) {

      throw new ReservationServiceError('RESOURCE_NOT_FOUND', '자원을 찾을 수 없습니다.')

    }



    try {

      const created = await createFirestoreReservation({

        reservationNumber: nextReservationNumber(),

        resourceId: String(request.resourceId),

        resourceName: resource.name,

        resourceCode: resource.resourceCode,

        resourceCategoryId: resource.categoryId,

        resourceCategoryName:

          (await resourceService.getOptions()).categories.find((c) => c.id === resource.categoryId)?.name ??

          '미분류',

        userId: mockApplicantId(),

        userName: applicant.name,

        userEmail: applicant.email,

        startAt: request.startAt,

        endAt: request.endAt,

        quantity: 1,

        purpose: request.purpose,

        requestNote: request.requestNote,

        usageLocation: request.usageLocation,

        status: 'PENDING',

        notificationAgreed: request.notificationAgreed,

      })

      return {

        reservationNumber: created.reservationNumber,

        resourceName: resource.name,

        startAt: created.startAt,

        endAt: created.endAt,

        status: created.status,

      }

    } catch (error) {

      mapFirestoreError(error)

    }

  },



  async getMyReservations(filter) {

    if (!useFirestoreReservations()) {

      await wait()

      const userId = currentMockApplicant().id

      const owned = reservations.filter((item) => normalizeId(item.userId) === normalizeId(userId))

      return buildMyHistory(filter, owned.map(toMockListItem), owned.length > 0)

    }



    try {

      const records = await listFirestoreReservationsByUser(mockApplicantId())

      const owned = records.map(({ item, denormalized }) => toFirestoreListItem(item, denormalized))

      return buildMyHistory(filter, owned, records.length > 0)

    } catch (error) {

      mapFirestoreError(error)

    }

  },



  async getMyReservation(id) {

    const reservationId = normalizeId(id)

    if (!useFirestoreReservations()) {

      await wait()

      const userId = currentMockApplicant().id

      const item = reservations.find(

        (entry) => normalizeId(entry.id) === reservationId && normalizeId(entry.userId) === normalizeId(userId),

      )

      return item ? structuredClone(toMockDetail(item, mockProcessorName)) : null

    }



    try {

      const record = await getFirestoreReservationRecord(reservationId)

      if (!record || normalizeId(record.item.userId) !== mockApplicantId()) return null

      return recordToDetail(record)

    } catch (error) {

      mapFirestoreError(error)

    }

  },



  async cancelMyReservation(id, reason) {

    if (!reason.trim()) throw new Error('REASON_REQUIRED')

    const reservationId = normalizeId(id)

    const now = nowLocalIso()



    if (!useFirestoreReservations()) {

      await wait()

      const current = getMockRequired(id)

      if (normalizeId(current.userId) !== normalizeId(currentMockApplicant().id)) {

        throw new Error('RESERVATION_NOT_FOUND')

      }

      if (current.status !== 'PENDING' && current.status !== 'APPROVED') throw new Error('INVALID_STATUS')

      const reservation = replaceMockReservation({

        ...current,

        status: 'CANCELLED',

        reviewedBy: current.userId,

        cancelledAt: now,

        cancellationReason: reason.trim(),

        processedAt: now,

        updatedAt: now,

      })

      return { reservation: structuredClone(reservation), message: '예약을 취소했습니다.' }

    }



    try {

      const current = await getFirestoreReservationRecord(reservationId)

      if (!current || normalizeId(current.item.userId) !== mockApplicantId()) {

        throw new Error('RESERVATION_NOT_FOUND')

      }

      if (current.item.status !== 'PENDING' && current.item.status !== 'APPROVED') {

        throw new Error('INVALID_STATUS')

      }

      const updated = await patchFirestoreReservation(reservationId, {

        status: 'CANCELLED',

        reviewedBy: mockApplicantId(),

        cancelledAt: now,

        cancellationReason: reason.trim(),

        processedAt: now,

      })

      const detail = await recordToDetail({ item: updated, denormalized: current.denormalized })

      if (!detail) throw new Error('RESERVATION_NOT_FOUND')

      return { reservation: detail, message: '예약을 취소했습니다.' }

    } catch (error) {

      if (error instanceof Error && ['REASON_REQUIRED', 'INVALID_STATUS', 'RESERVATION_NOT_FOUND'].includes(error.message)) {

        throw error

      }

      mapFirestoreError(error)

    }

  },

}



function buildMyHistory(

  filter: ReservationHistoryFilter,

  matchedSource: ReservationListItem[],

  hasAny: boolean,

): ReservationHistoryResult {

  const keyword = filter.keyword.trim().toLocaleLowerCase()

  const matched = matchedSource.filter((item) => {

    const matchesKeyword =

      !keyword ||

      item.reservationNumber.toLocaleLowerCase().includes(keyword) ||

      item.resourceName.toLocaleLowerCase().includes(keyword)

    return (

      matchesKeyword &&

      (!filter.categoryId || item.resourceCategoryId === filter.categoryId) &&

      (!filter.periodStart || item.endAt.slice(0, 10) >= filter.periodStart) &&

      (!filter.periodEnd || item.startAt.slice(0, 10) <= filter.periodEnd)

    )

  })

  const counts = {

    ALL: matched.length,

    PENDING: matched.filter((item) => item.status === 'PENDING').length,

    APPROVED: matched.filter((item) => item.status === 'APPROVED').length,

    REJECTED: matched.filter((item) => item.status === 'REJECTED').length,

    CANCELLED: matched.filter((item) => item.status === 'CANCELLED').length,

    COMPLETED: matched.filter((item) => item.status === 'COMPLETED').length,

  }

  const visible = filter.status ? matched.filter((item) => item.status === filter.status) : matched

  const direction = filter.sortDirection === 'asc' ? 1 : -1

  const sortKey = filter.sortBy ?? 'createdAt'

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


import {

  resourceCategories,

  resourceHistories,

  resourceLocations,

  resourceManagers,

  resourcesMock,

  resourceTypes,

} from '../data/resourceMock'

import { resourceFirestoreSeedPayloads } from '../data/resourceFirestoreSeed'

import { resourceUsageCount } from '../data/resourceUsage'

import { useFirestoreResources } from '../config/backendMode'

import type {

  EntityId,

  PaginatedResponse,

  RelatedResource,

  Resource,

  ResourceCategory,

  ResourceDetail,

  ResourceFilter,

  ResourceListItem,

  ResourceManager,

  ResourcePayload,

  ResourceType,

} from '../types'

import { matchesResourceGroup } from '../utils/resourceGroup'

import {

  createFirestoreResource,

  deleteFirestoreResource,

  getFirestoreResource,

  listFirestoreResources,

  ResourceFirestoreError,

  updateFirestoreResource,

} from './resourceFirestoreRepository'

import { useAdminSessionStore } from '../stores/adminSessionStore'
import { hasAdminRole } from '../stores/userSessionStore'



export interface ResourceOptions {

  categories: ResourceCategory[]

  types: ResourceType[]

  managers: ResourceManager[]

  locations: string[]

}



export class ResourceServiceError extends Error {

  code: string



  constructor(code: string, message: string) {

    super(message)

    this.name = 'ResourceServiceError'

    this.code = code

  }

}



export interface ResourceService {

  getResources: (filter: ResourceFilter) => Promise<PaginatedResponse<ResourceListItem>>

  getResource: (id: EntityId | string) => Promise<ResourceDetail | null>

  getRelatedResources: (id: EntityId | string) => Promise<RelatedResource[]>

  getOptions: () => Promise<ResourceOptions>

  createResource: (payload: ResourcePayload) => Promise<ResourceDetail>

  updateResource: (id: EntityId | string, payload: ResourcePayload) => Promise<ResourceDetail>

  deleteResource: (id: EntityId | string) => Promise<void>

  /** Firestore가 비어 있을 때 관리자가 초기 샘플을 등록할 때 사용(선택). */

  seedInitialResources: () => Promise<number>

}



export type ResourceRecordId = EntityId | string



let mockResources = structuredClone(resourcesMock)



const wait = () => new Promise((resolve) => window.setTimeout(resolve, 140))



async function assertAdminMutation() {
  const { isAuthenticated, role } = useAdminSessionStore.getState()
  if (!isAuthenticated || !hasAdminRole(role)) {
    throw new ResourceServiceError('FORBIDDEN', '자원 등록·수정·삭제는 관리자만 가능합니다.')
  }
}



function normalizeResourceId(id: ResourceRecordId): string {

  return String(id)

}



function toListItem(item: Resource): ResourceListItem {

  return {

    ...item,

    categoryName:

      resourceCategories.find((category) => category.id === item.categoryId)?.name ?? '미분류',

    typeName: resourceTypes.find((type) => type.code === item.type)?.name ?? item.type,

    managerName:

      resourceManagers.find((manager) => manager.id === item.managerId)?.name ?? '미지정',

    usageCount: resourceUsageCount(item.id),

  }

}



function toDetail(item: Resource): ResourceDetail {

  const resourceKey = normalizeResourceId(item.id)

  return {

    ...toListItem(item),

    histories: resourceHistories.filter(

      (history) => String(history.resourceId) === resourceKey,

    ),

  }

}



function paginateResources(filter: ResourceFilter, source: ResourceListItem[]): PaginatedResponse<ResourceListItem> {

  const keyword = filter.keyword.trim().toLocaleLowerCase()

  let filtered = source.filter((item) => {

    const matchesKeyword =

      !keyword ||

      item.name.toLocaleLowerCase().includes(keyword) ||

      item.resourceCode.toLocaleLowerCase().includes(keyword) ||

      item.typeName.toLocaleLowerCase().includes(keyword) ||

      item.categoryName.toLocaleLowerCase().includes(keyword) ||

      item.managerName.toLocaleLowerCase().includes(keyword)



    return (

      matchesKeyword &&

      (!filter.categoryId || item.categoryId === filter.categoryId) &&

      (!filter.type || item.type === filter.type) &&

      (!filter.status || item.status === filter.status) &&

      (!filter.location || item.location === filter.location) &&

      matchesResourceGroup(item.type, filter.group ?? '') &&

      (filter.available == null || (filter.available ? item.status === 'AVAILABLE' : item.status !== 'AVAILABLE'))

    )

  })



  filtered = filtered.sort((a, b) => {

    if (filter.sortBy === 'availability') {

      const rank = (status: Resource['status']) => (status === 'AVAILABLE' ? 0 : 1)

      const byStatus = rank(a.status) - rank(b.status)

      if (byStatus !== 0) return byStatus

      return a.name.localeCompare(b.name, 'ko')

    }

    if (filter.sortBy === 'usageCount') return b.usageCount - a.usageCount

    const direction = filter.sortDirection === 'asc' ? 1 : -1

    const sortKey = filter.sortBy ?? 'createdAt'

    const aValue = String(a[sortKey as keyof ResourceListItem] ?? '')

    const bValue = String(b[sortKey as keyof ResourceListItem] ?? '')

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



async function loadAllResources(): Promise<Resource[]> {

  if (!useFirestoreResources()) {

    return structuredClone(mockResources)

  }

  try {

    return await listFirestoreResources()

  } catch (error) {

    if (error instanceof ResourceFirestoreError) {

      throw new ResourceServiceError(error.code, error.message)

    }

    throw error

  }

}



function payloadToMockResource(payload: ResourcePayload, id: number, current?: Resource): Resource {

  const now = new Date().toISOString()

  return {

    id,

    resourceCode: payload.resourceCode,

    name: payload.name,

    categoryId: payload.categoryId,

    type: payload.type,

    location: payload.location,

    managerId: payload.managerId,

    totalQuantity: payload.quantity,

    availableQuantity:

      payload.status === 'AVAILABLE'

        ? current

          ? Math.min(current.availableQuantity || payload.quantity, payload.quantity)

          : payload.quantity

        : 0,

    status: payload.status,

    purchaseDate: payload.purchaseDate,

    managementEndDate: payload.managementEndDate,

    description: payload.description,

    imageUrl: payload.imageUrl,

    notes: payload.notes,

    isReservable: payload.status !== 'DISPOSED',

    maxRentalDays: payload.type === 'MEETING_ROOM' ? 1 : 7,

    createdAt: current?.createdAt ?? now,

    updatedAt: now,

  }

}



export const resourceService: ResourceService = {

  async getResources(filter) {

    if (!useFirestoreResources()) await wait()

    const resources = await loadAllResources()

    return paginateResources(filter, resources.map(toListItem))

  },



  async getResource(id) {

    if (!useFirestoreResources()) {

      await wait()

      const item = mockResources.find((resource) => String(resource.id) === normalizeResourceId(id))

      return item ? structuredClone(toDetail(item)) : null

    }

    try {

      const item = await getFirestoreResource(normalizeResourceId(id))

      return item ? structuredClone(toDetail(item)) : null

    } catch (error) {

      if (error instanceof ResourceFirestoreError) {

        throw new ResourceServiceError(error.code, error.message)

      }

      throw error

    }

  },



  async getRelatedResources(id) {

    const resources = await loadAllResources()

    const current = resources.find((resource) => String(resource.id) === normalizeResourceId(id))

    if (!current) return []

    return structuredClone(

      resources

        .filter((resource) => String(resource.id) !== normalizeResourceId(id) && resource.categoryId === current.categoryId)

        .slice(0, 4)

        .map(toListItem),

    )

  },



  async getOptions() {

    if (!useFirestoreResources()) await wait()

    return structuredClone({

      categories: resourceCategories,

      types: resourceTypes,

      managers: resourceManagers,

      locations: resourceLocations,

    })

  },



  async createResource(payload) {

    await assertAdminMutation()

    if (!useFirestoreResources()) {

      await wait()

      const nextId = Math.max(...mockResources.map((item) => Number(item.id)), 0) + 1

      const next = payloadToMockResource(payload, nextId)

      mockResources = [next, ...mockResources]

      return structuredClone(toDetail(next))

    }

    try {

      const created = await createFirestoreResource(payload)

      return structuredClone(toDetail(created))

    } catch (error) {

      if (error instanceof ResourceFirestoreError) {

        throw new ResourceServiceError(error.code, error.message)

      }

      throw error

    }

  },



  async updateResource(id, payload) {

    await assertAdminMutation()

    const resourceId = normalizeResourceId(id)

    if (!useFirestoreResources()) {

      await wait()

      const index = mockResources.findIndex((resource) => String(resource.id) === resourceId)

      if (index < 0) throw new ResourceServiceError('NOT_FOUND', '자원을 찾을 수 없습니다.')

      const next = payloadToMockResource(payload, mockResources[index].id as number, mockResources[index])

      mockResources = mockResources.map((resource) => (String(resource.id) === resourceId ? next : resource))

      return structuredClone(toDetail(next))

    }

    try {

      const updated = await updateFirestoreResource(resourceId, payload)

      return structuredClone(toDetail(updated))

    } catch (error) {

      if (error instanceof ResourceFirestoreError) {

        throw new ResourceServiceError(error.code, error.message)

      }

      throw error

    }

  },



  async deleteResource(id) {

    await assertAdminMutation()

    const resourceId = normalizeResourceId(id)

    if (!useFirestoreResources()) {

      await wait()

      mockResources = mockResources.filter((resource) => String(resource.id) !== resourceId)

      return

    }

    try {

      await deleteFirestoreResource(resourceId)

    } catch (error) {

      if (error instanceof ResourceFirestoreError) {

        throw new ResourceServiceError(error.code, error.message)

      }

      throw error

    }

  },



  async seedInitialResources() {

    await assertAdminMutation()

    if (!useFirestoreResources()) {

      throw new ResourceServiceError('AUTH_NOT_CONFIGURED', 'Firebase가 설정되지 않았습니다.')

    }

    const existing = await listFirestoreResources()
    const existingCodes = new Set(existing.map((item) => item.resourceCode))

    let created = 0

    for (const payload of resourceFirestoreSeedPayloads) {
      if (existingCodes.has(payload.resourceCode)) continue
      await createFirestoreResource(payload)
      existingCodes.add(payload.resourceCode)
      created += 1
    }

    return created

  },

}


import type {
  EntityId,
  ISODate,
  ISODateTime,
  Resource,
  ResourceStatus,
} from './domain'
import type { PaginationParams } from './api'

export interface ResourceType {
  id: EntityId
  categoryId: EntityId
  code: string
  name: string
  isActive: boolean
}

export interface ResourceManager {
  id: EntityId
  name: string
  department: string
}

export interface ResourceListItem extends Resource {
  categoryName: string
  typeName: string
  managerName: string
  usageCount: number
}

export interface ResourceFilter extends PaginationParams {
  keyword: string
  categoryId: EntityId | null
  type: string
  status: ResourceStatus | null
  location: string
  group?: string
  available?: boolean | null
}

export type ResourceListFilter = ResourceFilter
export type RelatedResource = ResourceListItem

export type ResourceHistoryType = 'RESERVATION' | 'RENTAL' | 'INSPECTION' | 'CHANGE'

export interface ResourceHistory {
  id: EntityId
  resourceId: EntityId
  type: ResourceHistoryType
  title: string
  description: string
  actorName: string | null
  occurredAt: ISODateTime
}

export interface ResourceDetail extends ResourceListItem {
  histories: ResourceHistory[]
}

export interface ResourceFormValues {
  name: string
  resourceCode: string
  categoryId: string
  type: string
  location: string
  managerId: string
  quantity: string
  status: ResourceStatus | ''
  purchaseDate: ISODate | ''
  managementEndDate: ISODate | ''
  description: string
  imageUrl: string
  notes: string
}

export interface ResourcePayload {
  name: string
  resourceCode: string
  categoryId: EntityId
  type: string
  location: string
  managerId: EntityId
  quantity: number
  status: ResourceStatus
  purchaseDate: ISODate | null
  managementEndDate: ISODate | null
  description: string | null
  imageUrl: string | null
  notes: string | null
}

export type ResourceFormErrors = Partial<Record<keyof ResourceFormValues, string>>

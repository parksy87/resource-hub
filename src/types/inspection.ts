import type { PaginationParams } from './api'
import type {
  EntityId,
  Inspection,
  InspectionResult,
  InspectionStatus,
  InspectionType,
  ISODate,
  ISODateTime,
  ResourceStatus,
  ReturnCondition,
} from './domain'

export interface InspectionListItem extends Inspection {
  resourceName: string
  resourceCode: string
  resourceStatus: ResourceStatus
  inspectorName: string
  processorName: string | null
  rentalNumber: string | null
}

export interface InspectionFilter extends PaginationParams {
  keyword: string
  status: InspectionStatus | null
  type: InspectionType | null
  result: InspectionResult | null
  periodStart: ISODate | ''
  periodEnd: ISODate | ''
}

export type InspectionHistoryAction = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'REINSPECTION' | 'STATUS_CHANGED'

export interface InspectionHistory {
  id: EntityId
  inspectionId: EntityId
  action: InspectionHistoryAction
  title: string
  description: string | null
  actorName: string
  occurredAt: ISODateTime
}

export interface InspectionChildSummary {
  id: EntityId
  inspectionNumber: string
  status: InspectionStatus
  scheduledDate: ISODate
}

export interface InspectionReturnInfo {
  rentalId: EntityId | string
  rentalNumber: string
  returnedAt: ISODateTime | null
  returnStatus: ReturnCondition | null
  returnedQuantity: number | null
}

export interface InspectionDetail extends InspectionListItem {
  resourceCategoryName: string
  resourceTypeName: string
  resourceLocation: string
  parentInspectionNumber: string | null
  childInspections: InspectionChildSummary[]
  returnInfo: InspectionReturnInfo | null
  linkedResourceStatus: ResourceStatus | null
  pendingDisposal: boolean
  histories: InspectionHistory[]
}

export interface InspectionFormValues {
  resourceId: string
  type: InspectionType | ''
  scheduledDate: string
  inspectorId: string
  content: string
  note: string
  rentalId: string
}

export interface InspectionPayload {
  resourceId: EntityId
  type: InspectionType
  scheduledDate: ISODate
  inspectorId: EntityId
  content: string | null
  note: string | null
  rentalId: EntityId | null
}

export interface InspectionUpdatePayload {
  type: InspectionType
  scheduledDate: ISODate
  inspectorId: EntityId
  content: string | null
  note: string | null
}

export interface InspectionCompletePayload {
  inspectedDate: ISODate
  result: InspectionResult
  issueDescription: string | null
  actionDescription: string | null
  note: string | null
}

export interface InspectionActionResult {
  inspection: InspectionDetail
  message: string
}

export interface InspectionResourceOption {
  id: EntityId
  name: string
  resourceCode: string
}

export interface InspectionRentalOption {
  id: EntityId | string
  rentalNumber: string
  resourceId: EntityId | string
  returnedAt: ISODateTime | null
  returnStatus: ReturnCondition | null
  returnedQuantity: number | null
}

export interface InspectionOptions {
  resources: InspectionResourceOption[]
  managers: Array<{ id: EntityId; name: string; department: string }>
  rentals: InspectionRentalOption[]
}

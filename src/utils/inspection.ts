import type { InspectionResult, InspectionStatus, ResourceStatus } from '../types'

export function canEditInspection(status: InspectionStatus) {
  return status === 'SCHEDULED' || status === 'IN_PROGRESS'
}

export function canCompleteInspection(status: InspectionStatus) {
  return status === 'SCHEDULED' || status === 'IN_PROGRESS'
}

export function canReinspect(status: InspectionStatus) {
  return status === 'COMPLETED' || status === 'REINSPECTION_REQUIRED'
}

export function resolveLinkedResourceStatus(status: InspectionStatus, result: InspectionResult | null) {
  if (status === 'IN_PROGRESS' || status === 'REINSPECTION_REQUIRED') {
    return { resourceStatus: 'INSPECTION' as ResourceStatus, pendingDisposal: false }
  }
  if (status !== 'COMPLETED' || !result) {
    return { resourceStatus: null, pendingDisposal: false }
  }
  if (result === 'NORMAL') return { resourceStatus: 'AVAILABLE' as ResourceStatus, pendingDisposal: false }
  if (result === 'MINOR' || result === 'REPAIR') {
    return { resourceStatus: 'INSPECTION' as ResourceStatus, pendingDisposal: false }
  }
  return { resourceStatus: null, pendingDisposal: true }
}

export function formatInspectionDate(value: string | null) {
  if (!value) return '-'
  const [year, month, day] = value.slice(0, 10).split('-')
  if (!year || !month || !day) return value
  return `${year}. ${month}. ${day}.`
}

export const emptyInspectionForm = {
  resourceId: '',
  type: '' as const,
  scheduledDate: '',
  inspectorId: '',
  content: '',
  note: '',
  rentalId: '',
}

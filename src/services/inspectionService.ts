import { inspectionEventsMock, inspectionsMock } from '../data/inspectionMock'
import { rentalsMock } from '../data/rentalMock'
import { resourceCategories, resourceManagers, resourcesMock, resourceTypes } from '../data/resourceMock'
import type {
  EntityId,
  Inspection,
  InspectionActionResult,
  InspectionCompletePayload,
  InspectionDetail,
  InspectionFilter,
  InspectionHistory,
  InspectionListItem,
  InspectionOptions,
  InspectionPayload,
  InspectionUpdatePayload,
  PaginatedResponse,
} from '../types'
import { resolveLinkedResourceStatus } from '../utils/inspection'

export interface InspectionService {
  getInspections: (filter: InspectionFilter) => Promise<PaginatedResponse<InspectionListItem>>
  getInspection: (id: EntityId) => Promise<InspectionDetail | null>
  getOptions: () => Promise<InspectionOptions>
  createInspection: (payload: InspectionPayload) => Promise<InspectionDetail>
  updateInspection: (id: EntityId, payload: InspectionUpdatePayload) => Promise<InspectionDetail>
  completeInspection: (id: EntityId, payload: InspectionCompletePayload) => Promise<InspectionActionResult>
  reinspect: (id: EntityId, payload: InspectionPayload) => Promise<InspectionActionResult>
}

const processor = { id: 1, name: '김관리' }
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

let inspections = structuredClone(inspectionsMock)
let events = structuredClone(inspectionEventsMock)

function personName(id: EntityId | null) {
  return resourceManagers.find((manager) => manager.id === id)?.name ?? '알 수 없음'
}

function toListItem(item: Inspection): InspectionListItem {
  const resource = resourcesMock.find((entry) => entry.id === item.resourceId)
  const rental = rentalsMock.find((entry) => entry.id === item.rentalId)
  return {
    ...item,
    resourceName: resource?.name ?? '삭제된 자원',
    resourceCode: resource?.resourceCode ?? '-',
    resourceStatus: resource?.status ?? 'INSPECTION',
    inspectorName: personName(item.inspectorId),
    processorName: item.processorId ? processor.name : null,
    rentalNumber: rental?.rentalNumber ?? null,
  }
}

function toDetail(item: Inspection): InspectionDetail {
  const listItem = toListItem(item)
  const resource = resourcesMock.find((entry) => entry.id === item.resourceId)
  const category = resourceCategories.find((entry) => entry.id === resource?.categoryId)
  const type = resourceTypes.find((entry) => entry.code === resource?.type)
  const rental = rentalsMock.find((entry) => entry.id === item.rentalId)
  const parent = inspections.find((entry) => entry.id === item.parentInspectionId)
  const linked = resolveLinkedResourceStatus(item.status, item.result)
  const histories = events
    .filter((event) => event.inspectionId === item.id)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))

  return {
    ...listItem,
    resourceCategoryName: category?.name ?? '미분류',
    resourceTypeName: type?.name ?? resource?.type ?? '-',
    resourceLocation: resource?.location ?? '-',
    parentInspectionNumber: parent?.inspectionNumber ?? null,
    childInspections: inspections
      .filter((entry) => entry.parentInspectionId === item.id)
      .map((entry) => ({
        id: entry.id,
        inspectionNumber: entry.inspectionNumber,
        status: entry.status,
        scheduledDate: entry.scheduledDate,
      })),
    returnInfo: rental
      ? {
          rentalId: rental.id,
          rentalNumber: rental.rentalNumber,
          returnedAt: rental.returnedAt,
          returnStatus: rental.returnStatus,
          returnedQuantity: rental.returnedQuantity,
        }
      : null,
    linkedResourceStatus: linked.resourceStatus,
    pendingDisposal: linked.pendingDisposal,
    histories,
  }
}

function getRequired(id: EntityId) {
  const current = inspections.find((entry) => entry.id === id)
  if (!current) throw new Error('INSPECTION_NOT_FOUND')
  return current
}

function replaceInspection(next: Inspection) {
  inspections = inspections.map((entry) => (entry.id === next.id ? next : entry))
  return toDetail(next)
}

function nextId() {
  return inspections.reduce((max, item) => Math.max(max, item.id), 500) + 1
}

function nextNumber() {
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const sequence = inspections.reduce((max, item) => {
    const matched = item.inspectionNumber.match(/-(\d+)$/)
    return Math.max(max, matched ? Number(matched[1]) : 0)
  }, 0) + 1
  return `INS-${stamp}-${String(sequence).padStart(3, '0')}`
}

function pushEvent(event: Omit<InspectionHistory, 'id'>) {
  events = [...events, { ...event, id: events.reduce((max, item) => Math.max(max, item.id), 0) + 1 }]
}

export const inspectionService: InspectionService = {
  async getInspections(filter) {
    await wait()
    let items = inspections.map(toListItem)
    const keyword = filter.keyword.trim().toLowerCase()
    items = items.filter((item) => {
      const matchesKeyword = !keyword || [item.inspectionNumber, item.resourceName, item.resourceCode, item.inspectorName]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
      return (
        matchesKeyword &&
        (!filter.status || item.status === filter.status) &&
        (!filter.type || item.type === filter.type) &&
        (!filter.result || item.result === filter.result) &&
        (!filter.periodStart || item.scheduledDate >= filter.periodStart) &&
        (!filter.periodEnd || item.scheduledDate <= filter.periodEnd)
      )
    })

    const direction = filter.sortDirection === 'asc' ? 1 : -1
    const sortKey = filter.sortBy ?? 'createdAt'
    items = items.sort((a, b) => String(a[sortKey as keyof InspectionListItem] ?? '').localeCompare(String(b[sortKey as keyof InspectionListItem] ?? ''), 'ko', { numeric: true }) * direction)

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

  async getInspection(id) {
    await wait()
    const item = inspections.find((entry) => entry.id === id)
    return item ? structuredClone(toDetail(item)) : null
  },

  async getOptions() {
    await wait()
    return {
      resources: resourcesMock
        .filter((item) => item.status !== 'DISPOSED')
        .map((item) => ({ id: item.id as number, name: item.name, resourceCode: item.resourceCode })),
      managers: resourceManagers.map((item) => ({ id: item.id, name: item.name, department: item.department })),
      rentals: rentalsMock
        .filter((item) => item.status === 'RETURNED')
        .map((item) => ({
          id: item.id,
          rentalNumber: item.rentalNumber,
          resourceId: item.resourceId,
          returnedAt: item.returnedAt,
          returnStatus: item.returnStatus,
          returnedQuantity: item.returnedQuantity,
        })),
    }
  },

  async createInspection(payload) {
    await wait()
    const now = new Date().toISOString()
    const created: Inspection = {
      id: nextId(),
      inspectionNumber: nextNumber(),
      resourceId: payload.resourceId,
      rentalId: payload.type === 'RETURN' ? payload.rentalId : null,
      parentInspectionId: null,
      type: payload.type,
      status: 'SCHEDULED',
      scheduledDate: payload.scheduledDate,
      inspectedDate: null,
      inspectorId: payload.inspectorId,
      processorId: null,
      result: null,
      content: payload.content,
      issueDescription: null,
      actionDescription: null,
      note: payload.note,
      createdAt: now,
      updatedAt: now,
    }
    inspections = [created, ...inspections]
    pushEvent({
      inspectionId: created.id,
      action: 'CREATED',
      title: '점검 등록',
      description: created.content,
      actorName: processor.name,
      occurredAt: now,
    })
    return structuredClone(toDetail(created))
  },

  async updateInspection(id, payload) {
    await wait()
    const current = getRequired(id)
    if (current.status !== 'SCHEDULED' && current.status !== 'IN_PROGRESS') throw new Error('INVALID_STATUS')
    const now = new Date().toISOString()
    pushEvent({
      inspectionId: id,
      action: 'UPDATED',
      title: '점검 수정',
      description: '점검 일정과 담당 정보를 수정했습니다.',
      actorName: processor.name,
      occurredAt: now,
    })
    const next = replaceInspection({
      ...current,
      type: payload.type,
      scheduledDate: payload.scheduledDate,
      inspectorId: payload.inspectorId,
      content: payload.content,
      note: payload.note,
      updatedAt: now,
    })
    return structuredClone(next)
  },

  async completeInspection(id, payload) {
    await wait()
    const current = getRequired(id)
    if (current.status !== 'SCHEDULED' && current.status !== 'IN_PROGRESS') throw new Error('INVALID_STATUS')
    const now = new Date().toISOString()
    pushEvent({
      inspectionId: id,
      action: 'COMPLETED',
      title: '점검 완료',
      description: payload.actionDescription ?? payload.issueDescription,
      actorName: processor.name,
      occurredAt: now,
    })
    const inspection = replaceInspection({
      ...current,
      status: 'COMPLETED',
      inspectedDate: payload.inspectedDate,
      result: payload.result,
      issueDescription: payload.issueDescription,
      actionDescription: payload.actionDescription,
      note: payload.note ?? current.note,
      processorId: processor.id,
      updatedAt: now,
    })
    return { inspection: structuredClone(inspection), message: '점검 완료 처리했습니다.' }
  },

  async reinspect(id, payload) {
    await wait()
    const parent = getRequired(id)
    if (parent.status !== 'COMPLETED' && parent.status !== 'REINSPECTION_REQUIRED') throw new Error('INVALID_STATUS')
    const now = new Date().toISOString()
    const created: Inspection = {
      id: nextId(),
      inspectionNumber: nextNumber(),
      resourceId: parent.resourceId,
      rentalId: parent.rentalId,
      parentInspectionId: parent.id,
      type: payload.type,
      status: 'SCHEDULED',
      scheduledDate: payload.scheduledDate,
      inspectedDate: null,
      inspectorId: payload.inspectorId,
      processorId: null,
      result: null,
      content: payload.content,
      issueDescription: null,
      actionDescription: null,
      note: payload.note,
      createdAt: now,
      updatedAt: now,
    }
    inspections = [created, ...inspections]
    pushEvent({
      inspectionId: created.id,
      action: 'CREATED',
      title: '재점검 등록',
      description: `${parent.inspectionNumber} 점검을 참고해 등록했습니다.`,
      actorName: processor.name,
      occurredAt: now,
    })
    pushEvent({
      inspectionId: parent.id,
      action: 'REINSPECTION',
      title: '재점검 등록',
      description: `${created.inspectionNumber} 재점검이 등록되었습니다.`,
      actorName: processor.name,
      occurredAt: now,
    })
    return { inspection: structuredClone(toDetail(created)), message: '재점검을 등록했습니다.' }
  },
}

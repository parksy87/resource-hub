import type {
  ResourceDetail,
  ResourceFormValues,
  ResourcePayload,
  ResourceStatus,
} from '../types'

export const emptyResourceForm: ResourceFormValues = {
  name: '',
  resourceCode: '',
  categoryId: '',
  type: '',
  location: '',
  managerId: '',
  quantity: '1',
  status: 'AVAILABLE',
  purchaseDate: '',
  managementEndDate: '',
  description: '',
  imageUrl: '',
  notes: '',
}

export function resourceToFormValues(resource: ResourceDetail): ResourceFormValues {
  return {
    name: resource.name,
    resourceCode: resource.resourceCode,
    categoryId: String(resource.categoryId),
    type: resource.type,
    location: resource.location,
    managerId: String(resource.managerId ?? ''),
    quantity: String(resource.totalQuantity),
    status: resource.status,
    purchaseDate: resource.purchaseDate ?? '',
    managementEndDate: resource.managementEndDate ?? '',
    description: resource.description ?? '',
    imageUrl: resource.imageUrl ?? '',
    notes: resource.notes ?? '',
  }
}

export function resourceFormToPayload(values: ResourceFormValues): ResourcePayload {
  return {
    name: values.name.trim(),
    resourceCode: values.resourceCode.trim().toUpperCase(),
    categoryId: Number(values.categoryId),
    type: values.type,
    location: values.location,
    managerId: Number(values.managerId),
    quantity: Number(values.quantity),
    status: values.status as ResourceStatus,
    purchaseDate: values.purchaseDate || null,
    managementEndDate: values.managementEndDate || null,
    description: values.description.trim() || null,
    imageUrl: values.imageUrl || null,
    notes: values.notes.trim() || null,
  }
}

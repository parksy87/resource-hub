import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import { resourceCategories } from '../data/resourceMock'
import { requireDb } from '../lib/firebase'
import type { Resource, ResourcePayload } from '../types'
import { timestampToIso } from '../utils/firestoreTimestamp'

const COLLECTION = 'resources'

export class ResourceFirestoreError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ResourceFirestoreError'
    this.code = code
  }
}

function mapFirestoreError(error: unknown): ResourceFirestoreError {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : 'unknown'

  if (code === 'permission-denied') {
    return new ResourceFirestoreError(
      'PERMISSION_DENIED',
      '자원 데이터에 접근할 권한이 없습니다. 로그인 상태와 권한을 확인해 주세요.',
    )
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new ResourceFirestoreError(
      'NETWORK_ERROR',
      '네트워크 연결을 확인한 후 다시 시도해 주세요.',
    )
  }
  if (code === 'not-found') {
    return new ResourceFirestoreError('NOT_FOUND', '자원을 찾을 수 없습니다.')
  }
  return new ResourceFirestoreError(code, '자원 데이터 처리 중 오류가 발생했습니다.')
}

const PORTFOLIO_CATEGORY_HINTS: Record<string, { categoryId: number; type: string }> = {
  노트북: { categoryId: 1, type: 'NOTEBOOK' },
  태블릿: { categoryId: 1, type: 'TABLET' },
  프로젝터: { categoryId: 2, type: 'PROJECTOR' },
  빔프로젝터: { categoryId: 2, type: 'PROJECTOR' },
  카메라: { categoryId: 2, type: 'CAMERA' },
  회의실: { categoryId: 4, type: 'MEETING_ROOM' },
  차량: { categoryId: 5, type: 'PASSENGER_VEHICLE' },
}

function statusToFirestore(status: Resource['status']): string {
  return status.toLowerCase()
}

function normalizeResourceStatus(value: unknown): Resource['status'] {
  const upper = String(value ?? '').toUpperCase()
  if (upper === 'AVAILABLE' || upper === 'RESERVED' || upper === 'RENTED' || upper === 'INSPECTION' || upper === 'DISPOSED') {
    return upper as Resource['status']
  }
  const lower = String(value ?? 'available').toLowerCase()
  const map: Record<string, Resource['status']> = {
    available: 'AVAILABLE',
    reserved: 'RESERVED',
    rented: 'RENTED',
    inspection: 'INSPECTION',
    disposed: 'DISPOSED',
  }
  return map[lower] ?? 'AVAILABLE'
}

function resolveCategoryFields(data: DocumentData, name: string) {
  const categoryLabel = data.category != null ? String(data.category) : ''
  const hint = PORTFOLIO_CATEGORY_HINTS[categoryLabel] ?? PORTFOLIO_CATEGORY_HINTS[name]
  const categoryId = Number(data.categoryId ?? hint?.categoryId ?? 0)
  const type = String(data.type ?? hint?.type ?? '')
  return { categoryId, type }
}

function documentToResource(id: string, data: DocumentData): Resource {
  const name = String(data.name ?? '')
  const { categoryId, type } = resolveCategoryFields(data, name)
  const status = normalizeResourceStatus(data.status)
  const quantity = Number(data.totalQuantity ?? data.quantity ?? 1)
  const availableQuantity =
    data.availableQuantity != null
      ? Number(data.availableQuantity)
      : status === 'AVAILABLE'
        ? quantity
        : 0

  return {
    id,
    resourceCode: String(data.resourceCode ?? `FS-${id.slice(0, 8).toUpperCase()}`),
    name,
    categoryId,
    type,
    location: String(data.location ?? ''),
    managerId: data.managerId == null ? null : Number(data.managerId),
    totalQuantity: quantity,
    availableQuantity,
    status,
    purchaseDate: data.purchaseDate ? String(data.purchaseDate) : null,
    managementEndDate: data.managementEndDate ? String(data.managementEndDate) : null,
    description: data.description != null ? String(data.description) : null,
    imageUrl: data.imageUrl != null ? String(data.imageUrl) : null,
    notes: data.notes != null ? String(data.notes) : null,
    isReservable: Boolean(data.isReservable ?? status !== 'DISPOSED'),
    maxRentalDays: data.maxRentalDays == null ? null : Number(data.maxRentalDays),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  }
}

function payloadToDocument(payload: ResourcePayload, current?: Resource): DocumentData {
  const totalQuantity = payload.quantity
  const availableQuantity =
    payload.status === 'AVAILABLE'
      ? current
        ? Math.min(current.availableQuantity || totalQuantity, totalQuantity)
        : totalQuantity
      : 0
  const category =
    resourceCategories.find((item) => item.id === payload.categoryId)?.name ?? ''

  return {
    resourceCode: payload.resourceCode,
    name: payload.name,
    category,
    categoryId: payload.categoryId,
    type: payload.type,
    location: payload.location,
    managerId: payload.managerId,
    quantity: totalQuantity,
    totalQuantity,
    availableQuantity,
    status: statusToFirestore(payload.status),
    purchaseDate: payload.purchaseDate,
    managementEndDate: payload.managementEndDate,
    description: payload.description,
    imageUrl: payload.imageUrl,
    notes: payload.notes,
    isReservable: payload.status !== 'DISPOSED',
    maxRentalDays: payload.type === 'MEETING_ROOM' ? 1 : 7,
  }
}

export async function listFirestoreResources(): Promise<Resource[]> {
  try {
    const snapshot = await getDocs(collection(requireDb(), COLLECTION))
    return snapshot.docs.map((entry) => documentToResource(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function getFirestoreResource(id: string): Promise<Resource | null> {
  try {
    const snapshot = await getDoc(doc(requireDb(), COLLECTION, id))
    if (!snapshot.exists()) return null
    return documentToResource(snapshot.id, snapshot.data())
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function createFirestoreResource(payload: ResourcePayload): Promise<Resource> {
  try {
    const docRef = await addDoc(collection(requireDb(), COLLECTION), {
      ...payloadToDocument(payload),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const created = await getFirestoreResource(docRef.id)
    if (!created) {
      throw new ResourceFirestoreError('CREATE_FAILED', '자원 등록 후 데이터를 확인하지 못했습니다.')
    }
    return created
  } catch (error) {
    if (error instanceof ResourceFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

export async function updateFirestoreResource(id: string, payload: ResourcePayload): Promise<Resource> {
  try {
    const current = await getFirestoreResource(id)
    if (!current) {
      throw new ResourceFirestoreError('NOT_FOUND', '자원을 찾을 수 없습니다.')
    }
    await updateDoc(doc(requireDb(), COLLECTION, id), {
      ...payloadToDocument(payload, current),
      updatedAt: serverTimestamp(),
    })
    const updated = await getFirestoreResource(id)
    if (!updated) {
      throw new ResourceFirestoreError('UPDATE_FAILED', '자원 수정 후 데이터를 확인하지 못했습니다.')
    }
    return updated
  } catch (error) {
    if (error instanceof ResourceFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

export async function deleteFirestoreResource(id: string): Promise<void> {
  try {
    await deleteDoc(doc(requireDb(), COLLECTION, id))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

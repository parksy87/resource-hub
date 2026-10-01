import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { requireDb } from '../lib/firebase'
import type { Rental, RentalStatus, ReturnCondition } from '../types'
import { denormalizedRentalFromFirestore, type RentalDenormalized } from './rentalMapper'
import { timestampToIso } from '../utils/firestoreTimestamp'

const COLLECTION = 'rentals'

export class RentalFirestoreError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'RentalFirestoreError'
    this.code = code
  }
}

function mapFirestoreError(error: unknown): RentalFirestoreError {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : 'unknown'

  if (code === 'permission-denied') {
    return new RentalFirestoreError('PERMISSION_DENIED', '대여 데이터에 접근할 권한이 없습니다.')
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new RentalFirestoreError('NETWORK_ERROR', '네트워크 연결을 확인한 후 다시 시도해 주세요.')
  }
  return new RentalFirestoreError(code, '대여 데이터 처리 중 오류가 발생했습니다.')
}

function normalizeRentalStatus(value: unknown): RentalStatus {
  const upper = String(value ?? '').toUpperCase()
  if (upper === 'REQUESTED' || upper === 'RENTED' || upper === 'RETURN_REQUESTED' || upper === 'RETURNED' || upper === 'OVERDUE') {
    return upper as RentalStatus
  }
  const lower = String(value ?? 'requested').toLowerCase()
  const map: Record<string, RentalStatus> = {
    requested: 'REQUESTED',
    rented: 'RENTED',
    return_requested: 'RETURN_REQUESTED',
    returned: 'RETURNED',
    overdue: 'OVERDUE',
  }
  return map[lower] ?? 'REQUESTED'
}

function readTimestamp(value: unknown): string | null {
  if (value == null) return null
  return timestampToIso(value)
}

function isoToTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso))
}

export function documentToRental(id: string, data: DocumentData): Rental {
  return {
    id,
    rentalNumber: String(data.rentalNumber ?? ''),
    reservationId: data.reservationId != null ? String(data.reservationId) : null,
    resourceId: String(data.resourceId ?? ''),
    userId: String(data.userId ?? ''),
    quantity: Number(data.quantity ?? 1),
    requestedAt: readTimestamp(data.requestedAt) ?? timestampToIso(data.createdAt),
    rentedAt: readTimestamp(data.rentedAt) ?? readTimestamp(data.rentalDate),
    dueAt: readTimestamp(data.dueAt) ?? '',
    returnedAt: readTimestamp(data.returnedAt) ?? readTimestamp(data.returnDate),
    returnedQuantity: data.returnedQuantity == null ? null : Number(data.returnedQuantity),
    status: normalizeRentalStatus(data.status),
    processedBy: data.processedBy != null ? String(data.processedBy) : null,
    rentalProcessedAt: readTimestamp(data.rentalProcessedAt),
    checkoutNote: data.checkoutNote != null ? String(data.checkoutNote) : null,
    returnProcessedBy: data.returnProcessedBy != null ? String(data.returnProcessedBy) : null,
    returnProcessedAt: readTimestamp(data.returnProcessedAt),
    returnRequestedAt: readTimestamp(data.returnRequestedAt),
    returnStatus: (data.returnStatus as ReturnCondition | null) ?? null,
    returnNote: data.returnNote != null ? String(data.returnNote) : null,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  }
}

export interface RentalRecord {
  item: Rental
  denormalized: RentalDenormalized
}

function toRecord(id: string, data: DocumentData): RentalRecord {
  return {
    item: documentToRental(id, data),
    denormalized: denormalizedRentalFromFirestore(data),
  }
}

export interface FirestoreRentalCreateInput {
  rentalNumber: string
  reservationId: string
  reservationNumber: string | null
  resourceId: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: number
  resourceCategoryName: string
  userId: string
  userName: string
  userEmail: string
  quantity: number
  requestedAt: string
  dueAt: string
  status: RentalStatus
}

export async function listFirestoreRentals(): Promise<RentalRecord[]> {
  try {
    const snapshot = await getDocs(collection(requireDb(), COLLECTION))
    return snapshot.docs.map((entry) => toRecord(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function listFirestoreRentalsByUser(userId: string): Promise<RentalRecord[]> {
  try {
    const snapshot = await getDocs(
      query(collection(requireDb(), COLLECTION), where('userId', '==', userId)),
    )
    return snapshot.docs.map((entry) => toRecord(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function getFirestoreRentalRecord(id: string): Promise<RentalRecord | null> {
  try {
    const snapshot = await getDoc(doc(requireDb(), COLLECTION, id))
    if (!snapshot.exists()) return null
    return toRecord(snapshot.id, snapshot.data())
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function findFirestoreRentalByReservationId(reservationId: string): Promise<RentalRecord | null> {
  try {
    const snapshot = await getDocs(
      query(collection(requireDb(), COLLECTION), where('reservationId', '==', reservationId)),
    )
    const first = snapshot.docs[0]
    if (!first) return null
    return toRecord(first.id, first.data())
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function createFirestoreRental(input: FirestoreRentalCreateInput): Promise<RentalRecord> {
  try {
    const docRef = await addDoc(collection(requireDb(), COLLECTION), {
      rentalNumber: input.rentalNumber,
      reservationId: input.reservationId,
      reservationNumber: input.reservationNumber,
      resourceId: input.resourceId,
      resourceName: input.resourceName,
      resourceCode: input.resourceCode,
      resourceCategoryId: input.resourceCategoryId,
      resourceCategoryName: input.resourceCategoryName,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      quantity: input.quantity,
      requestedAt: isoToTimestamp(input.requestedAt),
      dueAt: isoToTimestamp(input.dueAt),
      rentalDate: input.requestedAt.slice(0, 10),
      status: input.status,
      rentedAt: null,
      returnedAt: null,
      returnDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const created = await getFirestoreRentalRecord(docRef.id)
    if (!created) {
      throw new RentalFirestoreError('CREATE_FAILED', '대여 등록 후 데이터를 확인하지 못했습니다.')
    }
    return created
  } catch (error) {
    if (error instanceof RentalFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

export type FirestoreRentalPatch = Partial<{
  status: RentalStatus
  dueAt: string | null
  rentedAt: string | null
  rentalDate: string | null
  returnedAt: string | null
  returnDate: string | null
  returnedQuantity: number | null
  returnStatus: ReturnCondition | null
  returnNote: string | null
  checkoutNote: string | null
  processedBy: string | null
  rentalProcessedAt: string | null
  returnProcessedBy: string | null
  returnProcessedAt: string | null
  returnRequestedAt: string | null
}>

export async function patchFirestoreRental(id: string, patch: FirestoreRentalPatch): Promise<RentalRecord> {
  try {
    const payload: DocumentData = { updatedAt: serverTimestamp() }
    if (patch.status != null) payload.status = patch.status
    if (patch.rentedAt !== undefined) {
      payload.rentedAt = patch.rentedAt ? isoToTimestamp(patch.rentedAt) : null
      payload.rentalDate = patch.rentedAt ? patch.rentedAt.slice(0, 10) : patch.rentalDate ?? null
    }
    if (patch.returnedAt !== undefined) {
      payload.returnedAt = patch.returnedAt ? isoToTimestamp(patch.returnedAt) : null
      payload.returnDate = patch.returnedAt ? patch.returnedAt.slice(0, 10) : patch.returnDate ?? null
    }
    if (patch.returnedQuantity !== undefined) payload.returnedQuantity = patch.returnedQuantity
    if (patch.returnStatus !== undefined) payload.returnStatus = patch.returnStatus
    if (patch.returnNote !== undefined) payload.returnNote = patch.returnNote
    if (patch.checkoutNote !== undefined) payload.checkoutNote = patch.checkoutNote
    if (patch.processedBy !== undefined) payload.processedBy = patch.processedBy
    if (patch.rentalProcessedAt !== undefined) {
      payload.rentalProcessedAt = patch.rentalProcessedAt ? isoToTimestamp(patch.rentalProcessedAt) : null
    }
    if (patch.returnProcessedBy !== undefined) payload.returnProcessedBy = patch.returnProcessedBy
    if (patch.returnProcessedAt !== undefined) {
      payload.returnProcessedAt = patch.returnProcessedAt ? isoToTimestamp(patch.returnProcessedAt) : null
    }
    if (patch.returnRequestedAt !== undefined) {
      payload.returnRequestedAt = patch.returnRequestedAt ? isoToTimestamp(patch.returnRequestedAt) : null
    }
    if (patch.dueAt !== undefined) {
      payload.dueAt = patch.dueAt ? isoToTimestamp(patch.dueAt) : null
    }

    await updateDoc(doc(requireDb(), COLLECTION, id), payload)
    const updated = await getFirestoreRentalRecord(id)
    if (!updated) {
      throw new RentalFirestoreError('NOT_FOUND', '대여 정보를 찾을 수 없습니다.')
    }
    return updated
  } catch (error) {
    if (error instanceof RentalFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

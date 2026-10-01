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
import type { Reservation, ReservationStatus } from '../types'

function normalizeReservationStatus(value: unknown): ReservationStatus {
  const upper = String(value ?? '').toUpperCase()
  if (
    upper === 'PENDING' ||
    upper === 'APPROVED' ||
    upper === 'REJECTED' ||
    upper === 'CANCELLED' ||
    upper === 'COMPLETED'
  ) {
    return upper as ReservationStatus
  }
  const lower = String(value ?? 'pending').toLowerCase()
  const map: Record<string, ReservationStatus> = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
  }
  return map[lower] ?? 'PENDING'
}
import { denormalizedFromFirestore, type ReservationDenormalized } from './reservationMapper'
import { timestampToIso } from '../utils/firestoreTimestamp'

const COLLECTION = 'reservations'

export class ReservationFirestoreError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ReservationFirestoreError'
    this.code = code
  }
}

function mapFirestoreError(error: unknown): ReservationFirestoreError {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : 'unknown'

  if (code === 'permission-denied') {
    return new ReservationFirestoreError(
      'PERMISSION_DENIED',
      '예약 데이터에 접근할 권한이 없습니다.',
    )
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new ReservationFirestoreError('NETWORK_ERROR', '네트워크 연결을 확인한 후 다시 시도해 주세요.')
  }
  return new ReservationFirestoreError(code, '예약 데이터 처리 중 오류가 발생했습니다.')
}

function readTimestamp(value: unknown): string | null {
  if (value == null) return null
  return timestampToIso(value)
}

export function documentToReservation(id: string, data: DocumentData): Reservation {
  return {
    id,
    reservationNumber: String(data.reservationNumber ?? ''),
    resourceId: String(data.resourceId ?? ''),
    userId: String(data.userId ?? ''),
    startAt: readTimestamp(data.startAt) ?? timestampToIso(data.startDate),
    endAt: readTimestamp(data.endAt) ?? timestampToIso(data.endDate),
    quantity: Number(data.quantity ?? 1),
    purpose: String(data.purpose ?? ''),
    requestNote: data.requestNote != null ? String(data.requestNote) : null,
    usageLocation: data.usageLocation != null ? String(data.usageLocation) : null,
    status: normalizeReservationStatus(data.status),
    reviewedBy: data.reviewedBy != null ? String(data.reviewedBy) : null,
    reviewedAt: readTimestamp(data.reviewedAt),
    rejectionReason: data.rejectionReason != null ? String(data.rejectionReason) : data.rejectReason != null ? String(data.rejectReason) : null,
    cancelledAt: readTimestamp(data.cancelledAt),
    cancellationReason: data.cancellationReason != null ? String(data.cancellationReason) : null,
    processedAt: readTimestamp(data.processedAt),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  }
}

export interface FirestoreReservationCreateInput {
  reservationNumber: string
  resourceId: string
  resourceName: string
  resourceCode: string
  resourceCategoryId: number
  resourceCategoryName: string
  userId: string
  userName: string
  userEmail: string
  startAt: string
  endAt: string
  quantity: number
  purpose: string
  requestNote: string | null
  usageLocation: string | null
  status: ReservationStatus
  notificationAgreed: boolean
}

function isoToTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso))
}

export interface ReservationRecord {
  item: Reservation
  denormalized: ReservationDenormalized
}

function toRecord(id: string, data: DocumentData): ReservationRecord {
  return {
    item: documentToReservation(id, data),
    denormalized: denormalizedFromFirestore(data),
  }
}

export async function listFirestoreReservations(): Promise<ReservationRecord[]> {
  try {
    const snapshot = await getDocs(collection(requireDb(), COLLECTION))
    return snapshot.docs.map((entry) => toRecord(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function listFirestoreReservationsByUser(userId: string): Promise<ReservationRecord[]> {
  try {
    const snapshot = await getDocs(
      query(collection(requireDb(), COLLECTION), where('userId', '==', userId)),
    )
    return snapshot.docs.map((entry) => toRecord(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function listFirestoreReservationsByResource(resourceId: string): Promise<Reservation[]> {
  try {
    const snapshot = await getDocs(
      query(collection(requireDb(), COLLECTION), where('resourceId', '==', resourceId)),
    )
    return snapshot.docs.map((entry) => documentToReservation(entry.id, entry.data()))
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function getFirestoreReservation(id: string): Promise<Reservation | null> {
  try {
    const snapshot = await getDoc(doc(requireDb(), COLLECTION, id))
    if (!snapshot.exists()) return null
    return documentToReservation(snapshot.id, snapshot.data())
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function getFirestoreReservationRecord(id: string): Promise<ReservationRecord | null> {
  try {
    const snapshot = await getDoc(doc(requireDb(), COLLECTION, id))
    if (!snapshot.exists()) return null
    return toRecord(snapshot.id, snapshot.data())
  } catch (error) {
    throw mapFirestoreError(error)
  }
}

export async function createFirestoreReservation(
  input: FirestoreReservationCreateInput,
): Promise<Reservation> {
  try {
    const docRef = await addDoc(collection(requireDb(), COLLECTION), {
      reservationNumber: input.reservationNumber,
      resourceId: input.resourceId,
      resourceName: input.resourceName,
      resourceCode: input.resourceCode,
      resourceCategoryId: input.resourceCategoryId,
      resourceCategoryName: input.resourceCategoryName,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      startAt: isoToTimestamp(input.startAt),
      endAt: isoToTimestamp(input.endAt),
      startDate: input.startAt.slice(0, 10),
      endDate: input.endAt.slice(0, 10),
      quantity: input.quantity,
      purpose: input.purpose,
      requestNote: input.requestNote,
      usageLocation: input.usageLocation,
      status: input.status,
      rejectReason: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      cancelledAt: null,
      cancellationReason: null,
      processedAt: null,
      notificationAgreed: input.notificationAgreed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const created = await getFirestoreReservation(docRef.id)
    if (!created) {
      throw new ReservationFirestoreError('CREATE_FAILED', '예약 저장 후 데이터를 확인하지 못했습니다.')
    }
    return created
  } catch (error) {
    if (error instanceof ReservationFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

export type FirestoreReservationPatch = Partial<{
  status: ReservationStatus
  reviewedBy: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  processedAt: string | null
}>

export async function patchFirestoreReservation(
  id: string,
  patch: FirestoreReservationPatch,
): Promise<Reservation> {
  try {
    const payload: DocumentData = { updatedAt: serverTimestamp() }
    if (patch.status != null) payload.status = patch.status
    if (patch.reviewedBy !== undefined) payload.reviewedBy = patch.reviewedBy
    if (patch.reviewedAt !== undefined) {
      payload.reviewedAt = patch.reviewedAt ? isoToTimestamp(patch.reviewedAt) : null
    }
    if (patch.rejectionReason !== undefined) payload.rejectionReason = patch.rejectionReason
    if (patch.cancelledAt !== undefined) {
      payload.cancelledAt = patch.cancelledAt ? isoToTimestamp(patch.cancelledAt) : null
    }
    if (patch.cancellationReason !== undefined) payload.cancellationReason = patch.cancellationReason
    if (patch.processedAt !== undefined) {
      payload.processedAt = patch.processedAt ? isoToTimestamp(patch.processedAt) : null
    }

    await updateDoc(doc(requireDb(), COLLECTION, id), payload)
    const updated = await getFirestoreReservation(id)
    if (!updated) {
      throw new ReservationFirestoreError('NOT_FOUND', '예약을 찾을 수 없습니다.')
    }
    return updated
  } catch (error) {
    if (error instanceof ReservationFirestoreError) throw error
    throw mapFirestoreError(error)
  }
}

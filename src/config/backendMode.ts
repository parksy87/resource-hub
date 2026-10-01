import { isFirebaseConfigured } from '../lib/firebase'

/** 예약 등 그 외 데이터 — 명시적으로 켠 경우에만 Firestore */
export const useFirestoreData = import.meta.env.VITE_USE_FIRESTORE === 'true'

/** 3단계: resources 컬렉션 — Firebase 설정 시 Firestore 사용 */
export function useFirestoreResources() {
  return isFirebaseConfigured
}

/** 4단계: reservations 컬렉션 — Firebase 설정 시 Firestore 사용 */
export function useFirestoreReservations() {
  return isFirebaseConfigured
}

/** 5단계: rentals 컬렉션 — Firebase 설정 시 Firestore 사용 */
export function useFirestoreRentals() {
  return isFirebaseConfigured
}

export function useFirestoreBackend() {
  return useFirestoreData && isFirebaseConfigured
}

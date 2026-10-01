import { Timestamp } from 'firebase/firestore'
import type { ISODateTime } from '../types'

export function timestampToIso(value: unknown): ISODateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return new Date().toISOString()
}

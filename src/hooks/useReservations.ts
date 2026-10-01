import { useCallback, useEffect, useState } from 'react'
import { reservationService } from '../services/reservationService'
import type {
  AsyncStatus,
  EntityId,
  PaginatedResponse,
  ReservationDetail,
  ReservationFilter,
  ReservationListItem,
} from '../types'

export const defaultReservationFilter: ReservationFilter = {
  keyword: '',
  status: null,
  categoryId: null,
  periodStart: '',
  periodEnd: '',
  appliedDate: '',
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

export function useReservationList() {
  const [filter, setFilterState] = useState<ReservationFilter>(defaultReservationFilter)
  const [result, setResult] = useState<PaginatedResponse<ReservationListItem> | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: ReservationFilter) => {
    setStatus('loading')
    setError(null)
    setFilterState(next)
  }, [])

  const refetch = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestId((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    void reservationService
      .getReservations(filter)
      .then((response) => {
        if (active) {
          setResult(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('예약 목록을 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, result, status, error, refetch }
}

export function useReservationDetail(id: EntityId | string) {
  const [data, setData] = useState<ReservationDetail | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const refetch = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestId((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    void reservationService
      .getReservation(id)
      .then((response) => {
        if (active) {
          setData(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('예약 정보를 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { data, status, error, refetch }
}

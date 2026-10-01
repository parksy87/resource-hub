import { useCallback, useEffect, useState } from 'react'
import { rentalService } from '../services/rentalService'
import type {
  AsyncStatus,
  EntityId,
  PaginatedResponse,
  RentalDetail,
  RentalFilter,
  RentalListItem,
} from '../types'

export const defaultRentalFilter: RentalFilter = {
  keyword: '',
  status: null,
  categoryId: null,
  periodStart: '',
  periodEnd: '',
  dueDate: '',
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

export function useRentalList() {
  const [filter, setFilterState] = useState<RentalFilter>(defaultRentalFilter)
  const [result, setResult] = useState<PaginatedResponse<RentalListItem> | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: RentalFilter) => {
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
    void rentalService
      .getRentals(filter)
      .then((response) => {
        if (active) {
          setResult(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('대여 목록을 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, result, status, error, refetch }
}

export function useRentalDetail(id: EntityId | string) {
  const [data, setData] = useState<RentalDetail | null>(null)
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
    void rentalService
      .getRental(id)
      .then((response) => {
        if (active) {
          setData(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('대여 정보를 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { data, status, error, refetch }
}

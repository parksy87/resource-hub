import { useCallback, useEffect, useState } from 'react'
import { inspectionService } from '../services/inspectionService'
import type {
  AsyncStatus,
  EntityId,
  InspectionDetail,
  InspectionFilter,
  InspectionListItem,
  InspectionOptions,
  InspectionStatus,
  PaginatedResponse,
} from '../types'

export const defaultInspectionFilter: InspectionFilter = {
  keyword: '',
  status: null,
  type: null,
  result: null,
  periodStart: '',
  periodEnd: '',
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

export function useInspectionList(initialStatus: InspectionStatus | null = null) {
  const [filter, setFilterState] = useState<InspectionFilter>({ ...defaultInspectionFilter, status: initialStatus })
  const [result, setResult] = useState<PaginatedResponse<InspectionListItem> | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: InspectionFilter) => {
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
    void inspectionService
      .getInspections(filter)
      .then((response) => {
        if (active) {
          setResult(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('점검 목록을 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, result, status, error, refetch }
}

export function useInspectionDetail(id: EntityId | null) {
  const [data, setData] = useState<InspectionDetail | null>(null)
  const [status, setStatus] = useState<AsyncStatus>(id ? 'loading' : 'success')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const refetch = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestId((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!id) return
    let active = true
    void inspectionService
      .getInspection(id)
      .then((response) => {
        if (active) {
          setData(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) {
          setError('점검 정보를 불러오지 못했습니다.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { data, status, error, refetch }
}

export function useInspectionOptions() {
  const [data, setData] = useState<InspectionOptions | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')

  useEffect(() => {
    let active = true
    void inspectionService
      .getOptions()
      .then((response) => {
        if (active) {
          setData(response)
          setStatus('success')
        }
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  return { data, status }
}

import { useCallback, useEffect, useState } from 'react'
import {
  resourceService,
  ResourceServiceError,
  type ResourceOptions,
} from '../services/resourceService'
import type {
  AsyncStatus,
  EntityId,
  PaginatedResponse,
  ResourceDetail,
  ResourceFilter,
  ResourceListItem,
} from '../types'

export const defaultResourceFilter: ResourceFilter = {
  keyword: '',
  categoryId: null,
  type: '',
  status: null,
  location: '',
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

export function useResourceList() {
  const [filter, setFilterState] = useState<ResourceFilter>(defaultResourceFilter)
  const [result, setResult] = useState<PaginatedResponse<ResourceListItem> | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: ResourceFilter) => {
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
    void resourceService
      .getResources(filter)
      .then((response) => {
        if (active) {
          setResult(response)
          setStatus('success')
        }
      })
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof ResourceServiceError
              ? caught.message
              : '자원 목록을 불러오지 못했습니다.',
          )
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, result, status, error, refetch }
}

export function useResourceDetail(id: EntityId | string) {
  const [data, setData] = useState<ResourceDetail | null>(null)
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
    void resourceService
      .getResource(id)
      .then((response) => {
        if (active) {
          setData(response)
          setStatus('success')
        }
      })
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof ResourceServiceError
              ? caught.message
              : '자원 정보를 불러오지 못했습니다.',
          )
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { data, status, error, refetch }
}

export function useResourceOptions() {
  const [data, setData] = useState<ResourceOptions | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')

  useEffect(() => {
    let active = true
    void resourceService
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

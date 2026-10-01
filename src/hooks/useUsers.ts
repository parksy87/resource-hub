import { useCallback, useEffect, useState } from 'react'
import { userService } from '../services/userService'
import type {
  AsyncStatus,
  EntityId,
  PaginatedResponse,
  UserDetail,
  UserFilter,
  UserListItem,
} from '../types'

export const defaultUserFilter: UserFilter = {
  keyword: '',
  status: null,
  role: null,
  joinedDate: '',
  page: 1,
  pageSize: 10,
  sortBy: 'joinedAt',
  sortDirection: 'desc',
}

export function useUserList() {
  const [filter, setFilterState] = useState<UserFilter>(defaultUserFilter)
  const [result, setResult] = useState<PaginatedResponse<UserListItem> | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: UserFilter) => {
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
    void userService.getUsers(filter).then((response) => {
      if (active) {
        setResult(response)
        setStatus('success')
      }
    }).catch(() => {
      if (active) {
        setError('사용자 목록을 불러오지 못했습니다.')
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, result, status, error, refetch }
}

export function useUserDetail(id: EntityId) {
  const [data, setData] = useState<UserDetail | null>(null)
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
    void userService.getUser(id).then((response) => {
      if (active) {
        setData(response)
        setStatus('success')
      }
    }).catch(() => {
      if (active) {
        setError('사용자 정보를 불러오지 못했습니다.')
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { data, status, error, refetch }
}

import { useCallback, useEffect, useState } from 'react'
import { userResourcePageSize } from '../config/userResource'
import { resourceService } from '../services/resourceService'
import type {
  AsyncStatus,
  PaginatedResponse,
  ResourceCategory,
  ResourceFilter,
  ResourceListItem,
  ResourceStatus,
  ResourceType,
} from '../types'

const sorts = {
  latest: { sortBy: 'createdAt', sortDirection: 'desc' as const },
  name: { sortBy: 'name', sortDirection: 'asc' as const },
  usage: { sortBy: 'usageCount', sortDirection: 'desc' as const },
  available: { sortBy: 'availability', sortDirection: 'asc' as const },
}

function categoryIdFromCode(categories: ResourceCategory[], code: string) {
  return categories.find((item) => item.code === code)?.id ?? null
}

export function toUserResourceFilter(params: URLSearchParams, categories: ResourceCategory[]): ResourceFilter {
  const sort = sorts[params.get('sort') as keyof typeof sorts] ?? sorts.latest
  const status = params.get('status')
  const available = params.get('available')
  const page = Number(params.get('page') ?? '1')
  return {
    keyword: params.get('keyword') ?? '',
    categoryId: categoryIdFromCode(categories, params.get('category') ?? ''),
    type: params.get('type') ?? '',
    status: status ? status as ResourceStatus : null,
    location: '',
    group: params.get('group') ?? '',
    available: available === 'true' ? true : available === 'false' ? false : null,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: userResourcePageSize,
    sortBy: sort.sortBy,
    sortDirection: sort.sortDirection,
  }
}

export function useUserResourceCatalog(params: URLSearchParams) {
  const [result, setResult] = useState<PaginatedResponse<ResourceListItem> | null>(null)
  const [types, setTypes] = useState<ResourceType[]>([])
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [settledSearch, setSettledSearch] = useState<string | null>(null)
  const search = params.toString()

  const refetch = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestId((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    const current = new URLSearchParams(search)
    void resourceService.getOptions().then(async (options) => {
      if (!active) return
      setTypes(options.types)
      const items = await resourceService.getResources(toUserResourceFilter(current, options.categories))
      if (!active) return
      setResult(items)
      setSettledSearch(search)
      setStatus('success')
    }).catch(() => {
      if (active) {
        setError('자원 목록을 불러오지 못했습니다.')
        setSettledSearch(search)
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [search, requestId])

  const visibleStatus = settledSearch === search ? status : 'loading'
  return { result, types, status: visibleStatus, error, refetch }
}

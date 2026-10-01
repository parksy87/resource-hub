import { useCallback, useEffect, useState } from 'react'
import { resourceService } from '../services/resourceService'
import type { AsyncStatus, RelatedResource, ResourceDetail } from '../types'

export function useUserResourceDetail(id: string | null) {
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [related, setRelated] = useState<RelatedResource[]>([])
  const [status, setStatus] = useState<AsyncStatus | 'missing'>('loading')
  const [requestId, setRequestId] = useState(0)

  const refetch = useCallback(() => {
    setStatus('loading')
    setRequestId((value) => value + 1)
  }, [])

  useEffect(() => {
    if (id == null) return undefined
    let active = true
    void Promise.all([
      resourceService.getResource(id),
      resourceService.getRelatedResources(id),
    ]).then(([item, items]) => {
      if (!active) return
      if (!item) {
        setResource(null)
        setRelated([])
        setStatus('missing')
        return
      }
      setResource(item)
      setRelated(items)
      setStatus('success')
    }).catch(() => {
      if (active) setStatus('error')
    })
    return () => {
      active = false
    }
  }, [id, requestId])

  return { resource, related, status, refetch }
}

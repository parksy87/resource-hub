import { useCallback, useEffect, useState } from 'react'
import { homeService } from '../services/homeService'
import type { AsyncStatus } from '../types'
import type { HomeBundle } from '../types/home'

export function useHome() {
  const [data, setData] = useState<HomeBundle | null>(null)
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
    void Promise.all([
      homeService.getPopularResources(),
      homeService.getAvailableResources(),
      homeService.getRecentActivities(),
      homeService.getHomeNotifications(),
      homeService.getUserUsageSummary(),
    ]).then(([popular, available, activities, notifications, summary]) => {
      if (active) {
        setData({ popular, available, activities, notifications, summary })
        setStatus('success')
      }
    }).catch(() => {
      if (active) {
        setError('홈 정보를 불러오지 못했습니다.')
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [requestId])

  return { data, status, error, refetch }
}

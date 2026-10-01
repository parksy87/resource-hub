import { useCallback, useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { AsyncStatus, DashboardData } from '../types'

interface DashboardQuery {
  data: DashboardData | null
  status: AsyncStatus
  error: string | null
  refetch: () => void
}

export function useDashboard(): DashboardQuery {
  const [data, setData] = useState<DashboardData | null>(null)
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

    const loadDashboard = async () => {
      try {
        const response = await dashboardService.getDashboard()
        if (active) {
          setData(response)
          setStatus('success')
        }
      } catch {
        if (active) {
          setError('대시보드 정보를 불러오지 못했습니다.')
          setStatus('error')
        }
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [requestId])

  return { data, status, error, refetch }
}

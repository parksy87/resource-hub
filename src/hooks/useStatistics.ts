import { useCallback, useEffect, useState } from 'react'
import { statisticsService } from '../services/statisticsService'
import type {
  AsyncStatus,
  InspectionStatistics,
  ReservationStatistics,
  ResourceUsageStatistics,
  RentalStatistics,
  StatisticsFilter,
  StatisticsResourceOption,
  StatisticsSummary,
  UserStatistics,
} from '../types'

export const defaultStatisticsFilter: StatisticsFilter = {
  period: '30D',
  startDate: '',
  endDate: '',
  category: null,
  resourceId: null,
}

export interface StatisticsView {
  summary: StatisticsSummary
  reservations: ReservationStatistics
  resources: ResourceUsageStatistics
  rentals: RentalStatistics
  inspections: InspectionStatistics
  users: UserStatistics
}

export function useStatistics() {
  const [filter, setFilterState] = useState<StatisticsFilter>(defaultStatisticsFilter)
  const [options, setOptions] = useState<StatisticsResourceOption[]>([])
  const [data, setData] = useState<StatisticsView | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  const setFilter = useCallback((next: StatisticsFilter) => {
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
    void statisticsService.getStatisticsOptions().then((response) => {
      if (active) setOptions(response)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([
      statisticsService.getStatisticsSummary(filter),
      statisticsService.getReservationStatistics(filter),
      statisticsService.getResourceUsageStatistics(filter),
      statisticsService.getRentalStatistics(filter),
      statisticsService.getInspectionStatistics(filter),
      statisticsService.getUserStatistics(filter),
    ]).then(([summary, reservations, resources, rentals, inspections, users]) => {
      if (active) {
        setData({ summary, reservations, resources, rentals, inspections, users })
        setStatus('success')
      }
    }).catch(() => {
      if (active) {
        setError('통계 정보를 불러오지 못했습니다.')
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [filter, requestId])

  return { filter, setFilter, options, data, status, error, refetch }
}

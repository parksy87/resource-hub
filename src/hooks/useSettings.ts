import { useCallback, useEffect, useState } from 'react'
import { settingsService } from '../services/settingsService'
import type { AsyncStatus, SettingsBundle } from '../types'

export function useSettings() {
  const [data, setData] = useState<SettingsBundle | null>(null)
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
      settingsService.getSystemSettings(),
      settingsService.getReservationSettings(),
      settingsService.getRentalSettings(),
      settingsService.getNotificationSettings(),
      settingsService.getOperationSettings(),
    ]).then(([basic, reservation, rental, notification, operation]) => {
      if (active) {
        setData({ basic, reservation, rental, notification, operation })
        setStatus('success')
      }
    }).catch(() => {
      if (active) {
        setError('시스템 설정을 불러오지 못했습니다.')
        setStatus('error')
      }
    })
    return () => {
      active = false
    }
  }, [requestId])

  return { data, status, error, refetch }
}

import type { EntityId } from '../types'

const withId = (path: string, id: EntityId | string) => `${path}/${encodeURIComponent(String(id))}`

/**
 * PHP REST API 연결 시 service 구현에서 사용할 경로 계약입니다.
 * 화면 컴포넌트는 이 값을 직접 사용하지 않습니다.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  dashboard: '/dashboard',
  resources: {
    list: '/resources',
    detail: (id: EntityId) => withId('/resources', id),
    options: '/resources/options',
  },
  reservations: {
    list: '/reservations',
    detail: (id: EntityId) => withId('/reservations', id),
    availability: '/reservations/availability',
    approve: (id: EntityId) => `${withId('/reservations', id)}/approve`,
    reject: (id: EntityId) => `${withId('/reservations', id)}/reject`,
    cancel: (id: EntityId) => `${withId('/reservations', id)}/cancel`,
    mine: '/me/reservations',
    myDetail: (id: EntityId) => withId('/me/reservations', id),
  },
  rentals: {
    list: '/rentals',
    detail: (id: EntityId) => withId('/rentals', id),
    process: (id: EntityId) => `${withId('/rentals', id)}/process`,
    return: (id: EntityId) => `${withId('/rentals', id)}/return`,
    mine: '/me/rentals',
    myDetail: (id: EntityId) => withId('/me/rentals', id),
    requestReturn: (id: EntityId) => `${withId('/me/rentals', id)}/return-request`,
  },
  inspections: {
    list: '/inspections',
    detail: (id: EntityId) => withId('/inspections', id),
    options: '/inspections/options',
    complete: (id: EntityId) => `${withId('/inspections', id)}/complete`,
    reinspect: (id: EntityId) => `${withId('/inspections', id)}/reinspect`,
  },
  users: {
    list: '/users',
    detail: (id: EntityId) => withId('/users', id),
    status: (id: EntityId) => `${withId('/users', id)}/status`,
  },
  notifications: {
    list: '/me/notifications',
    detail: (id: string) => withId('/me/notifications', id),
    read: (id: string) => `${withId('/me/notifications', id)}/read`,
    readAll: '/me/notifications/read-all',
  },
  me: {
    profile: '/me',
    summary: '/me/summary',
    withdraw: '/me/withdrawal-request',
  },
  statistics: '/statistics',
  settings: '/settings',
  home: '/home',
} as const

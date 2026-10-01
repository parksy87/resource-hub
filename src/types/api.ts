export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string>
  timestamp: string
}

export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'network'
  | 'unknown'

export interface ApiErrorDetails {
  kind: ApiErrorKind
  status: number | null
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

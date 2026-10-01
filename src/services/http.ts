import axios, { AxiosHeaders } from 'axios'
import type { ApiError, ApiErrorDetails, ApiErrorKind } from '../types'

/**
 * API 연결 단계에서 각 도메인 service가 공유할 HTTP client입니다.
 * 현재 단계에서는 실제 요청을 보내지 않습니다.
 */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api'

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

let accessTokenProvider: () => string | null = () => null

/**
 * 실제 인증 연결 시 메모리 기반 세션 store의 토큰 getter를 등록합니다.
 * 토큰 값을 localStorage에 직접 저장하지 않습니다.
 */
export function setAccessTokenProvider(provider: () => string | null) {
  accessTokenProvider = provider
}

function errorKind(status: number | null): ApiErrorKind {
  if (status === null) return 'network'
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status >= 500) return 'server'
  return 'unknown'
}

export class ApiClientError extends Error implements ApiErrorDetails {
  kind: ApiErrorKind
  status: number | null
  code: string
  fieldErrors?: Record<string, string>

  constructor(details: ApiErrorDetails) {
    super(details.message)
    this.name = 'ApiClientError'
    this.kind = details.kind
    this.status = details.status
    this.code = details.code
    this.fieldErrors = details.fieldErrors
  }
}

httpClient.interceptors.request.use((config) => {
  const token = accessTokenProvider()
  if (token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ApiError>(error)) {
      return Promise.reject(new ApiClientError({
        kind: 'unknown',
        status: null,
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
      }))
    }

    const status = error.response?.status ?? null
    const payload = error.response?.data
    return Promise.reject(new ApiClientError({
      kind: errorKind(status),
      status,
      code: payload?.code ?? (status ? `HTTP_${status}` : 'NETWORK_ERROR'),
      message: payload?.message
        ?? (status === null
          ? '네트워크 연결을 확인한 후 다시 시도해 주세요.'
          : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
      fieldErrors: payload?.fieldErrors,
    }))
  },
)

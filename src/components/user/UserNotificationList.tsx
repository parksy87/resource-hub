import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  notificationPageSize,
  notificationReadOptions,
  notificationSortOptions,
  notificationTypeMeta,
  notificationTypeOptions,
} from '../../config/userNotification'
import { notificationService } from '../../services/notificationService'
import type { Notification, NotificationFilter, NotificationListResult, NotificationReadStatus, NotificationSort, NotificationType } from '../../types/notification'
import { notificationSummary, notificationTargetAction, notificationTargetPath } from '../../utils/notification'
import { formatReservationWhen } from '../../utils/reservationForm'
import { Badge, Button, ConfirmModal, EmptyState, ErrorState, Input, Loading, Pagination, Select, StateDisplay } from '../ui'

const types = new Set<NotificationType>(['reservation', 'rental', 'inspection', 'system'])

function readFilter(params: URLSearchParams): NotificationFilter {
  const type = params.get('type')
  const status = params.get('status')
  const sort = params.get('sort')
  const page = Number(params.get('page') ?? '1')
  return {
    keyword: params.get('keyword') ?? '',
    type: type && types.has(type as NotificationType) ? type as NotificationType : 'all',
    status: status === 'unread' || status === 'read' ? status : 'all',
    sort: sort === 'oldest' ? 'oldest' : 'latest',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: notificationPageSize,
  }
}

function writeParams(current: URLSearchParams, patch: Partial<NotificationFilter>, resetPage: boolean) {
  const next = new URLSearchParams(current)
  const filter = { ...readFilter(current), ...patch }
  if (resetPage) filter.page = 1
  if (filter.keyword.trim()) next.set('keyword', filter.keyword.trim())
  else next.delete('keyword')
  if (filter.type === 'all') next.delete('type')
  else next.set('type', filter.type)
  if (filter.status === 'all') next.delete('status')
  else next.set('status', filter.status)
  if (filter.sort === 'latest') next.delete('sort')
  else next.set('sort', filter.sort)
  if (filter.page <= 1) next.delete('page')
  else next.set('page', String(filter.page))
  return next
}

function NoticeSearch({ keyword, onSearch }: { keyword: string; onSearch: (value: string) => void }) {
  const [draft, setDraft] = useState(keyword)
  return (
    <form
      className="user-notice-search"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(draft)
      }}
    >
      <Input
        label="검색"
        value={draft}
        placeholder="제목 또는 내용"
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button type="submit">검색</Button>
    </form>
  )
}

export function UserNotificationList() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const filter = readFilter(params)
  const [result, setResult] = useState<NotificationListResult | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [confirmAll, setConfirmAll] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [markedAll, setMarkedAll] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const filterKey = [filter.keyword, filter.type, filter.status, filter.sort, filter.page, requestId].join('|')

  useEffect(() => {
    const current = readFilter(params)
    let active = true
    void notificationService.getMyNotifications(current).then((data) => {
      if (!active) return
      setResult(data)
      setStatus('success')
      setSettledKey(filterKey)
    }).catch(() => {
      if (!active) return
      setStatus('error')
      setSettledKey(filterKey)
    })
    return () => {
      active = false
    }
  }, [filterKey, params])

  const visibleStatus = settledKey === filterKey ? status : 'loading'

  function updateFilter(patch: Partial<NotificationFilter>, resetPage = true) {
    setParams(writeParams(params, patch, resetPage))
  }

  async function openNotification(item: Notification) {
    if (openingId) return
    setOpeningId(item.id)
    try {
      if (!item.isRead) await notificationService.markAsRead(item.id)
      navigate(notificationTargetPath(item.relatedTarget) ?? `/notifications/${item.id}`)
    } catch {
      setStatus('error')
      setSettledKey(filterKey)
      setOpeningId(null)
    }
  }

  async function markAll() {
    setMarkingAll(true)
    try {
      await notificationService.markAllAsRead()
      setMarkedAll(true)
      setRequestId((current) => current + 1)
    } catch {
      setStatus('error')
      setSettledKey(filterKey)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <section className="user-notice">
      <div className="user-notice-heading">
        <div>
          <p>NOTICE</p>
          <h2>알림</h2>
          {result && <p>전체 {result.totalCount}건 · 읽지 않음 {result.unreadCount}건</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          isLoading={markingAll}
          disabled={!result || result.unreadCount === 0}
          onClick={() => setConfirmAll(true)}
        >
          {markingAll ? '전체 읽음 처리 중' : '전체 읽음 처리'}
        </Button>
      </div>
      <ConfirmModal
        isOpen={confirmAll}
        tone="primary"
        title="모든 알림을 읽음 처리할까요?"
        description="읽지 않은 알림이 모두 읽음으로 표시됩니다."
        confirmLabel="전체 읽음 처리"
        onClose={() => setConfirmAll(false)}
        onConfirm={() => void markAll()}
      />
      {markedAll && <p className="user-notice-complete" role="status">모든 알림을 읽음 처리했습니다.</p>}
      <div className="user-notice-filters">
        <NoticeSearch key={filter.keyword} keyword={filter.keyword} onSearch={(keyword) => updateFilter({ keyword })} />
        <Select
          label="알림 유형"
          value={filter.type}
          options={notificationTypeOptions}
          onChange={(event) => updateFilter({ type: event.target.value as NotificationType | 'all' })}
        />
        <Select
          label="읽음 상태"
          value={filter.status}
          options={notificationReadOptions}
          onChange={(event) => updateFilter({ status: event.target.value as NotificationReadStatus })}
        />
        <Select
          label="정렬"
          value={filter.sort}
          options={notificationSortOptions}
          onChange={(event) => updateFilter({ sort: event.target.value as NotificationSort })}
        />
      </div>
      {visibleStatus === 'loading' && <Loading label="알림을 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="알림을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((current) => current + 1)}
        />
      )}
      {visibleStatus === 'success' && result && !result.hasAny && (
        <EmptyState title="알림이 없습니다." description="새 알림이 도착하면 이 화면에서 확인할 수 있습니다." />
      )}
      {visibleStatus === 'success' && result && result.hasAny && result.items.length === 0 && filter.status === 'unread' && !filter.keyword.trim() && filter.type === 'all' && (
        <EmptyState title="읽지 않은 알림이 없습니다." description="새로운 알림이 오면 이 목록에 표시됩니다." />
      )}
      {visibleStatus === 'success' && result && result.hasAny && result.items.length === 0 && (filter.keyword.trim() || filter.type !== 'all' || (filter.status !== 'all' && filter.status !== 'unread')) && (
        <StateDisplay variant="search-empty" title="검색 조건에 맞는 알림이 없습니다." description="검색어나 필터를 바꿔 다시 확인해 주세요." />
      )}
      {visibleStatus === 'success' && result && result.items.length > 0 && (
        <>
          <ul className="user-notice-list">
            {result.items.map((item) => {
              const meta = notificationTypeMeta[item.type]
              return (
                <li key={item.id} className={item.isRead ? undefined : 'is-unread'}>
                  <button type="button" disabled={openingId === item.id} onClick={() => void openNotification(item)}>
                    <span className="user-notice-list__meta">
                      {!item.isRead && <span className="user-notice-dot" aria-hidden="true" />}
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <Badge tone={item.isRead ? 'neutral' : 'blue'}>{item.isRead ? '읽음' : '읽지 않음'}</Badge>
                    </span>
                    <strong>{item.title}</strong>
                    <p>{notificationSummary(item.content)}</p>
                    <span className="user-notice-list__foot">
                      <time dateTime={item.createdAt}>{formatReservationWhen(item.createdAt)}</time>
                      <span>{notificationTargetAction(item.relatedTarget)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {result.totalPages > 1 && (
            <div className="user-notice-pagination">
              <Pagination
                edges
                page={result.page}
                totalPages={result.totalPages}
                onChange={(page) => updateFilter({ page }, false)}
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}

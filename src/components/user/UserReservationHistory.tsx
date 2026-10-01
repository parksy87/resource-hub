import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { reservationStatusMeta } from '../../config/reservation'
import { reservationHistoryPageSize, reservationHistorySorts, reservationHistoryTabs } from '../../config/userReservation'
import { ROUTES } from '../../routes/paths'
import { reservationService } from '../../services/reservationService'
import { resourceService } from '../../services/resourceService'
import type { ReservationHistoryFilter, ReservationHistoryResult, ReservationListItem, ReservationStatus, ResourceCategory } from '../../types'
import { formatReservationWhen } from '../../utils/reservationForm'
import { canCancelReservation, formatUsageDate, formatUsageTime } from '../../utils/reservationDisplay'
import { Badge, Button, DatePicker, EmptyState, ErrorState, Input, Loading, Pagination, Select, StateDisplay, Tabs } from '../ui'
import { ReservationCancelDialog } from './ReservationCancelDialog'

const emptyCounts: ReservationHistoryResult['counts'] = {
  ALL: 0,
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
  COMPLETED: 0,
}

function createFilter(): ReservationHistoryFilter {
  return {
    keyword: '',
    status: null,
    categoryId: null,
    periodStart: '',
    periodEnd: '',
    appliedDate: '',
    page: 1,
    pageSize: reservationHistoryPageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  }
}

const reservationQueryStatus: Record<string, ReservationStatus> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
}

function statusFromQuery(value: string | null): ReservationStatus | null {
  if (!value) return null
  return reservationQueryStatus[value.toLowerCase()] ?? null
}

function sortValue(filter: ReservationHistoryFilter) {
  if (filter.sortBy === 'startAt' && filter.sortDirection === 'asc') return 'soon'
  if (filter.sortBy === 'startAt') return 'late'
  return 'latest'
}

function ReservationStatusCell({ status }: { status: ReservationStatus }) {
  const meta = reservationStatusMeta[status]
  return (
    <div className="user-history-status">
      <Badge tone={meta.tone}>{meta.label}</Badge>
      <span>{meta.description}</span>
    </div>
  )
}

function ReservationActions({ item, onCancel }: { item: ReservationListItem; onCancel: (item: ReservationListItem) => void }) {
  return (
    <div className="user-history-actions">
      <Link className="ui-button ui-button--outline ui-button--sm" to={ROUTES.user.reservationHistoryDetail(item.id)}>상세보기</Link>
      {canCancelReservation(item.status) && (
        <Button type="button" variant="danger" size="sm" onClick={() => onCancel(item)}>예약 취소</Button>
      )}
    </div>
  )
}

export function UserReservationHistory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [periodError, setPeriodError] = useState('')
  const [filter, setFilter] = useState(() => ({
    ...createFilter(),
    status: statusFromQuery(searchParams.get('status')),
  }))
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [result, setResult] = useState<ReservationHistoryResult | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [cancelTarget, setCancelTarget] = useState<ReservationListItem | null>(null)
  const filterKey = [
    filter.keyword,
    filter.status ?? '',
    filter.categoryId ?? '',
    filter.periodStart,
    filter.periodEnd,
    filter.page,
    filter.sortBy ?? '',
    filter.sortDirection ?? '',
    requestId,
  ].join('|')

  useEffect(() => {
    let active = true
    void resourceService.getOptions().then((options) => {
      if (active) setCategories(options.categories)
    }).catch(() => {
      if (active) setCategories([])
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void reservationService.getMyReservations(filter).then((data) => {
      if (!active) return
      setResult(data)
      setSettledKey(filterKey)
      setStatus('success')
    }).catch(() => {
      if (!active) return
      setSettledKey(filterKey)
      setStatus('error')
    })
    return () => {
      active = false
    }
  }, [filter, filterKey])

  const visibleStatus = settledKey === filterKey ? status : 'loading'
  const counts = result?.counts ?? emptyCounts
  const hasSearch = Boolean(filter.keyword || filter.categoryId || filter.periodStart || filter.periodEnd || filter.status)

  function applyKeyword() {
    setFilter((current) => ({ ...current, keyword: keyword.trim(), page: 1 }))
  }

  function updatePeriod(start: string, end: string) {
    setPeriodStart(start)
    setPeriodEnd(end)
    if (start && end && start > end) {
      setPeriodError('종료일은 시작일 이후여야 합니다.')
      return
    }
    setPeriodError('')
    setFilter((current) => ({ ...current, periodStart: start, periodEnd: end, page: 1 }))
  }

  function resetFilters() {
    setKeyword('')
    setPeriodStart('')
    setPeriodEnd('')
    setPeriodError('')
    setFilter(createFilter())
  }

  return (
    <section className="user-history">
      <header className="user-history-heading">
        <p>RESERVATION</p>
        <h2>예약 내역</h2>
        <p>예약 상태와 이용 일정을 확인합니다.</p>
      </header>

      <form
        className="user-history-filters"
        onSubmit={(event) => {
          event.preventDefault()
          applyKeyword()
        }}
      >
        <Input
          label="검색"
          name="reservation-keyword"
          value={keyword}
          placeholder="예약번호 또는 자원명"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Select
          label="예약 상태"
          name="reservation-status"
          value={filter.status ?? ''}
          placeholder="전체"
          options={reservationHistoryTabs.filter((item) => item.id !== 'ALL').map((item) => ({ label: item.label, value: item.id }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({
              ...current,
              status: value ? value as ReservationStatus : null,
              page: 1,
            }))
          }}
        />
        <Select
          label="카테고리"
          name="reservation-category"
          value={filter.categoryId ? String(filter.categoryId) : ''}
          placeholder="전체"
          options={categories.map((item) => ({ label: item.name, value: String(item.id) }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({ ...current, categoryId: value ? Number(value) : null, page: 1 }))
          }}
        />
        <DatePicker
          label="이용 시작일"
          name="reservation-period-start"
          value={periodStart}
          error={periodError}
          onChange={(event) => updatePeriod(event.target.value, periodEnd)}
        />
        <DatePicker
          label="이용 종료일"
          name="reservation-period-end"
          value={periodEnd}
          onChange={(event) => updatePeriod(periodStart, event.target.value)}
        />
        <Select
          label="정렬"
          name="reservation-sort"
          value={sortValue(filter)}
          options={reservationHistorySorts.map((item) => ({ label: item.label, value: item.value }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({
              ...current,
              sortBy: value === 'latest' ? 'createdAt' : 'startAt',
              sortDirection: value === 'soon' ? 'asc' : 'desc',
              page: 1,
            }))
          }}
        />
        <div className="user-history-filter-actions">
          <Button type="submit">검색</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>초기화</Button>
        </div>
      </form>

      <Tabs
        ariaLabel="예약 상태"
        value={filter.status ?? 'ALL'}
        items={reservationHistoryTabs.map((item) => ({
          id: item.id,
          label: item.label,
          count: counts[item.id],
        }))}
        onChange={(id) => {
          setFilter((current) => ({
            ...current,
            status: id === 'ALL' ? null : id as ReservationStatus,
            page: 1,
          }))
        }}
      />

      {visibleStatus === 'loading' && <Loading label="예약 내역을 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="예약 내역을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && result && !result.hasAny && (
        <EmptyState
          title="예약 내역이 없습니다."
          description="자원을 찾아 새 예약을 신청할 수 있습니다."
          actionLabel="자원 찾기"
          onAction={() => navigate(ROUTES.user.resources)}
        />
      )}
      {visibleStatus === 'success' && result && result.hasAny && result.items.length === 0 && (
        <StateDisplay
          variant={hasSearch ? 'search-empty' : 'empty'}
          title="검색 조건에 맞는 예약이 없습니다."
          description="검색 조건을 변경해 다시 검색해 주세요."
        />
      )}
      {visibleStatus === 'success' && result && result.items.length > 0 && (
        <>
          <div className="user-history-table">
            <div className="ui-table-wrap">
              <table className="ui-table">
                <caption className="sr-only">예약 내역</caption>
                <thead>
                  <tr>
                    <th scope="col">예약번호</th>
                    <th scope="col">자원명</th>
                    <th scope="col">카테고리</th>
                    <th scope="col">이용일</th>
                    <th scope="col">이용시간</th>
                    <th scope="col">예약 상태</th>
                    <th scope="col">신청일</th>
                    <th scope="col">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.reservationNumber}</td>
                      <td>
                        <Link to={ROUTES.user.resourceDetail(item.resourceId)}>{item.resourceName}</Link>
                      </td>
                      <td>{item.resourceCategoryName}</td>
                      <td>{formatUsageDate(item.startAt, item.endAt)}</td>
                      <td>{formatUsageTime(item.startAt, item.endAt)}</td>
                      <td><ReservationStatusCell status={item.status} /></td>
                      <td>{formatReservationWhen(item.createdAt)}</td>
                      <td><ReservationActions item={item} onCancel={setCancelTarget} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="user-history-cards">
            {result.items.map((item) => {
              const meta = reservationStatusMeta[item.status]
              return (
                <li key={item.id}>
                  <div>
                    <span>{item.reservationNumber}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <strong>{item.resourceName}</strong>
                  <p>{meta.description}</p>
                  <dl>
                    <div><dt>카테고리</dt><dd>{item.resourceCategoryName}</dd></div>
                    <div><dt>이용일</dt><dd>{formatUsageDate(item.startAt, item.endAt)}</dd></div>
                    <div><dt>이용시간</dt><dd>{formatUsageTime(item.startAt, item.endAt)}</dd></div>
                    <div><dt>신청일</dt><dd>{formatReservationWhen(item.createdAt)}</dd></div>
                  </dl>
                  <ReservationActions item={item} onCancel={setCancelTarget} />
                </li>
              )
            })}
          </ul>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(page) => setFilter((current) => ({ ...current, page }))}
          />
        </>
      )}

      {cancelTarget && (
        <ReservationCancelDialog
          key={cancelTarget.id}
          reservationId={cancelTarget.id}
          isOpen
          onClose={() => setCancelTarget(null)}
          onCancelled={() => setRequestId((value) => value + 1)}
        />
      )}
    </section>
  )
}

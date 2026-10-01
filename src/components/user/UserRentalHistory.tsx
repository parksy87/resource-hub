import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { rentalStatusMeta } from '../../config/rental'
import { rentalHistoryPageSize, rentalHistorySorts, rentalHistoryTabs } from '../../config/userRental'
import { ROUTES } from '../../routes/paths'
import { rentalService } from '../../services/rentalService'
import { resourceService } from '../../services/resourceService'
import type { RentalHistoryFilter, RentalHistoryResult, RentalListItem, RentalStatus, ResourceCategory } from '../../types'
import { canRequestReturn } from '../../utils/rental'
import { formatReservationWhen } from '../../utils/reservationForm'
import { formatReservationDate } from '../../utils/reservationDisplay'
import { Badge, Button, DatePicker, EmptyState, ErrorState, Input, Loading, Pagination, Select, StateDisplay, Tabs } from '../ui'
import { ReturnRequestDialog } from './ReturnRequestDialog'

const emptyCounts: RentalHistoryResult['counts'] = {
  ALL: 0,
  REQUESTED: 0,
  RENTED: 0,
  RETURN_REQUESTED: 0,
  RETURNED: 0,
  OVERDUE: 0,
}

function createFilter(): RentalHistoryFilter {
  return {
    keyword: '',
    status: null,
    categoryId: null,
    periodStart: '',
    periodEnd: '',
    dueDate: '',
    page: 1,
    pageSize: rentalHistoryPageSize,
    sortBy: 'requestedAt',
    sortDirection: 'desc',
  }
}

const rentalQueryStatus: Record<string, RentalStatus> = {
  requested: 'REQUESTED',
  rented: 'RENTED',
  return_requested: 'RETURN_REQUESTED',
  returned: 'RETURNED',
  overdue: 'OVERDUE',
}

function statusFromQuery(value: string | null): RentalStatus | null {
  if (!value) return null
  return rentalQueryStatus[value.toLowerCase()] ?? null
}

function sortValue(filter: RentalHistoryFilter) {
  if (filter.sortBy === 'dueAt' && filter.sortDirection === 'asc') return 'soon'
  if (filter.sortBy === 'dueAt') return 'late'
  return 'latest'
}

function rentalDay(value: string | null) {
  return value ? formatReservationDate(value) : '-'
}

function RentalStatusCell({ item }: { item: RentalListItem }) {
  const meta = rentalStatusMeta[item.displayStatus]
  return (
    <div className="user-rental-status">
      <Badge tone={meta.tone}>{meta.label}</Badge>
      <span>{meta.description}</span>
      {item.displayStatus === 'OVERDUE' && <strong className="user-rental-overdue">{item.overdueDays}일 연체</strong>}
    </div>
  )
}

function RentalActions({ item, onReturn }: { item: RentalListItem; onReturn: (item: RentalListItem) => void }) {
  return (
    <div className="user-rental-actions">
      <Link className="ui-button ui-button--outline ui-button--sm" to={ROUTES.user.rentalDetail(item.id)}>상세보기</Link>
      {canRequestReturn(item.displayStatus) && (
        <Button type="button" size="sm" onClick={() => onReturn(item)}>반납 신청</Button>
      )}
    </div>
  )
}

export function UserRentalHistory() {
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
  const [result, setResult] = useState<RentalHistoryResult | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [returnTarget, setReturnTarget] = useState<RentalListItem | null>(null)
  const filterKey = [
    filter.keyword,
    filter.status ?? '',
    filter.categoryId ?? '',
    filter.periodStart,
    filter.periodEnd,
    filter.dueDate,
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
    void rentalService.getMyRentals(filter).then((data) => {
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
  const hasSearch = Boolean(filter.keyword || filter.categoryId || filter.periodStart || filter.periodEnd || filter.dueDate || filter.status)

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
    <section className="user-rental">
      <header className="user-rental-heading">
        <p>RENTAL</p>
        <h2>대여·반납</h2>
        <p>대여 중인 자원과 반납 일정을 확인하고, 반납이 필요한 건은 직접 신청할 수 있습니다.</p>
      </header>

      <form
        className="user-rental-filters"
        onSubmit={(event) => {
          event.preventDefault()
          setFilter((current) => ({ ...current, keyword: keyword.trim(), page: 1 }))
        }}
      >
        <Input
          label="검색"
          name="rental-keyword"
          value={keyword}
          placeholder="대여번호, 자원명 또는 예약번호"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Select
          label="대여 상태"
          name="rental-status"
          value={filter.status ?? ''}
          placeholder="전체"
          options={rentalHistoryTabs.filter((item) => item.id !== 'ALL').map((item) => ({ label: item.label, value: item.id }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({ ...current, status: value ? value as RentalStatus : null, page: 1 }))
          }}
        />
        <Select
          label="카테고리"
          name="rental-category"
          value={filter.categoryId ? String(filter.categoryId) : ''}
          placeholder="전체"
          options={categories.map((item) => ({ label: item.name, value: String(item.id) }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({ ...current, categoryId: value ? Number(value) : null, page: 1 }))
          }}
        />
        <DatePicker
          label="대여 시작일"
          name="rental-period-start"
          value={periodStart}
          error={periodError}
          onChange={(event) => updatePeriod(event.target.value, periodEnd)}
        />
        <DatePicker
          label="대여 종료일"
          name="rental-period-end"
          value={periodEnd}
          onChange={(event) => updatePeriod(periodStart, event.target.value)}
        />
        <DatePicker
          label="반납 예정일"
          name="rental-due-date"
          value={filter.dueDate}
          onChange={(event) => setFilter((current) => ({ ...current, dueDate: event.target.value, page: 1 }))}
        />
        <Select
          label="정렬"
          name="rental-sort"
          value={sortValue(filter)}
          options={rentalHistorySorts.map((item) => ({ label: item.label, value: item.value }))}
          onChange={(event) => {
            const value = event.target.value
            setFilter((current) => ({
              ...current,
              sortBy: value === 'latest' ? 'requestedAt' : 'dueAt',
              sortDirection: value === 'soon' ? 'asc' : 'desc',
              page: 1,
            }))
          }}
        />
        <div className="user-rental-filter-actions">
          <Button type="submit">검색</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>초기화</Button>
        </div>
      </form>

      <Tabs
        ariaLabel="대여 상태"
        value={filter.status ?? 'ALL'}
        items={rentalHistoryTabs.map((item) => ({ id: item.id, label: item.label, count: counts[item.id] }))}
        onChange={(id) => {
          setFilter((current) => ({
            ...current,
            status: id === 'ALL' ? null : id as RentalStatus,
            page: 1,
          }))
        }}
      />

      {visibleStatus === 'loading' && <Loading label="대여·반납 내역을 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="대여·반납 내역을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && result && !result.hasAny && (
        <EmptyState
          title="대여·반납 내역이 없습니다."
          description="자원을 찾아 새 예약을 신청할 수 있습니다."
          actionLabel="자원 찾아보기"
          onAction={() => navigate(ROUTES.user.resources)}
        />
      )}
      {visibleStatus === 'success' && result && result.hasAny && result.items.length === 0 && (
        <StateDisplay
          variant={hasSearch ? 'search-empty' : 'empty'}
          title="검색 조건에 맞는 대여가 없습니다."
          description="검색 조건을 변경해 다시 검색해 주세요."
        />
      )}
      {visibleStatus === 'success' && result && result.items.length > 0 && (
        <>
          <div className="user-rental-table">
            <div className="ui-table-wrap">
              <table className="ui-table">
                <caption className="sr-only">대여·반납 내역</caption>
                <thead>
                  <tr>
                    <th scope="col">대여번호</th>
                    <th scope="col">예약번호</th>
                    <th scope="col">자원명</th>
                    <th scope="col">카테고리</th>
                    <th scope="col">대여일</th>
                    <th scope="col">반납 예정일</th>
                    <th scope="col">실제 반납일</th>
                    <th scope="col">상태</th>
                    <th scope="col">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.rentalNumber}</td>
                      <td>
                        {item.reservationId ? (
                          <Link to={ROUTES.user.reservationHistoryDetail(item.reservationId)}>{item.reservationNumber}</Link>
                        ) : '-'}
                      </td>
                      <td><Link to={ROUTES.user.resourceDetail(item.resourceId)}>{item.resourceName}</Link></td>
                      <td>{item.resourceCategoryName}</td>
                      <td>{rentalDay(item.rentedAt ?? item.requestedAt)}</td>
                      <td>{formatReservationWhen(item.dueAt)}</td>
                      <td>{item.returnedAt ? formatReservationWhen(item.returnedAt) : '-'}</td>
                      <td><RentalStatusCell item={item} /></td>
                      <td><RentalActions item={item} onReturn={setReturnTarget} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="user-rental-cards">
            {result.items.map((item) => {
              const meta = rentalStatusMeta[item.displayStatus]
              return (
                <li key={item.id}>
                  <div>
                    <span>{item.rentalNumber}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <strong>{item.resourceName}</strong>
                  <p>{meta.description}</p>
                  {item.displayStatus === 'OVERDUE' && <strong className="user-rental-overdue">{item.overdueDays}일 연체</strong>}
                  <dl>
                    <div><dt>예약번호</dt><dd>{item.reservationNumber ?? '-'}</dd></div>
                    <div><dt>카테고리</dt><dd>{item.resourceCategoryName}</dd></div>
                    <div><dt>대여일</dt><dd>{rentalDay(item.rentedAt ?? item.requestedAt)}</dd></div>
                    <div><dt>반납 예정일</dt><dd>{formatReservationWhen(item.dueAt)}</dd></div>
                    <div><dt>실제 반납일</dt><dd>{item.returnedAt ? formatReservationWhen(item.returnedAt) : '-'}</dd></div>
                  </dl>
                  <RentalActions item={item} onReturn={setReturnTarget} />
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

      {returnTarget && (
        <ReturnRequestDialog
          key={returnTarget.id}
          rentalId={returnTarget.id}
          isOpen
          onClose={() => setReturnTarget(null)}
          onRequested={() => setRequestId((value) => value + 1)}
        />
      )}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { Check, Eye, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  DatePicker,
  EmptyState,
  ErrorState,
  Loading,
  Pagination,
  SearchFilter,
  Select,
  StateDisplay,
  Table,
  type TableColumn,
} from '../../../components/ui'
import {
  ReservationActionModal,
  type ReservationAction,
} from '../../../components/reservations/ReservationActionModal'
import { ReservationStatusBadge } from '../../../components/reservations/ReservationStatusBadge'
import { reservationStatusMeta } from '../../../config/reservation'
import { defaultReservationFilter, useReservationList } from '../../../hooks/useReservations'
import { useResourceOptions } from '../../../hooks/useResources'
import { ROUTES } from '../../../routes/paths'
import type { ReservationListItem, ReservationStatus } from '../../../types'
import { formatDate, formatDateTime } from '../../../utils/date'

interface FilterDraft {
  keyword: string
  status: string
  categoryId: string
  periodStart: string
  periodEnd: string
  appliedDate: string
}

const emptyDraft: FilterDraft = {
  keyword: '',
  status: '',
  categoryId: '',
  periodStart: '',
  periodEnd: '',
  appliedDate: '',
}

export default function ReservationListPage() {
  const navigate = useNavigate()
  const { filter, setFilter, result, status, error, refetch } = useReservationList()
  const { data: resourceOptions } = useResourceOptions()
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft)
  const [actionTarget, setActionTarget] = useState<ReservationListItem | null>(null)
  const [action, setAction] = useState<ReservationAction | null>(null)

  const openAction = (row: ReservationListItem, nextAction: ReservationAction) => {
    setActionTarget(row)
    setAction(nextAction)
  }

  const columns = useMemo<TableColumn<ReservationListItem>[]>(
    () => [
      {
        key: 'number',
        header: '예약번호',
        width: '140px',
        render: (row) => (
          <button className="reservation-number-link" type="button" onClick={() => navigate(ROUTES.admin.reservationDetail(row.id))}>
            {row.reservationNumber}
          </button>
        ),
      },
      {
        key: 'user',
        header: '예약자',
        width: '155px',
        render: (row) => <div className="reservation-user-cell"><strong>{row.userName}</strong><small>{row.userEmail}</small></div>,
      },
      {
        key: 'resource',
        header: '자원명',
        width: '180px',
        render: (row) => <div className="reservation-resource-cell"><strong>{row.resourceName}</strong><small>{row.resourceCode}</small></div>,
      },
      { key: 'reservedDate', header: '예약일', render: (row) => formatDate(row.startAt) },
      { key: 'startAt', header: '이용 시작일', render: (row) => formatDateTime(row.startAt) },
      { key: 'endAt', header: '이용 종료일', render: (row) => formatDateTime(row.endAt) },
      { key: 'appliedAt', header: '신청일', render: (row) => formatDateTime(row.createdAt) },
      { key: 'status', header: '상태', render: (row) => <ReservationStatusBadge status={row.status} /> },
      {
        key: 'actions',
        header: '관리',
        width: '245px',
        align: 'center',
        render: (row) => (
          <div className="reservation-table-actions">
            <Button variant="ghost" size="sm" leadingIcon={<Eye size={14} />} onClick={() => navigate(ROUTES.admin.reservationDetail(row.id))}>상세</Button>
            {row.status === 'PENDING' && (
              <>
                <Button variant="ghost" size="sm" leadingIcon={<Check size={14} />} onClick={() => openAction(row, 'approve')}>승인</Button>
                <Button variant="ghost" size="sm" leadingIcon={<X size={14} />} onClick={() => openAction(row, 'reject')}>반려</Button>
              </>
            )}
            {(row.status === 'PENDING' || row.status === 'APPROVED') && (
              <Button variant="ghost" size="sm" leadingIcon={<RotateCcw size={14} />} onClick={() => openAction(row, 'cancel')}>취소</Button>
            )}
          </div>
        ),
      },
    ],
    [navigate],
  )

  const applyFilters = () => {
    setFilter({
      ...filter,
      keyword: draft.keyword,
      status: (draft.status || null) as ReservationStatus | null,
      categoryId: draft.categoryId ? Number(draft.categoryId) : null,
      periodStart: draft.periodStart,
      periodEnd: draft.periodEnd,
      appliedDate: draft.appliedDate,
      page: 1,
    })
  }

  const resetFilters = () => {
    setDraft(emptyDraft)
    setFilter(defaultReservationFilter)
  }

  const hasFilters =
    Boolean(filter.keyword) ||
    Boolean(filter.status) ||
    Boolean(filter.categoryId) ||
    Boolean(filter.periodStart) ||
    Boolean(filter.periodEnd) ||
    Boolean(filter.appliedDate)

  return (
    <div className="reservation-list-page">
      <div className="resource-page-heading">
        <div>
          <span><SlidersHorizontal size={14} /> RESERVATION MANAGEMENT</span>
          <h2>예약 목록</h2>
          <p>예약 신청을 승인, 반려 또는 취소합니다.</p>
        </div>
      </div>

      <SearchFilter
        keyword={draft.keyword}
        onKeywordChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
        onSearch={applyFilters}
        onReset={resetFilters}
        placeholder="예약번호, 예약자명, 이메일 또는 자원명"
      >
        <Select
          aria-label="예약 상태"
          value={draft.status}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
          placeholder="전체 상태"
          options={(Object.keys(reservationStatusMeta) as ReservationStatus[]).map((key) => ({
            label: reservationStatusMeta[key].label,
            value: key,
          }))}
        />
        <Select
          aria-label="자원 분류"
          value={draft.categoryId}
          onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))}
          placeholder="전체 분류"
          options={(resourceOptions?.categories ?? []).map((item) => ({ label: item.name, value: String(item.id) }))}
        />
        <DatePicker
          aria-label="예약 기간 시작일"
          value={draft.periodStart}
          onChange={(event) => setDraft((current) => ({ ...current, periodStart: event.target.value }))}
        />
        <DatePicker
          aria-label="예약 기간 종료일"
          value={draft.periodEnd}
          onChange={(event) => setDraft((current) => ({ ...current, periodEnd: event.target.value }))}
        />
        <DatePicker
          aria-label="예약 신청일"
          value={draft.appliedDate}
          onChange={(event) => setDraft((current) => ({ ...current, appliedDate: event.target.value }))}
        />
      </SearchFilter>

      <Card padding="none" className="reservation-list-card">
        <div className="reservation-list-toolbar">
          <div><strong>검색 결과 <b>{result?.totalItems ?? 0}</b>건</strong><span>신청 건은 목록에서 처리할 수 있습니다.</span></div>
          <Select
            aria-label="정렬"
            value={`${filter.sortBy}-${filter.sortDirection}`}
            onChange={(event) => {
              const [sortBy, sortDirection] = event.target.value.split('-')
              setFilter({ ...filter, sortBy, sortDirection: sortDirection as 'asc' | 'desc', page: 1 })
            }}
            options={[
              { label: '최근 신청순', value: 'createdAt-desc' },
              { label: '오래된 신청순', value: 'createdAt-asc' },
              { label: '이용 시작일순', value: 'startAt-asc' },
            ]}
          />
        </div>

        {status === 'loading' && <div className="reservation-list-state"><Loading size="lg" label="예약 목록을 불러오는 중입니다" /></div>}
        {status === 'error' && <div className="reservation-list-state"><ErrorState compact title={error ?? '정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'} actionLabel="다시 시도" onAction={refetch} /></div>}
        {status === 'success' && result?.items.length === 0 && (
          <div className="reservation-list-state">
            {hasFilters ? (
              <StateDisplay variant="search-empty" compact title="검색 결과가 없습니다" description="검색어나 예약 조건을 변경해 주세요." actionLabel="검색 초기화" onAction={resetFilters} />
            ) : (
              <EmptyState compact title="등록된 예약이 없습니다" />
            )}
          </div>
        )}
        {status === 'success' && result && result.items.length > 0 && (
          <>
            <Table columns={columns} data={result.items} rowKey={(row) => row.id} caption="관리자 예약 목록" />
            <div className="reservation-list-pagination">
              <span>{(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.totalItems)} / {result.totalItems}건</span>
              <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => setFilter({ ...filter, page })} />
            </div>
          </>
        )}
      </Card>

      {action && actionTarget && (
        <ReservationActionModal
          key={`${action}-${actionTarget.id}`}
          action={action}
          reservation={actionTarget}
          onClose={() => {
            setAction(null)
            setActionTarget(null)
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}

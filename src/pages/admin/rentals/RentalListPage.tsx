import { useMemo, useState } from 'react'
import { Eye, PackageCheck, RotateCcw, SlidersHorizontal } from 'lucide-react'
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
import { RentalProcessModal, RentalReturnModal } from '../../../components/rentals/RentalActionModals'
import { RentalStatusBadge } from '../../../components/rentals/RentalStatusBadge'
import { rentalStatusMeta, returnConditionMeta } from '../../../config/rental'
import { defaultRentalFilter, useRentalList } from '../../../hooks/useRentals'
import { useResourceOptions } from '../../../hooks/useResources'
import { ROUTES } from '../../../routes/paths'
import type { RentalListItem, RentalStatus } from '../../../types'
import { formatDate, formatDateTime } from '../../../utils/date'
import { canProcessRental, canProcessReturn } from '../../../utils/rental'

interface FilterDraft {
  keyword: string
  status: string
  categoryId: string
  periodStart: string
  periodEnd: string
  dueDate: string
}

const emptyDraft: FilterDraft = {
  keyword: '',
  status: '',
  categoryId: '',
  periodStart: '',
  periodEnd: '',
  dueDate: '',
}

export default function RentalListPage() {
  const navigate = useNavigate()
  const { filter, setFilter, result, status, error, refetch } = useRentalList()
  const { data: resourceOptions } = useResourceOptions()
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft)
  const [processTarget, setProcessTarget] = useState<RentalListItem | null>(null)
  const [returnTarget, setReturnTarget] = useState<RentalListItem | null>(null)

  const columns = useMemo<TableColumn<RentalListItem>[]>(
    () => [
      {
        key: 'number',
        header: '대여번호',
        width: '135px',
        render: (row) => <button className="rental-number-link" type="button" onClick={() => navigate(ROUTES.admin.rentalDetail(row.id))}>{row.rentalNumber}</button>,
      },
      { key: 'reservation', header: '예약번호', width: '135px', render: (row) => row.reservationNumber ?? '-' },
      {
        key: 'user',
        header: '대여자',
        width: '145px',
        render: (row) => <div className="rental-person-cell"><strong>{row.userName}</strong><small>{row.userEmail}</small></div>,
      },
      {
        key: 'resource',
        header: '자원명',
        width: '170px',
        render: (row) => <div className="rental-person-cell"><strong>{row.resourceName}</strong><small>{row.resourceCode}</small></div>,
      },
      { key: 'quantity', header: '대여 수량', align: 'right', render: (row) => `${row.quantity}개` },
      { key: 'rentedAt', header: '대여일', render: (row) => row.rentedAt ? formatDateTime(row.rentedAt) : '-' },
      { key: 'dueAt', header: '반납 예정일', render: (row) => formatDate(row.dueAt) },
      { key: 'returnedAt', header: '실제 반납일', render: (row) => row.returnedAt ? formatDate(row.returnedAt) : '-' },
      {
        key: 'status',
        header: '상태',
        render: (row) => (
          <div className="rental-status-cell">
            <RentalStatusBadge status={row.displayStatus} />
            {row.returnStatus && <small>{returnConditionMeta[row.returnStatus].label}</small>}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        width: '190px',
        align: 'center',
        render: (row) => (
          <div className="rental-table-actions">
            <Button variant="ghost" size="sm" leadingIcon={<Eye size={14} />} onClick={() => navigate(ROUTES.admin.rentalDetail(row.id))}>상세</Button>
            {canProcessRental(row.displayStatus) && <Button variant="ghost" size="sm" leadingIcon={<PackageCheck size={14} />} onClick={() => setProcessTarget(row)}>대여 처리</Button>}
            {canProcessReturn(row.displayStatus) && <Button variant="ghost" size="sm" leadingIcon={<RotateCcw size={14} />} onClick={() => setReturnTarget(row)}>반납 처리</Button>}
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
      status: (draft.status || null) as RentalStatus | null,
      categoryId: draft.categoryId ? Number(draft.categoryId) : null,
      periodStart: draft.periodStart,
      periodEnd: draft.periodEnd,
      dueDate: draft.dueDate,
      page: 1,
    })
  }

  const resetFilters = () => {
    setDraft(emptyDraft)
    setFilter(defaultRentalFilter)
  }

  const hasFilters = Boolean(filter.keyword || filter.status || filter.categoryId || filter.periodStart || filter.periodEnd || filter.dueDate)

  return (
    <div className="rental-list-page">
      <div className="resource-page-heading">
        <div>
          <span><SlidersHorizontal size={14} /> RENTAL MANAGEMENT</span>
          <h2>대여 목록</h2>
          <p>승인된 자원의 대여와 반납 상태를 확인하고 처리합니다.</p>
        </div>
      </div>

      <SearchFilter keyword={draft.keyword} onKeywordChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} onSearch={applyFilters} onReset={resetFilters} placeholder="대여번호, 예약번호, 대여자, 자원명 또는 자원 코드">
        <Select aria-label="대여 상태" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} placeholder="전체 상태" options={(Object.keys(rentalStatusMeta) as RentalStatus[]).map((key) => ({ label: rentalStatusMeta[key].label, value: key }))} />
        <Select aria-label="자원 분류" value={draft.categoryId} onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))} placeholder="전체 분류" options={(resourceOptions?.categories ?? []).map((item) => ({ label: item.name, value: String(item.id) }))} />
        <DatePicker aria-label="대여 기간 시작일" value={draft.periodStart} onChange={(event) => setDraft((current) => ({ ...current, periodStart: event.target.value }))} />
        <DatePicker aria-label="대여 기간 종료일" value={draft.periodEnd} onChange={(event) => setDraft((current) => ({ ...current, periodEnd: event.target.value }))} />
        <DatePicker aria-label="반납 예정일" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
      </SearchFilter>

      <Card padding="none" className="rental-list-card">
        <div className="rental-list-toolbar">
          <div><strong>검색 결과 <b>{result?.totalItems ?? 0}</b>건</strong><span>연체 상태는 반납 예정일과 실제 반납일을 기준으로 계산됩니다.</span></div>
          <Select
            aria-label="정렬"
            value={`${filter.sortBy}-${filter.sortDirection}`}
            onChange={(event) => {
              const [sortBy, sortDirection] = event.target.value.split('-')
              setFilter({ ...filter, sortBy, sortDirection: sortDirection as 'asc' | 'desc', page: 1 })
            }}
            options={[
              { label: '최근 신청순', value: 'createdAt-desc' },
              { label: '반납 예정일순', value: 'dueAt-asc' },
              { label: '대여일순', value: 'rentedAt-desc' },
            ]}
          />
        </div>
        {status === 'loading' && <div className="rental-list-state"><Loading size="lg" label="대여 목록을 불러오는 중입니다" /></div>}
        {status === 'error' && <div className="rental-list-state"><ErrorState compact title={error ?? '정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'} actionLabel="다시 시도" onAction={refetch} /></div>}
        {status === 'success' && result?.items.length === 0 && (
          <div className="rental-list-state">
            {hasFilters ? <StateDisplay variant="search-empty" compact title="검색 결과가 없습니다" description="검색어나 대여 조건을 변경해보세요." actionLabel="검색 초기화" onAction={resetFilters} /> : <EmptyState compact title="등록된 대여 건이 없습니다" description="대여가 접수되면 이곳에 표시됩니다." />}
          </div>
        )}
        {status === 'success' && result && result.items.length > 0 && (
          <>
            <Table columns={columns} data={result.items} rowKey={(row) => row.id} caption="관리자 대여 목록" />
            <div className="rental-list-pagination">
              <span>{(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.totalItems)} / {result.totalItems}건</span>
              <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => setFilter({ ...filter, page })} />
            </div>
          </>
        )}
      </Card>

      {processTarget && <RentalProcessModal key={processTarget.id} rental={processTarget} onClose={() => setProcessTarget(null)} onSuccess={refetch} />}
      {returnTarget && <RentalReturnModal key={returnTarget.id} rental={returnTarget} onClose={() => setReturnTarget(null)} onSuccess={refetch} />}
    </div>
  )
}

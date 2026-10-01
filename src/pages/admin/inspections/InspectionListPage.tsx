import { useEffect, useMemo, useState } from 'react'
import { ClipboardPlus, Eye, Pencil, SlidersHorizontal } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { InspectionCompleteModal } from '../../../components/inspections/InspectionCompleteModal'
import { InspectionResultBadge, InspectionStatusBadge } from '../../../components/inspections/InspectionStatusBadge'
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
import { inspectionResultMeta, inspectionStatusMeta, inspectionTypeMeta } from '../../../config/inspection'
import { defaultInspectionFilter, useInspectionList } from '../../../hooks/useInspections'
import { ROUTES } from '../../../routes/paths'
import type { InspectionListItem, InspectionResult, InspectionStatus, InspectionType } from '../../../types'
import { formatDateTime } from '../../../utils/date'
import { canCompleteInspection, canEditInspection, canReinspect, formatInspectionDate } from '../../../utils/inspection'

interface FilterDraft {
  keyword: string
  status: string
  type: string
  result: string
  periodStart: string
  periodEnd: string
}

const statuses = Object.keys(inspectionStatusMeta) as InspectionStatus[]

function isInspectionStatus(value: string | null): value is InspectionStatus {
  return statuses.includes(value as InspectionStatus)
}

export default function InspectionListPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const statusQuery = params.get('status')
  const initialStatus = isInspectionStatus(statusQuery) ? statusQuery : null
  const { filter, setFilter, result, status, error, refetch } = useInspectionList(initialStatus)
  const [draft, setDraft] = useState<FilterDraft>({
    keyword: '',
    status: initialStatus ?? '',
    type: '',
    result: '',
    periodStart: '',
    periodEnd: '',
  })
  const [completeTarget, setCompleteTarget] = useState<InspectionListItem | null>(null)
  const action = params.get('action')

  useEffect(() => {
    if (action === 'new') navigate(ROUTES.admin.inspectionNew, { replace: true })
  }, [action, navigate])

  const columns = useMemo<TableColumn<InspectionListItem>[]>(
    () => [
      {
        key: 'number',
        header: '점검번호',
        width: '140px',
        render: (row) => <button className="inspection-number-link" type="button" onClick={() => navigate(ROUTES.admin.inspectionDetail(row.id))}>{row.inspectionNumber}</button>,
      },
      {
        key: 'resource',
        header: '자원명',
        width: '170px',
        render: (row) => <div className="inspection-person-cell"><strong>{row.resourceName}</strong><small>{row.resourceCode}</small></div>,
      },
      { key: 'code', header: '자원 코드', render: (row) => row.resourceCode },
      { key: 'type', header: '점검 유형', render: (row) => inspectionTypeMeta[row.type].label },
      { key: 'scheduled', header: '점검 예정일', render: (row) => formatInspectionDate(row.scheduledDate) },
      { key: 'inspector', header: '점검 담당자', render: (row) => row.inspectorName },
      { key: 'result', header: '점검 결과', render: (row) => <InspectionResultBadge result={row.result} /> },
      { key: 'status', header: '상태', render: (row) => <InspectionStatusBadge status={row.status} /> },
      { key: 'createdAt', header: '등록일', render: (row) => formatDateTime(row.createdAt) },
      {
        key: 'actions',
        header: '관리',
        width: '220px',
        align: 'center',
        render: (row) => (
          <div className="inspection-table-actions">
            <Button variant="ghost" size="sm" leadingIcon={<Eye size={14} />} onClick={() => navigate(ROUTES.admin.inspectionDetail(row.id))}>상세</Button>
            {canEditInspection(row.status) && <Button variant="ghost" size="sm" leadingIcon={<Pencil size={14} />} onClick={() => navigate(ROUTES.admin.inspectionEdit(row.id))}>수정</Button>}
            {canCompleteInspection(row.status) && <Button variant="ghost" size="sm" onClick={() => setCompleteTarget(row)}>완료 처리</Button>}
            {canReinspect(row.status) && <Button variant="ghost" size="sm" onClick={() => navigate(`${ROUTES.admin.inspectionNew}?parent=${row.id}`)}>재점검 등록</Button>}
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
      status: (draft.status || null) as InspectionStatus | null,
      type: (draft.type || null) as InspectionType | null,
      result: (draft.result || null) as InspectionResult | null,
      periodStart: draft.periodStart,
      periodEnd: draft.periodEnd,
      page: 1,
    })
  }

  const resetFilters = () => {
    setDraft({ keyword: '', status: '', type: '', result: '', periodStart: '', periodEnd: '' })
    setFilter(defaultInspectionFilter)
  }

  const hasFilters = Boolean(filter.keyword || filter.status || filter.type || filter.result || filter.periodStart || filter.periodEnd)

  return (
    <div className="inspection-list-page">
      <div className="resource-page-heading">
        <div>
          <span><SlidersHorizontal size={14} /> INSPECTION MANAGEMENT</span>
          <h2>점검 목록</h2>
          <p>점검 일정과 결과를 관리합니다.</p>
        </div>
        <Button leadingIcon={<ClipboardPlus size={16} />} onClick={() => navigate(ROUTES.admin.inspectionNew)}>점검 등록</Button>
      </div>

      <SearchFilter keyword={draft.keyword} onKeywordChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} onSearch={applyFilters} onReset={resetFilters} placeholder="점검번호, 자원명, 자원 코드 또는 점검 담당자">
        <Select aria-label="점검 상태" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} placeholder="전체 상태" options={statuses.map((key) => ({ label: inspectionStatusMeta[key].label, value: key }))} />
        <Select aria-label="점검 유형" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} placeholder="전체 유형" options={(Object.keys(inspectionTypeMeta) as InspectionType[]).map((key) => ({ label: inspectionTypeMeta[key].label, value: key }))} />
        <Select aria-label="점검 결과" value={draft.result} onChange={(event) => setDraft((current) => ({ ...current, result: event.target.value }))} placeholder="전체 결과" options={(Object.keys(inspectionResultMeta) as InspectionResult[]).map((key) => ({ label: inspectionResultMeta[key].label, value: key }))} />
        <DatePicker aria-label="점검 기간 시작일" value={draft.periodStart} onChange={(event) => setDraft((current) => ({ ...current, periodStart: event.target.value }))} />
        <DatePicker aria-label="점검 기간 종료일" value={draft.periodEnd} onChange={(event) => setDraft((current) => ({ ...current, periodEnd: event.target.value }))} />
      </SearchFilter>

      <Card padding="none" className="inspection-list-card">
        <div className="inspection-list-toolbar">
          <div><strong>검색 결과 <b>{result?.totalItems ?? 0}</b>건</strong></div>
          <Select
            aria-label="정렬"
            value={`${filter.sortBy}-${filter.sortDirection}`}
            onChange={(event) => {
              const [sortBy, sortDirection] = event.target.value.split('-')
              setFilter({ ...filter, sortBy, sortDirection: sortDirection as 'asc' | 'desc', page: 1 })
            }}
            options={[
              { label: '최근 등록순', value: 'createdAt-desc' },
              { label: '점검 예정일순', value: 'scheduledDate-asc' },
            ]}
          />
        </div>
        {status === 'loading' && <div className="inspection-list-state"><Loading size="lg" label="점검 목록을 불러오는 중입니다" /></div>}
        {status === 'error' && <div className="inspection-list-state"><ErrorState compact title={error ?? '정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'} actionLabel="다시 시도" onAction={refetch} /></div>}
        {status === 'success' && result?.items.length === 0 && (
          <div className="inspection-list-state">
            {hasFilters
              ? <StateDisplay variant="search-empty" compact title="검색 결과가 없습니다" description="검색어나 점검 조건을 변경해 주세요." actionLabel="검색 초기화" onAction={resetFilters} />
              : <EmptyState compact title="등록된 점검이 없습니다" actionLabel="점검 등록" onAction={() => navigate(ROUTES.admin.inspectionNew)} />}
          </div>
        )}
        {status === 'success' && result && result.items.length > 0 && (
          <>
            <Table columns={columns} data={result.items} rowKey={(row) => row.id} caption="관리자 점검 목록" />
            <div className="inspection-list-pagination">
              <span>{(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.totalItems)} / {result.totalItems}건</span>
              <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => setFilter({ ...filter, page })} />
            </div>
          </>
        )}
      </Card>
      {completeTarget && <InspectionCompleteModal key={completeTarget.id} inspection={completeTarget} onClose={() => setCompleteTarget(null)} onSuccess={refetch} />}
    </div>
  )
}

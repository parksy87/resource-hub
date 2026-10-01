import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  ConfirmModal,
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
import { ResourceStatusBadge } from '../../../components/resources/ResourceStatusBadge'
import { resourceStatusMeta } from '../../../config/resource'
import { defaultResourceFilter, useResourceList, useResourceOptions } from '../../../hooks/useResources'
import { ROUTES } from '../../../routes/paths'
import { useFirestoreResources } from '../../../config/backendMode'
import { resourceService } from '../../../services/resourceService'
import { useUiStore } from '../../../stores/uiStore'
import type { ResourceListItem, ResourceStatus } from '../../../types'
import { formatDate } from '../../../utils/date'

interface FilterDraft {
  keyword: string
  categoryId: string
  type: string
  status: string
  location: string
}

const emptyDraft: FilterDraft = {
  keyword: '',
  categoryId: '',
  type: '',
  status: '',
  location: '',
}

export default function ResourceListPage() {
  const navigate = useNavigate()
  const addToast = useUiStore((state) => state.addToast)
  const { filter, setFilter, result, status, error, refetch } = useResourceList()
  const { data: options } = useResourceOptions()
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft)
  const [deleteTarget, setDeleteTarget] = useState<ResourceListItem | null>(null)
  const [seeding, setSeeding] = useState(false)

  async function handleSeedPortfolioSamples() {
    setSeeding(true)
    try {
      const created = await resourceService.seedInitialResources()
      if (created === 0) {
        addToast({ tone: 'info', title: '이미 등록된 자원이 있어 샘플을 추가하지 않았습니다.' })
      } else {
        addToast({ tone: 'success', title: `포트폴리오 샘플 ${created}건을 등록했습니다.` })
      }
      refetch()
    } catch {
      addToast({ tone: 'error', title: '샘플 자원을 등록하지 못했습니다.', description: '관리자 로그인과 Firestore 권한을 확인해 주세요.' })
    } finally {
      setSeeding(false)
    }
  }

  const applyDraft = () => {
    setFilter({
      ...filter,
      keyword: draft.keyword,
      categoryId: draft.categoryId ? Number(draft.categoryId) : null,
      type: draft.type,
      status: (draft.status || null) as ResourceStatus | null,
      location: draft.location,
      page: 1,
    })
  }

  const resetFilters = () => {
    setDraft(emptyDraft)
    setFilter(defaultResourceFilter)
  }

  const columns = useMemo<TableColumn<ResourceListItem>[]>(
    () => [
      {
        key: 'code',
        header: '자원 코드',
        width: '130px',
        render: (row) => <strong className="resource-code">{row.resourceCode}</strong>,
      },
      {
        key: 'name',
        header: '자원명',
        width: '190px',
        render: (row) => (
          <button
            className="resource-name-link"
            type="button"
            onClick={() => navigate(ROUTES.admin.resourceDetail(row.id))}
          >
            {row.name}
          </button>
        ),
      },
      { key: 'category', header: '분류', render: (row) => row.categoryName },
      { key: 'type', header: '유형', render: (row) => row.typeName },
      { key: 'location', header: '보관 위치', render: (row) => row.location },
      { key: 'manager', header: '담당자', render: (row) => row.managerName },
      { key: 'quantity', header: '수량', align: 'right', render: (row) => `${row.totalQuantity}개` },
      { key: 'status', header: '상태', render: (row) => <ResourceStatusBadge status={row.status} /> },
      { key: 'createdAt', header: '등록일', render: (row) => formatDate(row.createdAt) },
      {
        key: 'actions',
        header: '관리',
        width: '190px',
        align: 'center',
        render: (row) => (
          <div className="resource-table-actions">
            <Button variant="ghost" size="sm" leadingIcon={<Eye size={14} />} onClick={() => navigate(ROUTES.admin.resourceDetail(row.id))}>상세</Button>
            <Button variant="ghost" size="sm" leadingIcon={<Pencil size={14} />} onClick={() => navigate(ROUTES.admin.resourceEdit(row.id))}>수정</Button>
            <Button variant="ghost" size="sm" leadingIcon={<Trash2 size={14} />} onClick={() => setDeleteTarget(row)}>삭제</Button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  const hasFilters =
    Boolean(filter.keyword) ||
    Boolean(filter.categoryId) ||
    Boolean(filter.type) ||
    Boolean(filter.status) ||
    Boolean(filter.location)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await resourceService.deleteResource(deleteTarget.id)
      addToast({
        tone: 'success',
        title: '자원을 삭제했습니다.',
        description: `${deleteTarget.name} (${deleteTarget.resourceCode})`,
      })
      refetch()
    } catch {
      addToast({ tone: 'error', title: '자원을 삭제하지 못했습니다.' })
    }
  }

  return (
    <div className="resource-list-page">
      <div className="resource-page-heading">
        <div>
          <span><SlidersHorizontal size={14} /> RESOURCE MANAGEMENT</span>
          <h2>자원 목록</h2>
          <p>등록된 자원의 위치, 담당자와 운영 상태를 조회하고 관리합니다.</p>
        </div>
        <Button leadingIcon={<Plus size={17} />} onClick={() => navigate(ROUTES.admin.resourceNew)}>
          자원 등록
        </Button>
      </div>

      <SearchFilter
        keyword={draft.keyword}
        onKeywordChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
        onSearch={applyDraft}
        onReset={resetFilters}
        placeholder="자원명, 자원 코드 또는 담당자"
      >
        <Select
          aria-label="자원 분류"
          value={draft.categoryId}
          onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value, type: '' }))}
          placeholder="전체 분류"
          options={(options?.categories ?? []).map((item) => ({ label: item.name, value: String(item.id) }))}
        />
        <Select
          aria-label="자원 유형"
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
          placeholder="전체 유형"
          options={(options?.types ?? [])
            .filter((item) => !draft.categoryId || item.categoryId === Number(draft.categoryId))
            .map((item) => ({ label: item.name, value: item.code }))}
        />
        <Select
          aria-label="자원 상태"
          value={draft.status}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
          placeholder="전체 상태"
          options={(Object.keys(resourceStatusMeta) as ResourceStatus[]).map((key) => ({
            label: resourceStatusMeta[key].label,
            value: key,
          }))}
        />
        <Select
          aria-label="보관 위치"
          value={draft.location}
          onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
          placeholder="전체 위치"
          options={(options?.locations ?? []).map((item) => ({ label: item, value: item }))}
        />
      </SearchFilter>

      <Card padding="none" className="resource-list-card">
        <div className="resource-list-toolbar">
          <div>
            <strong>검색 결과 <b>{result?.totalItems ?? 0}</b>건</strong>
            <span>자원 정보를 클릭하면 상세 화면으로 이동합니다.</span>
          </div>
          <Select
            aria-label="정렬"
            value={`${filter.sortBy}-${filter.sortDirection}`}
            onChange={(event) => {
              const [sortBy, sortDirection] = event.target.value.split('-')
              setFilter({
                ...filter,
                sortBy,
                sortDirection: sortDirection as 'asc' | 'desc',
                page: 1,
              })
            }}
            options={[
              { label: '최근 등록순', value: 'createdAt-desc' },
              { label: '오래된 등록순', value: 'createdAt-asc' },
              { label: '자원명 오름차순', value: 'name-asc' },
              { label: '자원 코드순', value: 'resourceCode-asc' },
            ]}
          />
        </div>

        {status === 'loading' && <div className="resource-list-state"><Loading size="lg" label="자원 목록을 불러오는 중입니다" /></div>}
        {status === 'error' && <div className="resource-list-state"><ErrorState compact title={error ?? '정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'} actionLabel="다시 시도" onAction={refetch} /></div>}
        {status === 'success' && result && result.items.length === 0 && (
          <div className="resource-list-state">
            {hasFilters ? (
              <StateDisplay variant="search-empty" compact title="검색 결과가 없습니다" description="검색어나 필터 조건을 변경해보세요." actionLabel="검색 초기화" onAction={resetFilters} />
            ) : (
              <div className="resource-list-state">
                <EmptyState
                  compact
                  title="등록된 자원이 없습니다"
                  description={
                    useFirestoreResources()
                      ? '첫 자원을 등록하거나 포트폴리오용 샘플을 Firestore에 추가할 수 있습니다.'
                      : '첫 자원을 등록하거나 mock 데이터를 확인해 주세요.'
                  }
                  actionLabel="자원 등록"
                  onAction={() => navigate(ROUTES.admin.resourceNew)}
                />
                {useFirestoreResources() && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <Button size="sm" variant="outline" isLoading={seeding} onClick={() => void handleSeedPortfolioSamples()}>
                      포트폴리오 샘플 6건 등록
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {status === 'success' && result && result.items.length > 0 && (
          <>
            <Table columns={columns} data={result.items} rowKey={(row) => row.id} caption="자원 목록" />
            <div className="resource-list-pagination">
              <span>{(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.totalItems)} / {result.totalItems}개</span>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onChange={(page) => setFilter({ ...filter, page })}
              />
            </div>
          </>
        )}
      </Card>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="해당 자원을 삭제하시겠습니까?"
        description={deleteTarget ? `${deleteTarget.name} (${deleteTarget.resourceCode}) 자원을 삭제합니다. 이 작업은 되돌릴 수 없습니다.` : ''}
        confirmLabel="자원 삭제"
      />
    </div>
  )
}

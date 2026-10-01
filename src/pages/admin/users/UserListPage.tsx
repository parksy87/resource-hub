import { useMemo, useState } from 'react'
import { Eye, Pencil, ShieldAlert, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserStatusModal } from '../../../components/users/UserStatusModal'
import { UserRoleBadge, UserStatusBadge } from '../../../components/users/UserStatusBadge'
import {
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
  Button,
  type TableColumn,
} from '../../../components/ui'
import { userRoleMeta, userStatusMeta } from '../../../config/user'
import { defaultUserFilter, useUserList } from '../../../hooks/useUsers'
import { ROUTES } from '../../../routes/paths'
import type { ManagedUserRole, UserListItem, UserStatus } from '../../../types'
import { formatDate } from '../../../utils/date'
import { canManageUser } from '../../../utils/user'

interface FilterDraft {
  keyword: string
  status: string
  role: string
  joinedDate: string
}

const statuses = Object.keys(userStatusMeta) as UserStatus[]

export default function UserListPage() {
  const navigate = useNavigate()
  const { filter, setFilter, result, status, error, refetch } = useUserList()
  const [draft, setDraft] = useState<FilterDraft>({ keyword: '', status: '', role: '', joinedDate: '' })
  const [statusTarget, setStatusTarget] = useState<UserListItem | null>(null)

  const columns = useMemo<TableColumn<UserListItem>[]>(
    () => [
      {
        key: 'name',
        header: '사용자명',
        width: '140px',
        render: (row) => (
          <button className="user-name-link" type="button" onClick={() => navigate(ROUTES.admin.userDetail(row.id))}>{row.name}</button>
        ),
      },
      { key: 'email', header: '이메일', render: (row) => row.email },
      { key: 'phone', header: '전화번호', render: (row) => row.phone ?? '-' },
      { key: 'organization', header: '소속', render: (row) => row.organization },
      { key: 'role', header: '사용자 유형', render: (row) => <UserRoleBadge role={row.role} /> },
      { key: 'status', header: '상태', render: (row) => <UserStatusBadge status={row.status} /> },
      { key: 'joinedAt', header: '가입일', render: (row) => formatDate(row.joinedAt) },
      { key: 'lastUsedAt', header: '최근 이용일', render: (row) => row.lastUsedAt ? formatDate(row.lastUsedAt) : '-' },
      {
        key: 'actions',
        header: '관리',
        width: '220px',
        align: 'center',
        render: (row) => (
          <div className="user-table-actions">
            <Button variant="ghost" size="sm" leadingIcon={<Eye size={14} />} onClick={() => navigate(ROUTES.admin.userDetail(row.id))}>상세</Button>
            {canManageUser(row.status) && <Button variant="ghost" size="sm" leadingIcon={<Pencil size={14} />} onClick={() => navigate(ROUTES.admin.userEdit(row.id))}>수정</Button>}
            {canManageUser(row.status) && <Button variant="ghost" size="sm" leadingIcon={<ShieldAlert size={14} />} onClick={() => setStatusTarget(row)}>상태 변경</Button>}
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
      status: (draft.status || null) as UserStatus | null,
      role: (draft.role || null) as ManagedUserRole | null,
      joinedDate: draft.joinedDate,
      page: 1,
    })
  }

  const resetFilters = () => {
    setDraft({ keyword: '', status: '', role: '', joinedDate: '' })
    setFilter(defaultUserFilter)
  }

  const hasFilters = Boolean(filter.keyword || filter.status || filter.role || filter.joinedDate)

  return (
    <div className="user-list-page">
      <div className="resource-page-heading">
        <div>
          <span><UsersRound size={14} /> USER MANAGEMENT</span>
          <h2>사용자 목록</h2>
          <p>사용자 정보와 이용 상태를 관리합니다.</p>
        </div>
      </div>

      <SearchFilter keyword={draft.keyword} onKeywordChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} onSearch={applyFilters} onReset={resetFilters} placeholder="이름, 이메일, 전화번호 또는 소속">
        <Select aria-label="사용자 상태" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} placeholder="전체 상태" options={statuses.map((key) => ({ label: userStatusMeta[key].label, value: key }))} />
        <Select aria-label="사용자 유형" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} placeholder="전체 유형" options={[{ label: userRoleMeta.USER.label, value: 'USER' }, { label: userRoleMeta.ADMIN.label, value: 'ADMIN' }]} />
        <DatePicker aria-label="가입일" value={draft.joinedDate} onChange={(event) => setDraft((current) => ({ ...current, joinedDate: event.target.value }))} />
      </SearchFilter>

      <Card padding="none" className="user-list-card">
        <div className="user-list-toolbar">
          <div><strong>검색 결과 <b>{result?.totalItems ?? 0}</b>건</strong><span>이용정지와 탈퇴 사용자는 상태를 먼저 확인합니다.</span></div>
        </div>
        {status === 'loading' && <div className="user-list-state"><Loading size="lg" label="사용자 목록을 불러오는 중입니다" /></div>}
        {status === 'error' && <div className="user-list-state"><ErrorState compact title={error ?? '정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'} actionLabel="다시 시도" onAction={refetch} /></div>}
        {status === 'success' && result?.items.length === 0 && (
          <div className="user-list-state">
            {hasFilters
              ? <StateDisplay variant="search-empty" compact title="검색 결과가 없습니다" description="검색어나 필터 조건을 변경해 주세요." actionLabel="검색 초기화" onAction={resetFilters} />
              : <EmptyState compact title="등록된 사용자가 없습니다" />}
          </div>
        )}
        {status === 'success' && result && result.items.length > 0 && (
          <>
            <Table columns={columns} data={result.items} rowKey={(row) => row.id} caption="관리자 사용자 목록" />
            <div className="user-list-pagination">
              <span>{(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.totalItems)} / {result.totalItems}건</span>
              <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => setFilter({ ...filter, page })} />
            </div>
          </>
        )}
      </Card>
      {statusTarget && <UserStatusModal key={statusTarget.id} user={statusTarget} onClose={() => setStatusTarget(null)} onSuccess={refetch} />}
    </div>
  )
}

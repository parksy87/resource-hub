import { Link } from 'react-router-dom'
import { reservationStatusMeta } from '../../config/reservation'
import { resourceStatusMeta } from '../../config/resource'
import { Badge, EmptyState, Table, type TableColumn } from '../ui'
import { ROUTES } from '../../routes/paths'
import type { RecentReservation, RecentResource } from '../../types'
import { formatDate, formatDateTime, formatMonthDay } from '../../utils/date'

const reservationColumns: TableColumn<RecentReservation>[] = [
  {
    key: 'number',
    header: '예약번호',
    render: (row) => (
      <Link className="dashboard-table-link" to={`${ROUTES.admin.reservations}?id=${row.id}`}>
        {row.reservationNumber}
      </Link>
    ),
  },
  { key: 'resource', header: '자원명', render: (row) => <strong className="dashboard-resource-name">{row.resourceName}</strong> },
  { key: 'applicant', header: '신청자', render: (row) => row.applicantName },
  {
    key: 'period',
    header: '예약기간',
    render: (row) => `${formatMonthDay(row.startDate)} – ${formatMonthDay(row.endDate)}`,
  },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge tone={reservationStatusMeta[row.status].tone} dot>{reservationStatusMeta[row.status].label}</Badge>,
  },
  { key: 'requestedAt', header: '신청일', render: (row) => formatDateTime(row.requestedAt) },
]

const resourceColumns: TableColumn<RecentResource>[] = [
  {
    key: 'name',
    header: '자원명',
    render: (row) => (
      <div className="dashboard-resource-cell">
        <Link to={ROUTES.admin.resourceDetail(row.id)}>{row.name}</Link>
        <small>{row.resourceCode}</small>
      </div>
    ),
  },
  { key: 'category', header: '카테고리', render: (row) => row.categoryName },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge tone={resourceStatusMeta[row.status].tone} dot>{resourceStatusMeta[row.status].label}</Badge>,
  },
  { key: 'date', header: '등록일', align: 'right', render: (row) => formatDate(row.registeredAt) },
]

export function RecentReservationsTable({ items }: { items: RecentReservation[] }) {
  return (
    <Table
      columns={reservationColumns}
      data={items}
      rowKey={(row) => row.id}
      caption="최근 예약 현황"
      emptyContent={
        <EmptyState
          compact
          title="최근 예약이 없습니다"
          description="새로운 예약 신청이 접수되면 이곳에 표시됩니다."
        />
      }
    />
  )
}

export function RecentResourcesTable({ items }: { items: RecentResource[] }) {
  return (
    <Table
      columns={resourceColumns}
      data={items}
      rowKey={(row) => row.id}
      caption="최근 등록 자원"
      emptyContent={
        <EmptyState
          compact
          title="최근 등록된 자원이 없습니다"
          description="자원을 등록하면 최근 순서대로 확인할 수 있습니다."
        />
      }
    />
  )
}

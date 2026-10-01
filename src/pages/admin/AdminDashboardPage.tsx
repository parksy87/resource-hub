import { ArrowRight, Clock3, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPageState } from '../../components/admin/AdminPageState'
import { ResourceCategoryChart, ResourceStatusChart } from '../../components/dashboard/DashboardCharts'
import { DashboardSummary, WorkAlerts } from '../../components/dashboard/DashboardSummary'
import { RecentReservationsTable, RecentResourcesTable } from '../../components/dashboard/DashboardTables'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { UpcomingReturns } from '../../components/dashboard/UpcomingReturns'
import { Badge, Button, Card } from '../../components/ui'
import { useDashboard } from '../../hooks/useDashboard'
import { ROUTES } from '../../routes/paths'
import { formatDateTime } from '../../utils/date'

export default function AdminDashboardPage() {
  const { data, status, error, refetch } = useDashboard()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="admin-dashboard-state">
        <AdminPageState type="loading" title="운영 현황을 불러오는 중입니다" />
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="admin-dashboard-state">
        <AdminPageState
          type="error"
          title={error ?? '대시보드 정보를 불러오지 못했습니다'}
          description="잠시 후 다시 시도해주세요."
          onAction={refetch}
        />
      </div>
    )
  }

  const totalResources = data.summary.find((item) => item.key === 'total')?.value ?? 0

  return (
    <div className="admin-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome__eyebrow"><Sparkles size={14} /> TODAY'S OVERVIEW</span>
          <h2>안녕하세요, 김관리님</h2>
          <p>오늘의 자원 현황과 우선 처리할 업무를 확인하세요.</p>
        </div>
        <div className="dashboard-welcome__meta">
          <span><Clock3 size={14} /> {formatDateTime(data.generatedAt)} 기준</span>
          <Badge tone="green" dot>시스템 정상</Badge>
          <Button variant="outline" size="sm" leadingIcon={<RefreshCw size={15} />} onClick={refetch}>
            새로고침
          </Button>
        </div>
      </section>

      <DashboardSummary items={data.summary} />

      <Card
        title="업무 알림"
        description="오늘 우선적으로 확인해야 할 업무입니다."
        action={<Badge tone="red">{data.workAlerts.reduce((sum, alert) => sum + alert.count, 0)}건 확인 필요</Badge>}
      >
        <WorkAlerts alerts={data.workAlerts} />
      </Card>

      <div className="dashboard-grid dashboard-grid--primary">
        <Card
          padding="none"
          title="최근 예약 현황"
          description="최근 접수된 예약 신청과 처리 상태입니다."
          action={<DashboardCardLink to={ROUTES.admin.reservations}>전체 예약 보기</DashboardCardLink>}
        >
          <RecentReservationsTable items={data.recentReservations} />
        </Card>
        <Card
          title="반납 예정"
          description="기한이 임박한 자원부터 확인하세요."
          action={<DashboardCardLink to={ROUTES.admin.rentals}>전체 보기</DashboardCardLink>}
        >
          <UpcomingReturns items={data.upcomingReturns} />
        </Card>
      </div>

      <div className="dashboard-grid dashboard-grid--charts">
        <Card title="자원 상태 현황" description="현재 운영 중인 전체 자원의 상태 비율입니다.">
          <ResourceStatusChart items={data.resourceStatuses} total={totalResources} />
        </Card>
        <Card title="자원 카테고리 현황" description="카테고리별 등록 자원 수와 비율입니다.">
          <ResourceCategoryChart items={data.resourceCategories} />
        </Card>
      </div>

      <div className="dashboard-grid dashboard-grid--bottom">
        <Card
          padding="none"
          title="최근 등록 자원"
          description="최근 시스템에 추가된 자원입니다."
          action={<DashboardCardLink to={ROUTES.admin.resources}>전체 자원 보기</DashboardCardLink>}
        >
          <RecentResourcesTable items={data.recentResources} />
        </Card>
        <Card title="빠른 메뉴" description="자주 사용하는 관리 업무로 바로 이동합니다.">
          <QuickActions />
        </Card>
      </div>
    </div>
  )
}

function DashboardCardLink({ to, children }: { to: string; children: string }) {
  return (
    <Link className="dashboard-card-link" to={to}>
      {children}
      <ArrowRight size={14} />
    </Link>
  )
}

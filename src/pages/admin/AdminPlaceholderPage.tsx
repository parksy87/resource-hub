import { Badge, Card } from '../../components/ui'
import { AdminPageState } from '../../components/admin/AdminPageState'

interface AdminPlaceholderPageProps {
  title: string
  description: string
  phase: string
}

export default function AdminPlaceholderPage({
  title,
  description,
  phase,
}: AdminPlaceholderPageProps) {
  return (
    <div className="admin-placeholder-page">
      <div className="admin-page-intro">
        <div>
          <div className="admin-page-intro__label">
            <Badge tone="blue">{phase}</Badge>
            <span>관리자 서비스</span>
          </div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Badge tone="green" dot>Layout ready</Badge>
      </div>
      <Card padding="none" className="admin-placeholder-card">
        <AdminPageState
          type="coming-soon"
          title={`${title} 기능은 준비 중입니다`}
          description="현재 단계에서는 관리자 공통 레이아웃과 라우팅만 제공합니다. 실제 데이터와 업무 기능은 후속 단계에서 구현됩니다."
        />
      </Card>
    </div>
  )
}

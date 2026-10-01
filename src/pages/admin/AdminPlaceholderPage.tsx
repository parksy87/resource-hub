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
        <Badge tone="neutral">준비 중</Badge>
      </div>
      <Card padding="none" className="admin-placeholder-card">
        <AdminPageState
          type="coming-soon"
          title={`${title} 기능은 준비 중입니다`}
          description="메뉴를 준비 중입니다."
        />
      </Card>
    </div>
  )
}

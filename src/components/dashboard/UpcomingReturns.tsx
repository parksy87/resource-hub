import { AlertTriangle, CalendarClock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, type BadgeTone } from '../ui'
import { ROUTES } from '../../routes/paths'
import type { UpcomingReturn, UpcomingReturnStatus } from '../../types'
import { formatDate } from '../../utils/date'
import { cn } from '../../utils/cn'

const statusMeta: Record<UpcomingReturnStatus, { label: string; tone: BadgeTone }> = {
  ON_SCHEDULE: { label: '대여 중', tone: 'blue' },
  DUE_SOON: { label: '반납 임박', tone: 'yellow' },
  OVERDUE: { label: '연체', tone: 'red' },
}

function getRemainingLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}일 지연`
  if (days === 0) return '오늘 반납'
  return `D-${days}`
}

export function UpcomingReturns({ items }: { items: UpcomingReturn[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        compact
        title="반납 예정 자원이 없습니다"
        description="현재 대여 중인 자원의 반납 일정이 없습니다."
      />
    )
  }

  return (
    <div className="dashboard-return-list">
      {items.map((item) => (
        <Link
          key={item.id}
          className={cn('dashboard-return-item', `is-${item.status.toLowerCase()}`)}
          to={`${ROUTES.admin.rentals}?id=${item.id}`}
        >
          <span className="dashboard-return-item__icon">
            {item.status === 'OVERDUE' ? <AlertTriangle size={18} /> : <CalendarClock size={18} />}
          </span>
          <div className="dashboard-return-item__resource">
            <strong>{item.resourceName}</strong>
            <small>{item.resourceCode} · {item.userName}</small>
          </div>
          <div className="dashboard-return-item__due">
            <small>{formatDate(item.dueDate)}</small>
            <strong>{getRemainingLabel(item.daysRemaining)}</strong>
          </div>
          <Badge tone={statusMeta[item.status].tone}>{statusMeta[item.status].label}</Badge>
          <ChevronRight className="dashboard-return-item__arrow" size={16} />
        </Link>
      ))}
    </div>
  )
}

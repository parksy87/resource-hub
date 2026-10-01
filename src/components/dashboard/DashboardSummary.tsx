import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardSummaryItem, DashboardSummaryKey, WorkAlert } from '../../types'
import { cn } from '../../utils/cn'

const summaryIcons: Record<DashboardSummaryKey, LucideIcon> = {
  total: Boxes,
  available: CheckCircle2,
  reserved: CalendarCheck2,
  rented: Truck,
  inspection: ClipboardCheck,
}

export function DashboardSummary({ items }: { items: DashboardSummaryItem[] }) {
  return (
    <section className="dashboard-summary" aria-label="자원 현황 요약">
      {items.map((item) => {
        const Icon = summaryIcons[item.key]
        return (
          <Link
            key={item.key}
            className={cn('dashboard-summary-card', `dashboard-summary-card--${item.key}`)}
            to={item.targetPath}
          >
            <div className="dashboard-summary-card__top">
              <span className="dashboard-summary-card__icon"><Icon size={20} /></span>
              {item.change !== undefined && (
                <span className={cn('dashboard-summary-card__change', item.change < 0 && 'is-down')}>
                  {item.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(item.change)}%
                </span>
              )}
            </div>
            <span className="dashboard-summary-card__label">{item.label}</span>
            <strong>{item.value.toLocaleString()}</strong>
            <p>{item.description}</p>
          </Link>
        )
      })}
    </section>
  )
}

export function WorkAlerts({ alerts }: { alerts: WorkAlert[] }) {
  return (
    <div className="dashboard-work-alerts">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          to={alert.targetPath}
          className={cn('dashboard-work-alert', `dashboard-work-alert--${alert.tone}`)}
        >
          <span className="dashboard-work-alert__icon"><Activity size={17} /></span>
          <div>
            <strong>{alert.title}</strong>
            <p>{alert.description}</p>
          </div>
          <b>{alert.count}</b>
        </Link>
      ))}
    </div>
  )
}

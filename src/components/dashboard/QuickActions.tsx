import {
  ArrowUpRight,
  CalendarSearch,
  ClipboardPlus,
  PackagePlus,
  PackageCheck,
  RotateCcw,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'

interface QuickAction {
  label: string
  description: string
  path: string
  icon: LucideIcon
}

const quickActions: QuickAction[] = [
  { label: '자원 등록', description: '새 자원 추가', path: ROUTES.admin.resourceNew, icon: PackagePlus },
  { label: '예약 확인', description: '승인 대기 검토', path: `${ROUTES.admin.reservations}?status=PENDING`, icon: CalendarSearch },
  { label: '대여 처리', description: '승인 예약 대여', path: `${ROUTES.admin.rentals}?action=checkout`, icon: PackageCheck },
  { label: '반납 처리', description: '반납 상태 확인', path: `${ROUTES.admin.rentals}?action=return`, icon: RotateCcw },
  { label: '점검 등록', description: '점검 일정 추가', path: `${ROUTES.admin.inspections}?action=new`, icon: ClipboardPlus },
  { label: '사용자 관리', description: '사용자 상태 확인', path: ROUTES.admin.users, icon: UsersRound },
]

export function QuickActions() {
  return (
    <div className="dashboard-quick-actions">
      {quickActions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.label} to={action.path}>
            <span><Icon size={19} /></span>
            <div><strong>{action.label}</strong><small>{action.description}</small></div>
            <ArrowUpRight size={14} />
          </Link>
        )
      })}
    </div>
  )
}

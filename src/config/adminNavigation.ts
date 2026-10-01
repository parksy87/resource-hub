import {
  BarChart3,
  CalendarCheck2,
  ClipboardCheck,
  Gauge,
  PackageSearch,
  Settings2,
  Truck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '../routes/paths'

export interface AdminNavChild {
  label: string
  path: string
}

export interface AdminNavItem {
  label: string
  path: string
  icon: LucideIcon
  children?: AdminNavChild[]
}

export const adminNavigation: AdminNavItem[] = [
  { label: '대시보드', path: ROUTES.admin.dashboard, icon: Gauge },
  {
    label: '자원 관리',
    path: ROUTES.admin.resources,
    icon: PackageSearch,
    children: [
      { label: '자원 목록', path: ROUTES.admin.resources },
      { label: '자원 등록', path: ROUTES.admin.resourceNew },
    ],
  },
  {
    label: '예약 관리',
    path: ROUTES.admin.reservations,
    icon: CalendarCheck2,
    children: [{ label: '예약 목록', path: ROUTES.admin.reservations }],
  },
  {
    label: '대여·반납 관리',
    path: ROUTES.admin.rentals,
    icon: Truck,
    children: [{ label: '대여 목록', path: ROUTES.admin.rentals }],
  },
  {
    label: '점검 관리',
    path: ROUTES.admin.inspections,
    icon: ClipboardCheck,
    children: [
      { label: '점검 목록', path: ROUTES.admin.inspections },
      { label: '점검 등록', path: ROUTES.admin.inspectionNew },
    ],
  },
  {
    label: '사용자 관리',
    path: ROUTES.admin.users,
    icon: UsersRound,
    children: [{ label: '사용자 목록', path: ROUTES.admin.users }],
  },
  { label: '통계', path: ROUTES.admin.statistics, icon: BarChart3 },
  { label: '시스템 설정', path: ROUTES.admin.settings, icon: Settings2 },
]

export function getAdminPageMeta(pathname: string) {
  const resourceEditMatch = pathname.match(/^\/admin\/resources\/([^/]+)\/edit$/)
  if (resourceEditMatch) {
    const resourceId = resourceEditMatch[1]
    return {
      title: '자원 수정',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '자원 관리', href: ROUTES.admin.resources },
        { label: '자원 상세', href: ROUTES.admin.resourceDetail(resourceId) },
        { label: '자원 수정' },
      ],
    }
  }

  if (/^\/admin\/resources\/[^/]+$/.test(pathname) && pathname !== ROUTES.admin.resourceNew) {
    return {
      title: '자원 상세',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '자원 관리', href: ROUTES.admin.resources },
        { label: '자원 상세' },
      ],
    }
  }

  const inspectionEditMatch = pathname.match(/^\/admin\/inspections\/([^/]+)\/edit$/)
  if (inspectionEditMatch) {
    const inspectionId = inspectionEditMatch[1]
    return {
      title: '점검 수정',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '점검 관리', href: ROUTES.admin.inspections },
        { label: '점검 상세', href: ROUTES.admin.inspectionDetail(inspectionId) },
        { label: '점검 수정' },
      ],
    }
  }

  if (/^\/admin\/inspections\/[^/]+$/.test(pathname) && pathname !== ROUTES.admin.inspectionNew) {
    return {
      title: '점검 상세',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '점검 관리', href: ROUTES.admin.inspections },
        { label: '점검 상세' },
      ],
    }
  }

  const userEditMatch = pathname.match(/^\/admin\/users\/([^/]+)\/edit$/)
  if (userEditMatch) {
    const userId = userEditMatch[1]
    return {
      title: '사용자 수정',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '사용자 관리', href: ROUTES.admin.users },
        { label: '사용자 상세', href: ROUTES.admin.userDetail(userId) },
        { label: '사용자 수정' },
      ],
    }
  }

  if (/^\/admin\/users\/[^/]+$/.test(pathname)) {
    return {
      title: '사용자 상세',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '사용자 관리', href: ROUTES.admin.users },
        { label: '사용자 상세' },
      ],
    }
  }

  if (/^\/admin\/rentals\/[^/]+$/.test(pathname)) {
    return {
      title: '대여 상세',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '대여·반납 관리', href: ROUTES.admin.rentals },
        { label: '대여 상세' },
      ],
    }
  }

  if (/^\/admin\/reservations\/[^/]+$/.test(pathname)) {
    return {
      title: '예약 상세',
      breadcrumbs: [
        { label: '관리자', href: ROUTES.admin.dashboard },
        { label: '예약 관리', href: ROUTES.admin.reservations },
        { label: '예약 상세' },
      ],
    }
  }

  for (const item of adminNavigation) {
    const child = item.children?.find((entry) => entry.path === pathname)
    if (child) {
      return {
        title: child.label,
        breadcrumbs: [
          { label: '관리자', href: ROUTES.admin.dashboard },
          { label: item.label, href: item.path },
          { label: child.label },
        ],
      }
    }
    if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      return {
        title: item.label,
        breadcrumbs: [{ label: '관리자', href: ROUTES.admin.dashboard }, { label: item.label }],
      }
    }
  }

  return {
    title: '관리자',
    breadcrumbs: [{ label: '관리자' }],
  }
}

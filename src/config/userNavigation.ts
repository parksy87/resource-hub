import { ROUTES } from '../routes/paths'

export interface UserNavItem {
  label: string
  to: string
  end: boolean
}

export const userNavigation: UserNavItem[] = [
  { label: '홈', to: ROUTES.user.home, end: true },
  { label: '자원', to: ROUTES.user.resources, end: false },
  { label: '예약', to: ROUTES.user.reservations, end: true },
  { label: '예약 내역', to: ROUTES.user.reservationHistory, end: false },
  { label: '대여·반납', to: ROUTES.user.rentals, end: false },
  { label: '알림', to: ROUTES.user.notifications, end: false },
  { label: '마이페이지', to: ROUTES.user.mypage, end: false },
]

export const userFooterInfo = {
  serviceName: 'Resource Hub',
  organizationName: '리소스허브 운영팀',
  phone: '010-1000-2001',
  email: 'admin.kim@resource.co.kr',
  copyright: '© 2026 Resource Hub',
}

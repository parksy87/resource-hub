import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loading } from '../ui'
import { ROUTES } from '../../routes/paths'
import { useAdminSessionStore } from '../../stores/adminSessionStore'
import { hasAdminRole } from '../../stores/userSessionStore'

export function AdminAuthGuard() {
  const location = useLocation()
  const isLoading = useAdminSessionStore((state) => state.isLoading)
  const isAuthenticated = useAdminSessionStore((state) => state.isAuthenticated)
  const role = useAdminSessionStore((state) => state.role)

  if (isLoading) {
    return (
      <div className="admin-content" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <Loading size="lg" label="인증 상태를 확인하는 중입니다" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.admin.login} replace state={{ from: location.pathname }} />
  }

  if (!hasAdminRole(role)) {
    return <Navigate to={ROUTES.user.home} replace state={{ reason: 'admin_required' }} />
  }

  return <Outlet />
}

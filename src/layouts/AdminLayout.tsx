import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { getAdminPageMeta } from '../config/adminNavigation'
import { cn } from '../utils/cn'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenu, setMobileMenu] = useState({ pathname, open: false })
  if (mobileMenu.pathname !== pathname) {
    setMobileMenu({ pathname, open: false })
  }
  const mobileOpen = mobileMenu.open
  const pageMeta = getAdminPageMeta(pathname)
  const closeMobile = useCallback(() => setMobileMenu({ pathname, open: false }), [pathname])

  return (
    <div className={cn('admin-shell', collapsed && 'is-sidebar-collapsed')}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={closeMobile}
      />
      <div className="admin-shell__body">
        <AdminHeader
          title={pageMeta.title}
          breadcrumbs={pageMeta.breadcrumbs}
          onOpenMobileMenu={() => setMobileMenu({ pathname, open: true })}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

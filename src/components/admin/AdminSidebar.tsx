import { useEffect, useRef, useState } from 'react'
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { adminNavigation, type AdminNavItem } from '../../config/adminNavigation'
import { ROUTES } from '../../routes/paths'
import { cn } from '../../utils/cn'
import { Tooltip } from '../ui'

interface AdminSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const { pathname } = useLocation()
  const [openMenus, setOpenMenus] = useState<string[]>(() =>
    adminNavigation
      .filter(
        (item) =>
          item.children &&
          (item.children.some((child) => child.path === pathname) ||
            pathname.startsWith(`${item.path}/`)),
      )
      .map((item) => item.path),
  )

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 1100px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1100px)')
    const update = () => setIsCompact(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen, onCloseMobile])

  const toggleSubmenu = (path: string) => {
    setOpenMenus((current) =>
      current.includes(path) ? current.filter((item) => item !== path) : [...current, path],
    )
  }

  return (
    <>
      <div
        className={cn('admin-sidebar-backdrop', mobileOpen && 'is-visible')}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'admin-sidebar',
          collapsed && 'is-collapsed',
          mobileOpen && 'is-mobile-open',
        )}
        inert={isCompact && !mobileOpen ? true : undefined}
      >
        <div className="admin-sidebar__brand">
          <NavLink
            to={ROUTES.admin.dashboard}
            aria-label="Resource Hub 관리자 홈"
            onClick={onCloseMobile}
          >
            <span className="admin-sidebar__logo"><Boxes size={22} /></span>
            <span className="admin-sidebar__brand-copy">
              <strong>Resource Hub</strong>
              <small>ADMIN CONSOLE</small>
            </span>
          </NavLink>
          <button
            ref={closeButtonRef}
            className="admin-sidebar__mobile-close"
            type="button"
            aria-label="메뉴 닫기"
            onClick={onCloseMobile}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar__section-label">WORKSPACE</div>
        <nav className="admin-sidebar__nav" aria-label="관리자 메뉴">
          {adminNavigation.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              isOpen={openMenus.includes(item.path)}
              onToggle={() => toggleSubmenu(item.path)}
              onNavigate={onCloseMobile}
            />
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Tooltip label="도움말" position="top">
            <button type="button" className="admin-sidebar__help">
              <CircleHelp size={19} />
              <span>도움말</span>
              <ChevronRight size={15} />
            </button>
          </Tooltip>
          <div className="admin-sidebar__environment">
            <span />
            <div><strong>시스템 정상</strong><small>Demo environment</small></div>
          </div>
        </div>

        <button
          className="admin-sidebar__collapse"
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          <span>{collapsed ? '펼치기' : '사이드바 접기'}</span>
        </button>
      </aside>
    </>
  )
}

interface SidebarItemProps {
  item: AdminNavItem
  pathname: string
  collapsed: boolean
  isOpen: boolean
  onToggle: () => void
  onNavigate: () => void
}

function SidebarItem({
  item,
  pathname,
  collapsed,
  isOpen,
  onToggle,
  onNavigate,
}: SidebarItemProps) {
  const Icon = item.icon
  const isExactOrChild =
    pathname === item.path ||
    pathname.startsWith(`${item.path}/`) ||
    item.children?.some((child) => child.path === pathname)

  const link = (
    <NavLink
      to={item.path}
      end={item.path === ROUTES.admin.dashboard}
      className={cn('admin-sidebar__link', isExactOrChild && 'is-active')}
      onClick={onNavigate}
    >
      <Icon size={19} strokeWidth={1.8} />
      <span>{item.label}</span>
    </NavLink>
  )

  return (
    <div className="admin-sidebar__item">
      <div className="admin-sidebar__item-row">
        {collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link}
        {item.children && !collapsed && (
          <button
            type="button"
            className="admin-sidebar__submenu-toggle"
            onClick={onToggle}
            aria-label={`${item.label} 하위 메뉴 ${isOpen ? '닫기' : '열기'}`}
            aria-expanded={isOpen}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
      {item.children && isOpen && !collapsed && (
        <div className="admin-sidebar__submenu">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              end
              className={({ isActive }) => cn(isActive && 'is-active')}
              onClick={onNavigate}
            >
              <span />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

import { Bell, LogOut, Menu, Moon, Settings, Sun, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { useThemeStore } from '../../stores/themeStore'
import { useUiStore } from '../../stores/uiStore'
import { authService } from '../../services/authService'
import { useAdminSessionStore } from '../../stores/adminSessionStore'
import type { BreadcrumbItem } from '../ui'
import { Breadcrumb, Dropdown, Tooltip } from '../ui'

interface AdminHeaderProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
  onOpenMobileMenu: () => void
}

export function AdminHeader({ title, breadcrumbs, onOpenMobileMenu }: AdminHeaderProps) {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const addToast = useUiStore((state) => state.addToast)
  const clearAdminSession = useAdminSessionStore((state) => state.clearAdminSession)
  const adminName = useAdminSessionStore((state) => state.name)

  return (
    <header className="admin-header">
      <div className="admin-header__leading">
        <button
          className="admin-header__mobile-menu"
          type="button"
          aria-label="관리자 메뉴 열기"
          onClick={onOpenMobileMenu}
        >
          <Menu size={21} />
        </button>
        <div className="admin-header__title">
          <h1>{title}</h1>
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="admin-header__actions">
        <Tooltip label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}>
          <button
            className="admin-header__icon-button"
            type="button"
            aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </Tooltip>
        <Tooltip label="알림">
          <button
            className="admin-header__icon-button admin-header__notification"
            type="button"
            aria-label="읽지 않은 알림 3개"
            onClick={() =>
              addToast({
                tone: 'info',
                title: '알림 기능을 준비 중입니다.',
              })
            }
          >
            <Bell size={19} />
            <span>3</span>
          </button>
        </Tooltip>
        <div className="admin-header__divider" />
        <div className="admin-header__profile">
          <span className="admin-header__avatar">{adminName.slice(0, 1) || '관'}</span>
          <div className="admin-header__profile-copy">
            <strong>{adminName || '관리자'}</strong>
            <small>최고관리자</small>
          </div>
          <Dropdown
            label="프로필 메뉴"
            align="right"
            items={[
              { id: 'profile', label: '관리자 프로필', icon: <UserRound size={16} /> },
              { id: 'settings', label: '계정 설정', icon: <Settings size={16} /> },
              { id: 'logout', label: '로그아웃', icon: <LogOut size={16} />, danger: true },
            ]}
            onSelect={(id) => {
              if (id === 'settings') navigate(ROUTES.admin.settings)
              if (id === 'profile') {
                addToast({ tone: 'info', title: '프로필 기능을 준비 중입니다.' })
              }
              if (id === 'logout') {
                void authService.logout().finally(() => {
                  clearAdminSession()
                  addToast({ tone: 'success', title: '로그아웃되었습니다.' })
                  navigate(ROUTES.admin.login)
                })
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

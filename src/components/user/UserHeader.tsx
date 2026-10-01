import { useEffect, useId, useRef, useState } from 'react'
import { Boxes, Menu, Moon, Sun, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { useThemeStore } from '../../stores/themeStore'
import { UserAccountActions } from './UserAccountActions'
import { UserNav } from './UserNav'

export function UserHeader() {
  const { pathname } = useLocation()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const menuOpen = openPath === pathname
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const menuId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setOpenPath(null)
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="user-header">
      <div className="user-header__bar">
        <NavLink className="user-header__brand" to={ROUTES.user.home} onClick={closeMenu}>
          <span className="user-header__logo" aria-hidden="true"><Boxes size={20} /></span>
          <span>Resource Hub</span>
        </NavLink>
        <div className="user-header__nav">
          <UserNav onNavigate={closeMenu} />
        </div>
        <div className="user-header__tools">
          <button
            className="user-header__icon"
            type="button"
            aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div className="user-header__account">
            <UserAccountActions />
          </div>
          <button
            className="user-header__menu"
            type="button"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setOpenPath(menuOpen ? null : pathname)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="user-drawer">
          <button className="user-drawer__backdrop" type="button" aria-label="메뉴 닫기" onClick={closeMenu} />
          <div id={menuId} className="user-drawer__panel" role="dialog" aria-modal="true" aria-label="사용자 메뉴">
            <div className="user-drawer__head">
              <strong>메뉴</strong>
              <button ref={closeButtonRef} className="user-header__icon" type="button" aria-label="메뉴 닫기" onClick={closeMenu}>
                <X size={18} />
              </button>
            </div>
            <UserNav onNavigate={closeMenu} />
            <UserAccountActions onNavigate={closeMenu} />
          </div>
        </div>
      )}
    </header>
  )
}

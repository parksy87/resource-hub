import { NavLink } from 'react-router-dom'
import { userNavigation } from '../../config/userNavigation'
import { cn } from '../../utils/cn'

interface UserNavProps {
  onNavigate?: () => void
  id?: string
}

export function UserNav({ onNavigate, id }: UserNavProps) {
  return (
    <nav id={id} className="user-nav" aria-label="주요 메뉴">
      {userNavigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn('user-nav__link', isActive && 'is-active')}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

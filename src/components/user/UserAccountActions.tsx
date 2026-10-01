import { Bell, LogOut } from 'lucide-react'

import { Link, NavLink, useNavigate } from 'react-router-dom'

import { Button } from '../ui'

import { useUnreadNotificationCount } from '../../hooks/useUnreadNotificationCount'

import { ROUTES } from '../../routes/paths'

import { useUiStore } from '../../stores/uiStore'

import { useUserSessionStore } from '../../stores/userSessionStore'



interface UserAccountActionsProps {

  onNavigate?: () => void

}



export function UserAccountActions({ onNavigate }: UserAccountActionsProps) {

  const navigate = useNavigate()

  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)

  const name = useUserSessionStore((state) => state.name)

  const logout = useUserSessionStore((state) => state.logout)

  const addToast = useUiStore((state) => state.addToast)

  const unreadCount = useUnreadNotificationCount()



  if (!isLoggedIn) {

    return (

      <div className="user-account">

        <Link

          className="ui-button ui-button--outline ui-button--sm"

          to={ROUTES.user.login}

          onClick={onNavigate}

        >

          로그인

        </Link>

        <Button

          size="sm"

          onClick={() => {

            addToast({ tone: 'info', title: '시연용 화면입니다. 회원가입 기능은 제공하지 않습니다.' })

            onNavigate?.()

          }}

        >

          회원가입

        </Button>

      </div>

    )

  }



  return (

    <div className="user-account">

      <NavLink

        className="user-account__bell"

        to={ROUTES.user.notifications}

        aria-label={unreadCount > 0 ? `알림, 읽지 않은 알림 ${unreadCount}개` : '알림'}

        onClick={onNavigate}

      >

        <Bell size={18} />

        {unreadCount > 0 && <span className="user-account__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}

      </NavLink>

      <span className="user-account__name">{name}</span>

      <NavLink className="user-account__link" to={ROUTES.user.mypage} onClick={onNavigate}>

        마이페이지

      </NavLink>

      <Button

        size="sm"

        variant="outline"

        leadingIcon={<LogOut size={15} />}

        onClick={() => {

          logout()

          addToast({ tone: 'success', title: '로그아웃되었습니다.' })

          onNavigate?.()

          navigate(ROUTES.user.login, { replace: true })

        }}

      >

        로그아웃

      </Button>

    </div>

  )

}



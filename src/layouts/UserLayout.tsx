import { Suspense, type MouseEvent } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { UserFooter } from '../components/user/UserFooter'
import { UserHeader } from '../components/user/UserHeader'
import { Loading } from '../components/ui'
import { ROUTES } from '../routes/paths'
import { useUserSessionStore } from '../stores/userSessionStore'

const AUTH_REQUIRED_PREFIXES = ['/reservations', '/rentals', '/notifications', '/mypage']

function isAuthRequiredPath(pathname: string) {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export default function UserLayout() {
  const navigate = useNavigate()
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (isLoggedIn || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as HTMLElement).closest('a')
    if (!anchor || anchor.target === '_blank') return
    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('#')) return

    const url = new URL(href, window.location.origin)
    if (url.origin !== window.location.origin || !isAuthRequiredPath(url.pathname)) return

    event.preventDefault()
    const destination = `${url.pathname}${url.search}`
    const confirmed = window.confirm('로그인 후 이용할 수 있습니다.\n로그인 화면으로 이동할까요?')
    if (confirmed) navigate(ROUTES.user.login, { state: { from: destination } })
  }

  return (
    <div className="user-shell" onClickCapture={onClickCapture}>
      <UserHeader />
      <main className="user-main">
        <Suspense fallback={<Loading size="lg" label="화면을 불러오는 중입니다" />}>
          <Outlet />
        </Suspense>
      </main>
      <UserFooter />
    </div>
  )
}

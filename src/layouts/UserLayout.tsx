import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { UserFooter } from '../components/user/UserFooter'
import { UserHeader } from '../components/user/UserHeader'
import { Loading } from '../components/ui'

export default function UserLayout() {
  return (
    <div className="user-shell">
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

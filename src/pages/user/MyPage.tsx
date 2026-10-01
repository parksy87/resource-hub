import { MyPageGate } from '../../components/user/MyPageGate'
import { MyPageView } from '../../components/user/MyPageView'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function MyPage() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) {
    return (
      <MyPageGate
        title="마이페이지"
        description="마이페이지는 로그인 후 이용할 수 있습니다."
      />
    )
  }
  return <MyPageView />
}

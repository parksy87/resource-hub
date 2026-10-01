import { MyPageEditForm } from '../../components/user/MyPageEditForm'
import { MyPageGate } from '../../components/user/MyPageGate'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function MyPageEdit() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) {
    return (
      <MyPageGate
        title="회원 정보 수정"
        description="회원 정보 수정은 로그인 후 이용할 수 있습니다."
      />
    )
  }
  return <MyPageEditForm />
}

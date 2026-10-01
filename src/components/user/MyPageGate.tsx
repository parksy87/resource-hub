import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { userLoginPath } from '../../utils/authNavigation'
export function MyPageGate({ title, description }: { title: string; description: string }) {
  const location = useLocation()
  return (
    <section className="user-mypage-gate">
      <p>ACCOUNT</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div>
        <Link className="ui-button ui-button--primary ui-button--md" to={userLoginPath(location.pathname)}>로그인</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.resources}>자원 목록으로</Link>
      </div>
    </section>
  )
}

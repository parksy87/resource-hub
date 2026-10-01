import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { userLoginPath } from '../../utils/authNavigation'

export function RentalGate() {
  const location = useLocation()
  return (
    <section className="user-rental-gate">
      <p>RENTAL</p>
      <h2>대여·반납</h2>
      <p>대여·반납은 로그인 후 이용할 수 있습니다.</p>
      <div>
        <Link className="ui-button ui-button--primary ui-button--md" to={userLoginPath(location.pathname)}>로그인</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.resources}>자원 목록으로</Link>
      </div>
    </section>
  )
}

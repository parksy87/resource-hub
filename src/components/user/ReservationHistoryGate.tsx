import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { userLoginPath } from '../../utils/authNavigation'

export function ReservationHistoryGate() {
  const location = useLocation()
  return (
    <section className="user-history-gate">
      <p>RESERVATION</p>
      <h2>예약 내역</h2>
      <p>예약 내역은 로그인 후 이용할 수 있습니다.</p>
      <div>
        <Link className="ui-button ui-button--primary ui-button--md" to={userLoginPath(location.pathname)}>로그인</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.resources}>자원 목록으로</Link>
      </div>
    </section>
  )
}

import { ArrowLeft, Pencil, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { ReservationStatusBadge } from '../../../components/reservations/ReservationStatusBadge'
import { RentalStatusBadge } from '../../../components/rentals/RentalStatusBadge'
import { UserStatusModal } from '../../../components/users/UserStatusModal'
import { UserRoleBadge, UserStatusBadge } from '../../../components/users/UserStatusBadge'
import { Button, Card } from '../../../components/ui'
import { userStatusMeta } from '../../../config/user'
import { useUserDetail } from '../../../hooks/useUsers'
import { ROUTES } from '../../../routes/paths'
import { formatDate, formatDateTime } from '../../../utils/date'
import { canManageUser } from '../../../utils/user'

function displayDate(value: string | null) {
  return value ? formatDate(value) : '-'
}

function displayDateTime(value: string | null) {
  return value ? formatDateTime(value) : '-'
}

export default function UserDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const userId = Number(id)
  const { data, status, error, refetch } = useUserDetail(userId)
  const [statusOpen, setStatusOpen] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="user-page-state"><AdminPageState type="loading" title="사용자 정보를 불러오는 중입니다" /></div>
  }
  if (status === 'error') {
    return <div className="user-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (!data) {
    return <div className="user-page-state"><AdminPageState type="empty" title="사용자를 찾을 수 없습니다" actionLabel="사용자 목록" onAction={() => navigate(ROUTES.admin.users)} /></div>
  }

  const manageable = canManageUser(data.status)
  const latestStatus = data.statusHistories[0]

  return (
    <div className="user-detail-page">
      <div className="user-detail-hero">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.admin.users)}><ArrowLeft size={14} /> 사용자 목록</button>
          <div className="user-detail-hero__title">
            <div>
              <div>
                <strong>{data.name}</strong>
                <UserRoleBadge role={data.role} />
                <UserStatusBadge status={data.status} />
              </div>
              <p>{data.email} · {data.organization}</p>
            </div>
          </div>
        </div>
        {manageable && (
          <div className="user-detail-actions">
            <Button variant="outline" leadingIcon={<Pencil size={16} />} onClick={() => navigate(ROUTES.admin.userEdit(data.id))}>수정</Button>
            <Button leadingIcon={<ShieldAlert size={16} />} onClick={() => setStatusOpen(true)}>상태 변경</Button>
          </div>
        )}
      </div>

      <div className={`user-status-banner is-${data.status.toLowerCase()}`}>
        <div>
          <UserStatusBadge status={data.status} />
          <strong>{userStatusMeta[data.status].label}</strong>
          <p>{userStatusMeta[data.status].description}</p>
          {data.status === 'SUSPENDED' && latestStatus?.reason && <p>정지 사유: {latestStatus.reason}</p>}
        </div>
      </div>

      <div className="user-usage-grid">
        <Card padding="sm"><strong>{data.reservationCount}</strong><span>예약 건수</span></Card>
        <Card padding="sm"><strong>{data.rentalCount}</strong><span>대여 건수</span></Card>
        <Card padding="sm"><strong>{data.returnCount}</strong><span>반납 건수</span></Card>
        <Card padding="sm"><strong>{data.activeRentals.length}</strong><span>현재 대여 중</span></Card>
      </div>

      <div className="user-detail-layout">
        <div className="user-detail-main">
          <Card title="기본 정보">
            <dl className="user-detail-list">
              <div><dt>이름</dt><dd>{data.name}</dd></div>
              <div><dt>이메일</dt><dd>{data.email}</dd></div>
              <div><dt>전화번호</dt><dd>{data.phone ?? '-'}</dd></div>
              <div><dt>소속</dt><dd>{data.organization || '-'}</dd></div>
              <div><dt>사용자 유형</dt><dd><UserRoleBadge role={data.role} /></dd></div>
              <div><dt>상태</dt><dd><UserStatusBadge status={data.status} /></dd></div>
              <div><dt>가입일</dt><dd>{displayDate(data.joinedAt)}</dd></div>
              <div><dt>최근 로그인일</dt><dd>{displayDateTime(data.lastLoginAt)}</dd></div>
              <div><dt>최근 이용일</dt><dd>{displayDate(data.lastUsedAt)}</dd></div>
            </dl>
          </Card>

          <Card title="현재 대여 중인 자원" description="대여 중, 반납 신청, 연체 자원을 표시합니다.">
            {data.activeRentals.length === 0 ? <p className="user-empty-copy">현재 대여 중인 자원이 없습니다.</p> : (
              <ul className="user-active-list">
                {data.activeRentals.map((item) => (
                  <li key={item.id}>
                    <Link to={ROUTES.admin.rentalDetail(item.id)}>{item.resourceName}</Link>
                    <span>{item.rentalNumber}</span>
                    <RentalStatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="예약 이력" description="최근 예약 내역입니다.">
            {data.reservations.length === 0 ? <p className="user-empty-copy">예약 이력이 없습니다.</p> : (
              <div className="user-table-scroll">
                <table className="user-mini-table">
                  <caption>최근 예약 내역</caption>
                  <thead>
                    <tr><th>예약번호</th><th>자원명</th><th>예약기간</th><th>상태</th></tr>
                  </thead>
                  <tbody>
                    {data.reservations.map((item) => (
                      <tr key={item.id}>
                        <td><Link to={ROUTES.admin.reservationDetail(item.id)}>{item.reservationNumber}</Link></td>
                        <td>{item.resourceName}</td>
                        <td>{formatDateTime(item.startAt)} – {formatDateTime(item.endAt)}</td>
                        <td><ReservationStatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="대여/반납 이력" description="최근 대여와 반납 내역입니다.">
            {data.rentals.length === 0 ? <p className="user-empty-copy">대여 이력이 없습니다.</p> : (
              <div className="user-table-scroll">
                <table className="user-mini-table">
                  <caption>최근 대여 및 반납 내역</caption>
                  <thead>
                    <tr><th>대여번호</th><th>자원명</th><th>대여일</th><th>반납 예정일</th><th>실제 반납일</th><th>상태</th></tr>
                  </thead>
                  <tbody>
                    {data.rentals.map((item) => (
                      <tr key={item.id}>
                        <td><Link to={ROUTES.admin.rentalDetail(item.id)}>{item.rentalNumber}</Link></td>
                        <td>{item.resourceName}</td>
                        <td>{displayDateTime(item.rentedAt)}</td>
                        <td>{displayDateTime(item.dueAt)}</td>
                        <td>{displayDateTime(item.returnedAt)}</td>
                        <td><RentalStatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="user-detail-side">
          <Card title="활동 이력" description="가입, 정보 수정, 상태 변경과 이용 이력입니다.">
            <ol className="user-timeline">
              {data.activities.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                  <small>{formatDateTime(item.occurredAt)}</small>
                </li>
              ))}
            </ol>
          </Card>
          <Card title="상태 변경 이력">
            {data.statusHistories.length === 0 ? <p className="user-empty-copy">상태 변경 이력이 없습니다.</p> : (
              <ol className="user-timeline">
                {data.statusHistories.map((item) => (
                  <li key={item.id}>
                    <strong>{userStatusMeta[item.fromStatus].label} → {userStatusMeta[item.toStatus].label}</strong>
                    {item.reason && <p>{item.reason}</p>}
                    <small>{formatDateTime(item.changedAt)} · {item.processorName}</small>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {statusOpen && <UserStatusModal user={data} onClose={() => setStatusOpen(false)} onSuccess={refetch} />}
    </div>
  )
}

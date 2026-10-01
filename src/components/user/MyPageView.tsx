import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { rentalStatusMeta } from '../../config/rental'
import { reservationStatusMeta } from '../../config/reservation'
import { userRoleMeta, userStatusMeta } from '../../config/user'
import { notificationTypeMeta } from '../../config/userNotification'
import { ROUTES } from '../../routes/paths'
import { myPageService } from '../../services/myPageService'
import { notificationService } from '../../services/notificationService'
import type {
  MyPageNotification,
  MyPageRental,
  MyPageReservation,
  MyProfile,
  MyUsageSummary,
} from '../../types'
import { notificationSummary, notificationTargetPath } from '../../utils/notification'
import { formatReservationWhen } from '../../utils/reservationForm'
import { formatReservationDate, formatUsageDate, formatUsageTime } from '../../utils/reservationDisplay'
import { Badge, Button, Card, EmptyState, ErrorState, Loading, Modal, StateDisplay } from '../ui'

interface MyPageData {
  profile: MyProfile
  summary: MyUsageSummary
  reservations: MyPageReservation[]
  rentals: MyPageRental[]
  notifications: MyPageNotification[]
}

const summaryItems = [
  { key: 'reservationRequests', label: '예약 신청', to: ROUTES.user.reservationHistory },
  { key: 'approvedReservations', label: '승인된 예약', to: `${ROUTES.user.reservationHistory}?status=approved` },
  { key: 'activeRentals', label: '현재 대여 중', to: `${ROUTES.user.rentals}?status=rented` },
  { key: 'dueSoon', label: '반납 예정', to: `${ROUTES.user.rentals}?status=rented` },
  { key: 'overdueRentals', label: '연체 건수', to: `${ROUTES.user.rentals}?status=overdue` },
  { key: 'unreadNotifications', label: '알림 미확인', to: `${ROUTES.user.notifications}?status=unread` },
] as const

function isProfileSaved(state: unknown) {
  if (!state || typeof state !== 'object' || !('profileSaved' in state)) return false
  return state.profileSaved === true
}

function rentalDay(value: string | null) {
  return value ? formatReservationDate(value) : '-'
}

export function MyPageView() {
  const navigate = useNavigate()
  const location = useLocation()
  const profileSaved = isProfileSaved(location.state)
  const [data, setData] = useState<MyPageData | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [noticeError, setNoticeError] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawnNow, setWithdrawnNow] = useState(false)
  const requestKey = String(requestId)

  useEffect(() => {
    let active = true
    void Promise.all([
      myPageService.getMyProfile(),
      myPageService.getMyUsageSummary(),
      myPageService.getMyRecentReservations(),
      myPageService.getMyRecentRentals(),
      myPageService.getMyRecentNotifications(),
    ]).then(([profile, summary, reservations, rentals, notifications]) => {
      if (!active) return
      setData({ profile, summary, reservations, rentals, notifications })
      setStatus('success')
      setSettledKey(requestKey)
    }).catch(() => {
      if (!active) return
      setStatus('error')
      setSettledKey(requestKey)
    })
    return () => {
      active = false
    }
  }, [requestKey])

  const visibleStatus = settledKey === requestKey ? status : 'loading'
  const withdrawn = withdrawnNow || Boolean(data?.profile.withdrawalRequested)

  async function openNotification(item: MyPageNotification) {
    if (openingId) return
    setOpeningId(item.id)
    setNoticeError('')
    try {
      if (!item.isRead) await notificationService.markAsRead(item.id)
      navigate(notificationTargetPath(item.relatedTarget) ?? ROUTES.user.notificationDetail(item.id))
    } catch {
      setNoticeError('알림을 열지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setOpeningId(null)
    }
  }

  async function confirmWithdraw() {
    setWithdrawing(true)
    setWithdrawError('')
    try {
      await myPageService.withdrawMyAccount()
      setWithdrawOpen(false)
      setWithdrawnNow(true)
    } catch {
      setWithdrawError('회원 탈퇴 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <section className="user-mypage">
      <header className="user-mypage-heading">
        <p>ACCOUNT</p>
        <h2>마이페이지</h2>
        <p>회원 정보와 최근 자원 이용 현황을 확인합니다.</p>
      </header>

      {profileSaved && <p className="user-mypage-complete" role="status">회원정보를 저장했습니다.</p>}
      {visibleStatus === 'loading' && <Loading label="마이페이지를 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="마이페이지를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && data && (
        <>
          <Card
            title="회원 정보"
            action={(
              <Link className="ui-button ui-button--primary ui-button--sm" to={ROUTES.user.mypageEdit}>
                회원정보 수정
              </Link>
            )}
          >
            <dl className="user-mypage-fields">
              <div><dt>이름</dt><dd>{data.profile.name}</dd></div>
              <div><dt>이메일</dt><dd>{data.profile.email}</dd></div>
              <div><dt>전화번호</dt><dd>{data.profile.phone || '-'}</dd></div>
              <div><dt>소속</dt><dd>{data.profile.organization}</dd></div>
              <div><dt>가입일</dt><dd><time dateTime={data.profile.joinedAt}>{formatReservationDate(data.profile.joinedAt)}</time></dd></div>
              <div>
                <dt>회원 상태</dt>
                <dd><Badge tone={userStatusMeta[data.profile.status].tone}>{userStatusMeta[data.profile.status].label}</Badge></dd>
              </div>
              <div><dt>회원 권한</dt><dd>{userRoleMeta[data.profile.role].label}</dd></div>
            </dl>
          </Card>

          <Card title="이용 현황" description="항목을 누르면 관련 내역으로 이동합니다.">
            <div className="user-mypage-summary">
              {summaryItems.map((item) => (
                <Link key={item.key} to={item.to}>
                  <span>{item.label}</span>
                  <strong className={item.key === 'overdueRentals' && data.summary.overdueRentals > 0 ? 'is-alert' : undefined}>
                    {data.summary[item.key]}
                  </strong>
                </Link>
              ))}
            </div>
          </Card>

          <Card
            title="최근 예약"
            description="최근 예약 5건입니다."
            action={<Link to={ROUTES.user.reservationHistory}>전체보기</Link>}
          >
            {data.reservations.length === 0 ? (
              <EmptyState compact title="최근 예약이 없습니다." description="자원을 예약하면 이곳에 표시됩니다." />
            ) : (
              <ul className="user-mypage-list">
                {data.reservations.map((item) => {
                  const meta = reservationStatusMeta[item.status]
                  return (
                    <li key={item.id}>
                      <Link to={ROUTES.user.reservationHistoryDetail(item.id)}>
                        <span className="user-mypage-list__meta">
                          <span>{item.reservationNumber}</span>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </span>
                        <strong>{item.resourceName}</strong>
                        <dl>
                          <div><dt>이용일</dt><dd>{formatUsageDate(item.startAt, item.endAt)}</dd></div>
                          <div><dt>이용시간</dt><dd>{formatUsageTime(item.startAt, item.endAt)}</dd></div>
                          <div><dt>신청일</dt><dd><time dateTime={item.createdAt}>{formatReservationWhen(item.createdAt)}</time></dd></div>
                        </dl>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card
            title="최근 대여·반납"
            description="최근 대여·반납 5건입니다."
            action={<Link to={ROUTES.user.rentals}>전체보기</Link>}
          >
            {data.rentals.length === 0 ? (
              <EmptyState compact title="최근 대여·반납 내역이 없습니다." description="대여가 시작되면 이곳에 표시됩니다." />
            ) : (
              <ul className="user-mypage-list">
                {data.rentals.map((item) => {
                  const meta = rentalStatusMeta[item.displayStatus]
                  return (
                    <li key={item.id}>
                      <Link to={ROUTES.user.rentalDetail(item.id)}>
                        <span className="user-mypage-list__meta">
                          <span>{item.rentalNumber}</span>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </span>
                        <strong>{item.resourceName}</strong>
                        <dl>
                          <div><dt>대여일</dt><dd>{item.rentedAt ? <time dateTime={item.rentedAt}>{rentalDay(item.rentedAt)}</time> : '-'}</dd></div>
                          <div><dt>반납 예정일</dt><dd><time dateTime={item.dueAt}>{rentalDay(item.dueAt)}</time></dd></div>
                          <div><dt>실제 반납일</dt><dd>{item.returnedAt ? <time dateTime={item.returnedAt}>{rentalDay(item.returnedAt)}</time> : '-'}</dd></div>
                        </dl>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card
            title="최근 알림"
            description="최근 알림 5건입니다."
            action={<Link to={ROUTES.user.notifications}>전체보기</Link>}
          >
            {noticeError && <p className="user-mypage-alert" role="alert">{noticeError}</p>}
            {data.notifications.length === 0 ? (
              <EmptyState compact title="최근 알림이 없습니다." description="새 알림이 도착하면 이곳에 표시됩니다." />
            ) : (
              <ul className="user-mypage-list">
                {data.notifications.map((item) => {
                  const meta = notificationTypeMeta[item.type]
                  return (
                    <li key={item.id} className={item.isRead ? undefined : 'is-unread'}>
                      <button type="button" disabled={openingId === item.id} onClick={() => void openNotification(item)}>
                        <span className="user-mypage-list__meta">
                          {!item.isRead && <span className="user-mypage-dot" aria-hidden="true" />}
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          <Badge tone={item.isRead ? 'neutral' : 'blue'}>{item.isRead ? '읽음' : '읽지 않음'}</Badge>
                        </span>
                        <strong>{item.title}</strong>
                        <p>{notificationSummary(item.content)}</p>
                        <time dateTime={item.createdAt}>{formatReservationWhen(item.createdAt)}</time>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card title="회원 탈퇴" description="탈퇴를 요청하면 예약과 대여 이용이 제한될 수 있습니다.">
            {withdrawn ? (
              <StateDisplay
                variant="success"
                compact
                title="회원 탈퇴 요청이 접수되었습니다."
                description="실제 계정 삭제와 이용 제한은 이후 단계에서 연결됩니다. 현재 화면의 이용 내역은 그대로 유지됩니다."
              />
            ) : (
              <div className="user-mypage-withdraw">
                <p>탈퇴 후에는 자원 예약, 대여·반납, 알림을 이용하기 어렵습니다. 진행 중인 대여가 있다면 반납을 먼저 확인해 주세요.</p>
                <Button type="button" variant="danger" onClick={() => { setWithdrawError(''); setWithdrawOpen(true) }}>
                  회원 탈퇴
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      <Modal
        isOpen={withdrawOpen}
        onClose={() => {
          if (!withdrawing) setWithdrawOpen(false)
        }}
        title="회원 탈퇴를 진행할까요?"
        description="탈퇴를 확인하면 서비스 이용이 제한될 수 있습니다."
        size="sm"
        footer={(
          <>
            <Button type="button" variant="outline" disabled={withdrawing} onClick={() => setWithdrawOpen(false)}>취소</Button>
            <Button type="button" variant="danger" isLoading={withdrawing} onClick={() => void confirmWithdraw()}>
              {withdrawing ? '요청 중' : '탈퇴 요청'}
            </Button>
          </>
        )}
      >
        <div className="user-mypage-withdraw-modal">
          <ul>
            <li>예약 신청과 승인된 예약 이용이 제한됩니다.</li>
            <li>대여 중인 자원은 반납 전까지 계정 이용이 제한될 수 있습니다.</li>
            <li>알림과 이용 내역 확인도 함께 제한됩니다.</li>
          </ul>
          <p>현재 단계에서는 계정을 실제로 삭제하지 않고, 탈퇴 요청 완료 상태만 표시합니다.</p>
          {withdrawError && <p className="user-mypage-alert" role="alert">{withdrawError}</p>}
        </div>
      </Modal>
    </section>
  )
}

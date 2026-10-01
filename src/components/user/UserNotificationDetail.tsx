import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { notificationTargetLabel, notificationTypeMeta } from '../../config/userNotification'
import { ROUTES } from '../../routes/paths'
import { notificationService } from '../../services/notificationService'
import type { Notification } from '../../types/notification'
import { notificationTargetPath } from '../../utils/notification'
import { formatReservationWhen } from '../../utils/reservationForm'
import { Badge, ErrorState, Loading } from '../ui'

export function UserNotificationDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<Notification | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const item = await notificationService.getMyNotification(id)
        if (!active) return
        if (!item) {
          setDetail(null)
          setStatus('success')
          return
        }
        const next = item.isRead ? item : await notificationService.markAsRead(item.id)
        if (!active) return
        setDetail(next)
        setStatus('success')
      } catch {
        if (!active) return
        setStatus('error')
      }
    })()
    return () => {
      active = false
    }
  }, [id, requestId])

  if (status === 'loading') return <Loading label="알림을 불러오는 중입니다" />
  if (status === 'error') {
    return (
      <ErrorState
        title="알림을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
        actionLabel="다시 시도"
        onAction={() => {
          setStatus('loading')
          setRequestId((current) => current + 1)
        }}
      />
    )
  }
  if (!detail) {
    return (
      <ErrorState
        title="알림을 찾을 수 없습니다."
        description="삭제되었거나 존재하지 않는 알림입니다."
        actionLabel="알림 목록으로"
        onAction={() => navigate(ROUTES.user.notifications)}
      />
    )
  }

  const meta = notificationTypeMeta[detail.type]
  const targetPath = notificationTargetPath(detail.relatedTarget)

  return (
    <section className="user-notice-detail">
      <div className="user-notice-heading">
        <div>
          <p>NOTICE</p>
          <h2>알림 상세</h2>
        </div>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.notifications}>알림 목록으로</Link>
      </div>
      <section>
        <div className="user-notice-list__meta">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <Badge tone={detail.isRead ? 'neutral' : 'blue'}>{detail.isRead ? '읽음' : '읽지 않음'}</Badge>
        </div>
        <h3>{detail.title}</h3>
        <p>{detail.content}</p>
        <dl>
          <div>
            <dt>알림 유형</dt>
            <dd>{meta.label}</dd>
          </div>
          <div>
            <dt>등록일시</dt>
            <dd><time dateTime={detail.createdAt}>{formatReservationWhen(detail.createdAt)}</time></dd>
          </div>
          <div>
            <dt>읽음 상태</dt>
            <dd>{detail.isRead ? '읽음' : '읽지 않음'}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h3>관련 대상</h3>
        {detail.relatedTarget ? (
          <>
            <dl>
              <div>
                <dt>대상 유형</dt>
                <dd>{notificationTargetLabel[detail.relatedTarget.type]}</dd>
              </div>
              <div>
                <dt>대상</dt>
                <dd>{detail.relatedTarget.name}</dd>
              </div>
            </dl>
            {targetPath && (
              <Link className="ui-button ui-button--md" to={targetPath}>
                {detail.relatedTarget.type === 'reservation' && '예약 상세'}
                {detail.relatedTarget.type === 'rental' && '대여 상세'}
                {detail.relatedTarget.type === 'resource' && '자원 상세'}
              </Link>
            )}
          </>
        ) : (
          <p>관련 페이지가 없는 시스템 알림입니다.</p>
        )}
      </section>
    </section>
  )
}

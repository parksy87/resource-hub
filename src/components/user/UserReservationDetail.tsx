import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { reservationStatusMeta } from '../../config/reservation'
import { reservationProcessLabel } from '../../config/userReservation'
import { ROUTES } from '../../routes/paths'
import { reservationService } from '../../services/reservationService'
import type { ReservationDetail } from '../../types'
import { formatReservationWhen } from '../../utils/reservationForm'
import { canCancelReservation, formatReservationClock, formatReservationDate } from '../../utils/reservationDisplay'
import { Badge, Button, EmptyState, ErrorState, Loading } from '../ui'
import { ReservationCancelDialog } from './ReservationCancelDialog'
import { ResourceVisual } from './resources/ResourceCard'

function DetailFields({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function UserReservationDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const reservationId = params.id?.trim() ?? ''
  const isValidId = reservationId.length > 0
  const [detail, setDetail] = useState<ReservationDetail | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledId, setSettledId] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  useEffect(() => {
    if (!isValidId) return
    let active = true
    void reservationService.getMyReservation(reservationId).then((data) => {
      if (!active) return
      setDetail(data)
      setSettledId(reservationId)
      setStatus('success')
    }).catch(() => {
      if (!active) return
      setSettledId(reservationId)
      setStatus('error')
    })
    return () => {
      active = false
    }
  }, [isValidId, reservationId, requestId])

  if (!isValidId) {
    return (
      <section className="user-history-detail">
        <EmptyState
          title="예약 정보를 찾을 수 없습니다."
          actionLabel="예약 내역으로"
          onAction={() => navigate(ROUTES.user.reservationHistory)}
        />
      </section>
    )
  }

  const visibleStatus = settledId === reservationId ? status : 'loading'
  const meta = detail ? reservationStatusMeta[detail.status] : null

  return (
    <section className="user-history-detail">
      <header className="user-history-heading">
        <p>RESERVATION</p>
        <h2>예약 상세</h2>
        <Link to={ROUTES.user.reservationHistory}>예약 내역으로</Link>
      </header>

      {visibleStatus === 'loading' && <Loading label="예약 정보를 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="예약 정보를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && !detail && (
        <EmptyState
          title="예약 정보를 찾을 수 없습니다."
          description="다른 사용자의 예약이거나 삭제된 예약입니다."
          actionLabel="예약 내역으로"
          onAction={() => navigate(ROUTES.user.reservationHistory)}
        />
      )}
      {visibleStatus === 'success' && detail && meta && (
        <>
          <div className="user-history-detail-grid">
            <section>
              <h3>예약 정보</h3>
              <div className="user-history-status">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <span>{meta.description}</span>
              </div>
              <DetailFields
                items={[
                  { label: '예약번호', value: detail.reservationNumber },
                  { label: '예약 상태', value: meta.label },
                  { label: '신청일', value: formatReservationWhen(detail.createdAt) },
                  ...(detail.cancellationReason ? [{ label: '취소 사유', value: detail.cancellationReason }] : []),
                ]}
              />
            </section>
            <section>
              <h3>자원 정보</h3>
              <div className="user-history-resource">
                <span className="user-history-resource__media">
                  <ResourceVisual imageUrl={detail.resourceImageUrl} alt={detail.resourceName} />
                </span>
                <div>
                  <Link to={ROUTES.user.resourceDetail(detail.resourceId)}>{detail.resourceName}</Link>
                  <DetailFields
                    items={[
                      { label: '자원 코드', value: detail.resourceCode },
                      { label: '카테고리', value: detail.resourceCategoryName },
                      { label: '위치', value: detail.resourceLocation },
                    ]}
                  />
                </div>
              </div>
            </section>
            <section>
              <h3>이용 일정</h3>
              <DetailFields
                items={[
                  { label: '시작일', value: formatReservationDate(detail.startAt) },
                  { label: '시작시간', value: formatReservationClock(detail.startAt) },
                  { label: '종료일', value: formatReservationDate(detail.endAt) },
                  { label: '종료시간', value: formatReservationClock(detail.endAt) },
                ]}
              />
            </section>
            <section>
              <h3>이용 정보</h3>
              <DetailFields
                items={[
                  { label: '이용 목적', value: detail.purpose },
                  { label: '이용 장소', value: detail.usageLocation ?? '-' },
                  { label: '참석 인원', value: `${detail.quantity}명` },
                  { label: '비고', value: detail.requestNote ?? '-' },
                ]}
              />
            </section>
            <section>
              <h3>예약자</h3>
              <DetailFields
                items={[
                  { label: '이름', value: detail.userName },
                  { label: '이메일', value: detail.userEmail },
                  { label: '휴대전화', value: detail.userPhone },
                  { label: '소속', value: detail.organization },
                ]}
              />
            </section>
          </div>

          <section className="user-history-timeline-section">
            <h3>예약 처리 이력</h3>
            <ol className="user-history-timeline">
              {detail.histories.map((item) => (
                <li key={item.id}>
                  <strong>{reservationProcessLabel[item.action]}</strong>
                  <span>상태 {reservationStatusMeta[item.action === 'APPLIED' ? 'PENDING' : item.action].label}</span>
                  <time dateTime={item.occurredAt}>처리일시 {formatReservationWhen(item.occurredAt)}</time>
                  <span>처리자 {item.actorName}</span>
                  <span>사유 {item.reason ?? '사유 없음'}</span>
                </li>
              ))}
            </ol>
          </section>

          {canCancelReservation(detail.status) && (
            <div className="user-history-cancel">
              <Button type="button" variant="danger" onClick={() => setIsCancelOpen(true)}>예약 취소</Button>
            </div>
          )}
          {isCancelOpen && (
            <ReservationCancelDialog
              reservationId={detail.id}
              isOpen
              onClose={() => setIsCancelOpen(false)}
              onCancelled={(next) => {
                setDetail(next)
                setIsCancelOpen(false)
              }}
            />
          )}
        </>
      )}
    </section>
  )
}

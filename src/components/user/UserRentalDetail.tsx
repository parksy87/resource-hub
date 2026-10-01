import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { rentalStatusMeta, returnConditionMeta } from '../../config/rental'
import { rentalProcessLabel } from '../../config/userRental'
import { ROUTES } from '../../routes/paths'
import { rentalService } from '../../services/rentalService'
import type { RentalDetail } from '../../types'
import { canRequestReturn } from '../../utils/rental'
import { formatReservationWhen } from '../../utils/reservationForm'
import { Badge, Button, EmptyState, ErrorState, Loading } from '../ui'
import { ReturnRequestDialog } from './ReturnRequestDialog'
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

export function UserRentalDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const rentalId = Number(params.id)
  const isValidId = Number.isInteger(rentalId) && rentalId > 0
  const [detail, setDetail] = useState<RentalDetail | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledId, setSettledId] = useState<number | null>(null)
  const [requestId, setRequestId] = useState(0)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isReturnComplete, setIsReturnComplete] = useState(false)

  useEffect(() => {
    if (!isValidId) return
    let active = true
    void rentalService.getMyRental(rentalId).then((data) => {
      if (!active) return
      setDetail(data)
      setSettledId(rentalId)
      setStatus('success')
    }).catch(() => {
      if (!active) return
      setSettledId(rentalId)
      setStatus('error')
    })
    return () => {
      active = false
    }
  }, [isValidId, rentalId, requestId])

  if (!isValidId) {
    return (
      <section className="user-rental-detail">
        <EmptyState
          title="대여 정보를 찾을 수 없습니다."
          actionLabel="대여·반납으로"
          onAction={() => navigate(ROUTES.user.rentals)}
        />
      </section>
    )
  }

  const visibleStatus = settledId === rentalId ? status : 'loading'
  const meta = detail ? rentalStatusMeta[detail.displayStatus] : null
  const showReturnInfo = detail?.displayStatus === 'RETURN_REQUESTED' || detail?.displayStatus === 'RETURNED' || Boolean(detail?.returnRequestedAt || detail?.returnStatus)
  const returnCondition = detail?.returnStatus ? returnConditionMeta[detail.returnStatus] : null

  return (
    <section className="user-rental-detail">
      <header className="user-rental-heading">
        <p>RENTAL</p>
        <h2>대여 상세</h2>
        <Link to={ROUTES.user.rentals}>대여·반납으로</Link>
      </header>

      {visibleStatus === 'loading' && <Loading label="대여 정보를 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="대여 정보를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && !detail && (
        <EmptyState
          title="대여 정보를 찾을 수 없습니다."
          description="다른 사용자의 대여이거나 삭제된 대여입니다."
          actionLabel="대여·반납으로"
          onAction={() => navigate(ROUTES.user.rentals)}
        />
      )}
      {visibleStatus === 'success' && detail && meta && (
        <>
          {isReturnComplete && <p className="user-rental-complete" role="status">반납 신청이 완료되었습니다.</p>}
          <div className="user-rental-detail-grid">
            <section>
              <h3>대여 정보</h3>
              <div className="user-rental-status">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <span>{meta.description}</span>
                {detail.displayStatus === 'OVERDUE' && <strong className="user-rental-overdue">{detail.overdueDays}일 연체</strong>}
              </div>
              <DetailFields
                items={[
                  { label: '대여번호', value: detail.rentalNumber },
                  { label: '대여 상태', value: meta.label },
                  { label: '대여일', value: formatReservationWhen(detail.rentedAt ?? detail.requestedAt) },
                  { label: '반납 예정일', value: formatReservationWhen(detail.dueAt) },
                  { label: '실제 반납일', value: detail.returnedAt ? formatReservationWhen(detail.returnedAt) : '-' },
                  ...(detail.displayStatus === 'OVERDUE' ? [{ label: '연체일수', value: `${detail.overdueDays}일` }] : []),
                ]}
              />
            </section>
            <section>
              <h3>예약 정보</h3>
              <DetailFields
                items={[
                  { label: '예약번호', value: detail.reservationNumber ?? '-' },
                  { label: '예약일', value: detail.reservationCreatedAt ? formatReservationWhen(detail.reservationCreatedAt) : '-' },
                  { label: '이용 목적', value: detail.reservationPurpose },
                ]}
              />
              {detail.reservationId && (
                <Link to={ROUTES.user.reservationHistoryDetail(detail.reservationId)}>{detail.reservationNumber} 예약 상세</Link>
              )}
            </section>
            <section>
              <h3>자원 정보</h3>
              <div className="user-rental-resource">
                <span className="user-rental-resource__media">
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
              <h3>대여자 정보</h3>
              <DetailFields
                items={[
                  { label: '이름', value: detail.userName },
                  { label: '연락처', value: detail.userPhone },
                  { label: '소속', value: detail.organization },
                ]}
              />
            </section>
            {showReturnInfo && (
              <section>
                <h3>반납 정보</h3>
                <DetailFields
                  items={[
                    { label: '반납 신청일', value: detail.returnRequestedAt ? formatReservationWhen(detail.returnRequestedAt) : '-' },
                    { label: '반납 처리일', value: detail.returnProcessedAt ? formatReservationWhen(detail.returnProcessedAt) : '-' },
                    { label: '반납 상태', value: returnCondition?.label ?? '-' },
                    { label: '반납 메모', value: detail.returnNote ?? '-' },
                  ]}
                />
              </section>
            )}
          </div>

          <section className="user-rental-timeline-section">
            <h3>대여 처리 이력</h3>
            <ol className="user-rental-timeline">
              {detail.histories.map((item) => (
                <li key={item.id}>
                  <strong>{rentalProcessLabel[item.action]}</strong>
                  <span>상태 {rentalProcessLabel[item.action]}</span>
                  <time dateTime={item.occurredAt}>처리일시 {formatReservationWhen(item.occurredAt)}</time>
                  <span>처리자 {item.actorName}</span>
                  <span>메모 {item.description ?? '메모 없음'}</span>
                </li>
              ))}
            </ol>
          </section>

          {canRequestReturn(detail.displayStatus) && (
            <div className="user-rental-return">
              <Button type="button" onClick={() => setIsReturnOpen(true)}>반납 신청</Button>
            </div>
          )}
          {isReturnOpen && (
            <ReturnRequestDialog
              rentalId={detail.id}
              isOpen
              onClose={() => setIsReturnOpen(false)}
              onRequested={(next) => {
                setDetail(next)
                setIsReturnComplete(true)
                setIsReturnOpen(false)
              }}
            />
          )}
        </>
      )}
    </section>
  )
}

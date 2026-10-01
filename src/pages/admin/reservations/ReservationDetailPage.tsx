import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Box,
  Building2,
  CalendarCheck2,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  UserRound,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import {
  ReservationActionModal,
  type ReservationAction,
} from '../../../components/reservations/ReservationActionModal'
import { ReservationStatusBadge } from '../../../components/reservations/ReservationStatusBadge'
import { Badge, Button, Card } from '../../../components/ui'
import { reservationStatusMeta } from '../../../config/reservation'
import { useReservationDetail } from '../../../hooks/useReservations'
import { ROUTES } from '../../../routes/paths'
import { formatDateTime } from '../../../utils/date'

export default function ReservationDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const reservationId = id
  const { data, status, error, refetch } = useReservationDetail(reservationId)
  const [action, setAction] = useState<ReservationAction | null>(null)

  if (status === 'loading' || status === 'idle') {
    return <div className="reservation-page-state"><AdminPageState type="loading" title="예약 상세 정보를 불러오는 중입니다" /></div>
  }

  if (status === 'error') {
    return <div className="reservation-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }

  if (!data) {
    return <div className="reservation-page-state"><AdminPageState type="empty" title="예약을 찾을 수 없습니다" description="취소되었거나 존재하지 않는 예약입니다." actionLabel="예약 목록" onAction={() => navigate(ROUTES.admin.reservations)} /></div>
  }

  const statusMeta = reservationStatusMeta[data.status]
  const canReview = data.status === 'PENDING'
  const canCancel = data.status === 'PENDING' || data.status === 'APPROVED'

  return (
    <div className="reservation-detail-page">
      <div className="reservation-detail-hero">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.admin.reservations)}>
            <ArrowLeft size={15} /> 예약 목록
          </button>
          <div className="reservation-detail-hero__title">
            <span><CalendarCheck2 size={23} /></span>
            <div>
              <div><strong>{data.reservationNumber}</strong><ReservationStatusBadge status={data.status} /></div>
              <p>{data.userName} · {data.resourceName}</p>
            </div>
          </div>
        </div>
        <div className="reservation-detail-actions">
          {canReview && (
            <>
              <Button leadingIcon={<Check size={16} />} onClick={() => setAction('approve')}>승인</Button>
              <Button variant="outline" leadingIcon={<X size={16} />} onClick={() => setAction('reject')}>반려</Button>
            </>
          )}
          {canCancel && (
            <Button variant="danger" leadingIcon={<RotateCcw size={16} />} onClick={() => setAction('cancel')}>예약 취소</Button>
          )}
        </div>
      </div>

      <div className="reservation-detail-layout">
        <div className="reservation-detail-main">
          <Card title="예약 정보">
            <div className={`reservation-status-banner is-${data.status.toLowerCase()}`}>
              <span><CalendarCheck2 size={22} /></span>
              <div><ReservationStatusBadge status={data.status} /><strong>{statusMeta.label}</strong><p>{statusMeta.description}</p></div>
            </div>
            <dl className="reservation-detail-list">
              <DetailItem label="예약번호" value={<strong className="reservation-number">{data.reservationNumber}</strong>} />
              <DetailItem label="예약 상태" value={<ReservationStatusBadge status={data.status} />} />
              <DetailItem label="신청일" value={formatDateTime(data.createdAt)} />
              <DetailItem label="승인일" value={data.reviewedAt ? formatDateTime(data.reviewedAt) : '-'} />
              <DetailItem label="취소일" value={data.cancelledAt ? formatDateTime(data.cancelledAt) : '-'} />
              <DetailItem label="최근 수정일" value={formatDateTime(data.updatedAt)} />
            </dl>
          </Card>

          <Card title="이용 정보">
            <dl className="reservation-detail-list">
              <DetailItem label="이용 시작일" value={<span className="reservation-value-icon"><Clock3 size={14} />{formatDateTime(data.startAt)}</span>} />
              <DetailItem label="이용 종료일" value={<span className="reservation-value-icon"><Clock3 size={14} />{formatDateTime(data.endAt)}</span>} />
              <DetailItem label="신청 수량" value={`${data.quantity}개`} />
              <DetailItem label="이용 목적" value={data.purpose} wide />
              <DetailItem label="요청사항" value={data.requestNote || '요청사항이 없습니다.'} wide />
            </dl>
          </Card>

          <Card
            title="관리자 처리 정보"
            description="승인, 반려 또는 취소 처리 기록입니다."
            action={<Badge tone="neutral">처리 이력 {data.histories.length}건</Badge>}
          >
            {data.processorName ? (
              <>
                <dl className="reservation-detail-list">
                  <DetailItem label="처리 담당자" value={data.processorName} />
                  <DetailItem label="처리일" value={data.processedAt ? formatDateTime(data.processedAt) : '-'} />
                  <DetailItem label="처리 사유" value={data.processReason || '별도 처리 사유가 없습니다.'} wide />
                </dl>
                <ol className="reservation-process-timeline">
                  {data.histories.map((history) => (
                    <li key={history.id}>
                      <span />
                      <div><strong>{history.title}</strong><p>{history.reason || '별도 사유 없음'}</p><small>{formatDateTime(history.occurredAt)} · {history.actorName}</small></div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <div className="reservation-process-pending">
                <Clock3 size={20} />
                <div><strong>관리자 검토 대기 중</strong><p>승인 또는 반려 처리 후 담당자와 처리일이 기록됩니다.</p></div>
              </div>
            )}
          </Card>
        </div>

        <aside className="reservation-detail-side">
          <Card title="예약자 정보">
            <div className="reservation-person">
              <span><UserRound size={20} /></span>
              <div><strong>{data.userName}</strong><small>{data.organization}</small></div>
            </div>
            <ul className="reservation-contact-list">
              <li><Mail size={14} /><span>{data.userEmail}</span></li>
              <li><Phone size={14} /><span>{data.userPhone}</span></li>
              <li><Building2 size={14} /><span>{data.organization}</span></li>
            </ul>
          </Card>
          <Card title="자원 정보">
            <div className="reservation-resource-summary">
              <span><Box size={20} /></span>
              <div>
                <Link to={ROUTES.admin.resourceDetail(data.resourceId)}>{data.resourceName}</Link>
                <Link to={ROUTES.admin.resourceDetail(data.resourceId)}>{data.resourceCode}</Link>
              </div>
            </div>
            <dl className="reservation-resource-meta">
              <div><dt>분류</dt><dd>{data.resourceCategoryName}</dd></div>
              <div><dt>유형</dt><dd>{data.resourceTypeName}</dd></div>
              <div><dt><MapPin size={13} /> 위치</dt><dd>{data.resourceLocation}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>

      <div className="reservation-detail-bottom">
        <Button variant="outline" leadingIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.admin.reservations)}>예약 목록</Button>
        <div>
          {canReview && <Button leadingIcon={<Check size={16} />} onClick={() => setAction('approve')}>승인</Button>}
          {canReview && <Button variant="outline" leadingIcon={<X size={16} />} onClick={() => setAction('reject')}>반려</Button>}
          {canCancel && <Button variant="danger" leadingIcon={<RotateCcw size={16} />} onClick={() => setAction('cancel')}>예약 취소</Button>}
        </div>
      </div>

      {action && (
        <ReservationActionModal
          key={`${action}-${data.id}`}
          action={action}
          reservation={data}
          onClose={() => setAction(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}

function DetailItem({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
  return <div className={wide ? 'is-wide' : undefined}><dt>{label}</dt><dd>{value}</dd></div>
}

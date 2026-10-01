import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Box,
  Building2,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  Truck,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { RentalProcessModal, RentalReturnModal } from '../../../components/rentals/RentalActionModals'
import { RentalStatusBadge } from '../../../components/rentals/RentalStatusBadge'
import { Badge, Button, Card } from '../../../components/ui'
import { rentalStatusMeta, returnConditionMeta } from '../../../config/rental'
import { useRentalDetail } from '../../../hooks/useRentals'
import { ROUTES } from '../../../routes/paths'
import { formatDateTime } from '../../../utils/date'
import { canProcessRental, canProcessReturn } from '../../../utils/rental'

export default function RentalDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const rentalId = Number(id)
  const { data, status, error, refetch } = useRentalDetail(rentalId)
  const [processOpen, setProcessOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="rental-page-state"><AdminPageState type="loading" title="대여 상세 정보를 불러오는 중입니다" /></div>
  }
  if (status === 'error') {
    return <div className="rental-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (!data) {
    return <div className="rental-page-state"><AdminPageState type="empty" title="대여 정보를 찾을 수 없습니다" description="삭제되었거나 존재하지 않는 대여 건입니다." actionLabel="대여 목록" onAction={() => navigate(ROUTES.admin.rentals)} /></div>
  }

  const statusMeta = rentalStatusMeta[data.displayStatus]
  const showProcess = canProcessRental(data.displayStatus)
  const showReturn = canProcessReturn(data.displayStatus)

  return (
    <div className="rental-detail-page">
      <div className="rental-detail-hero">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.admin.rentals)}><ArrowLeft size={15} /> 대여 목록</button>
          <div className="rental-detail-hero__title">
            <span><Truck size={23} /></span>
            <div>
              <div><strong>{data.rentalNumber}</strong><RentalStatusBadge status={data.displayStatus} /></div>
              <p>{data.userName} · {data.resourceName}</p>
            </div>
          </div>
        </div>
        <div className="rental-detail-actions">
          {showProcess && <Button leadingIcon={<PackageCheck size={16} />} onClick={() => setProcessOpen(true)}>대여 처리</Button>}
          {showReturn && <Button leadingIcon={<RotateCcw size={16} />} onClick={() => setReturnOpen(true)}>반납 처리</Button>}
        </div>
      </div>

      <div className="rental-detail-layout">
        <div className="rental-detail-main">
          <Card title="대여 정보" description="대여 일정과 현재 처리 상태입니다.">
            <div className={`rental-status-banner is-${data.displayStatus.toLowerCase()}`}>
              <span><Truck size={22} /></span>
              <div><RentalStatusBadge status={data.displayStatus} /><strong>{statusMeta.label}</strong><p>{statusMeta.description}</p></div>
            </div>
            <dl className="rental-detail-list">
              <DetailItem label="대여번호" value={<strong className="rental-number">{data.rentalNumber}</strong>} />
              <DetailItem label="예약번호" value={data.reservationNumber ?? '-'} />
              <DetailItem label="대여 수량" value={`${data.quantity}개`} />
              <DetailItem label="대여일" value={data.rentedAt ? formatDateTime(data.rentedAt) : '-'} />
              <DetailItem label="반납 예정일" value={formatDateTime(data.dueAt)} />
              <DetailItem label="실제 반납일" value={data.returnedAt ? formatDateTime(data.returnedAt) : '-'} />
            </dl>
          </Card>

          <div className="rental-process-grid">
            <Card title="대여 처리 정보">
              {data.rentalProcessorName ? (
                <dl className="rental-detail-list rental-detail-list--single">
                  <DetailItem label="대여 처리자" value={data.rentalProcessorName} />
                  <DetailItem label="대여 처리일" value={data.rentalProcessedAt ? formatDateTime(data.rentalProcessedAt) : '-'} />
                  <DetailItem label="대여 시 비고" value={data.checkoutNote || '등록된 비고가 없습니다.'} />
                </dl>
              ) : <PendingNote text="대여 처리 전입니다. 처리 후 담당자와 처리일이 기록됩니다." />}
            </Card>
            <Card title="반납 처리 정보">
              {data.returnProcessorName ? (
                <dl className="rental-detail-list rental-detail-list--single">
                  <DetailItem label="반납 처리자" value={data.returnProcessorName} />
                  <DetailItem label="반납 처리일" value={data.returnProcessedAt ? formatDateTime(data.returnProcessedAt) : '-'} />
                  <DetailItem label="반납 상태" value={data.returnStatus ? <Badge tone={returnConditionMeta[data.returnStatus].tone}>{returnConditionMeta[data.returnStatus].label}</Badge> : '-'} />
                  <DetailItem label="반납 수량" value={data.returnedQuantity === null ? '-' : `${data.returnedQuantity}개`} />
                  <DetailItem label="반납 비고" value={data.returnNote || '등록된 비고가 없습니다.'} />
                </dl>
              ) : <PendingNote text="아직 반납 처리 기록이 없습니다." />}
            </Card>
          </div>

          <Card title="대여·반납 이력" description="신청부터 반납까지 시간순으로 표시합니다." action={<Badge tone="neutral">{data.histories.length}건</Badge>}>
            <ol className="rental-history">
              {data.histories.map((history) => (
                <li key={history.id}><span /><div><strong>{history.title}</strong><p>{history.description || '기록된 내용이 없습니다.'}</p><small>{formatDateTime(history.occurredAt)} · {history.actorName}</small></div></li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="rental-detail-side">
          <Card title="대여자 정보">
            <div className="rental-person"><span><UserRound size={20} /></span><div><strong>{data.userName}</strong><small>{data.organization}</small></div></div>
            <ul className="rental-contact-list">
              <li><Mail size={14} /><span>{data.userEmail}</span></li>
              <li><Phone size={14} /><span>{data.userPhone}</span></li>
              <li><Building2 size={14} /><span>{data.organization}</span></li>
            </ul>
          </Card>
          <Card title="자원 정보">
            <div className="rental-resource">
              <span><Box size={20} /></span>
              <div>
                <Link to={ROUTES.admin.resourceDetail(data.resourceId)}>{data.resourceName}</Link>
                <Link to={ROUTES.admin.resourceDetail(data.resourceId)}>{data.resourceCode}</Link>
              </div>
            </div>
            <dl className="rental-resource-meta">
              <div><dt>분류</dt><dd>{data.resourceCategoryName}</dd></div>
              <div><dt>유형</dt><dd>{data.resourceTypeName}</dd></div>
              <div><dt><MapPin size={13} /> 위치</dt><dd>{data.resourceLocation}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>

      <div className="rental-detail-bottom">
        <Button variant="outline" leadingIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.admin.rentals)}>대여 목록</Button>
        <div>
          {showProcess && <Button leadingIcon={<PackageCheck size={16} />} onClick={() => setProcessOpen(true)}>대여 처리</Button>}
          {showReturn && <Button leadingIcon={<RotateCcw size={16} />} onClick={() => setReturnOpen(true)}>반납 처리</Button>}
        </div>
      </div>

      {processOpen && <RentalProcessModal rental={data} onClose={() => setProcessOpen(false)} onSuccess={refetch} />}
      {returnOpen && <RentalReturnModal rental={data} onClose={() => setReturnOpen(false)} onSuccess={refetch} />}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

function PendingNote({ text }: { text: string }) {
  return <div className="rental-pending-note"><Clock3 size={18} /><p>{text}</p></div>
}

import { useState } from 'react'
import { ArrowLeft, ClipboardCheck, ClipboardPlus, MapPin, Pencil, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { InspectionCompleteModal } from '../../../components/inspections/InspectionCompleteModal'
import { InspectionResultBadge, InspectionStatusBadge } from '../../../components/inspections/InspectionStatusBadge'
import { Button, Card } from '../../../components/ui'
import { inspectionStatusMeta, inspectionTypeMeta } from '../../../config/inspection'
import { resourceStatusMeta } from '../../../config/resource'
import { returnConditionMeta } from '../../../config/rental'
import { useInspectionDetail } from '../../../hooks/useInspections'
import { ROUTES } from '../../../routes/paths'
import { formatDateTime } from '../../../utils/date'
import { canCompleteInspection, canEditInspection, canReinspect, formatInspectionDate } from '../../../utils/inspection'
import { ResourceStatusBadge } from '../../../components/resources/ResourceStatusBadge'

export default function InspectionDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const inspectionId = Number(id)
  const { data, status, error, refetch } = useInspectionDetail(inspectionId)
  const [isCompleting, setIsCompleting] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="inspection-page-state"><AdminPageState type="loading" title="점검 정보를 불러오는 중입니다" /></div>
  }
  if (status === 'error') {
    return <div className="inspection-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (!data) {
    return <div className="inspection-page-state"><AdminPageState type="empty" title="점검을 찾을 수 없습니다" description="삭제되었거나 존재하지 않는 점검입니다." actionLabel="점검 목록" onAction={() => navigate(ROUTES.admin.inspections)} /></div>
  }

  const statusMeta = inspectionStatusMeta[data.status]
  const linkedLabel = data.pendingDisposal
    ? '폐기 검토'
    : data.linkedResourceStatus
      ? resourceStatusMeta[data.linkedResourceStatus].label
      : '변경 없음'

  return (
    <div className="inspection-detail-page">
      <div className="inspection-detail-hero">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.admin.inspections)}><ArrowLeft size={14} /> 점검 목록</button>
          <div className="inspection-detail-hero__title">
            <span><ClipboardCheck size={22} /></span>
            <div>
              <div>
                <strong>{data.inspectionNumber}</strong>
                <InspectionStatusBadge status={data.status} />
              </div>
              <p>{data.resourceName} · {inspectionTypeMeta[data.type].label}</p>
            </div>
          </div>
        </div>
        <div className="inspection-detail-actions">
          {canEditInspection(data.status) && <Button variant="outline" leadingIcon={<Pencil size={16} />} onClick={() => navigate(ROUTES.admin.inspectionEdit(data.id))}>수정</Button>}
          {canCompleteInspection(data.status) && <Button onClick={() => setIsCompleting(true)}>점검 완료</Button>}
          {canReinspect(data.status) && <Button leadingIcon={<ClipboardPlus size={16} />} onClick={() => navigate(`${ROUTES.admin.inspectionNew}?parent=${data.id}`)}>재점검 등록</Button>}
        </div>
      </div>

      <div className="inspection-detail-layout">
        <div className="inspection-detail-main">
          <Card title="점검 정보" description="점검 일정과 현재 처리 상태입니다.">
            <div className={`inspection-status-banner is-${data.status.toLowerCase()}`}>
              <span><ClipboardCheck size={18} /></span>
              <div>
                <InspectionStatusBadge status={data.status} />
                <strong>{statusMeta.label}</strong>
                <p>{statusMeta.description}</p>
              </div>
            </div>
            <dl className="inspection-detail-list">
              <div><dt>점검번호</dt><dd>{data.inspectionNumber}</dd></div>
              <div><dt>점검 유형</dt><dd>{inspectionTypeMeta[data.type].label}</dd></div>
              <div><dt>점검 예정일</dt><dd>{formatInspectionDate(data.scheduledDate)}</dd></div>
              <div><dt>실제 점검일</dt><dd>{formatInspectionDate(data.inspectedDate)}</dd></div>
              <div><dt>등록일</dt><dd>{formatDateTime(data.createdAt)}</dd></div>
              <div><dt>수정일</dt><dd>{formatDateTime(data.updatedAt)}</dd></div>
              {data.parentInspectionNumber && (
                <div><dt>상위 점검</dt><dd><Link to={ROUTES.admin.inspectionDetail(data.parentInspectionId ?? '')}>{data.parentInspectionNumber}</Link></dd></div>
              )}
            </dl>
          </Card>

          <Card title="점검 결과" description="이상 내용과 조치 내용을 구분해서 확인합니다.">
            {data.result ? (
              <dl className="inspection-detail-list inspection-detail-list--single">
                <div><dt>점검 결과</dt><dd><InspectionResultBadge result={data.result} /></dd></div>
                <div><dt>점검 내용</dt><dd>{data.content || '-'}</dd></div>
                <div><dt>이상 내용</dt><dd>{data.issueDescription || '-'}</dd></div>
                <div><dt>조치 내용</dt><dd>{data.actionDescription || '-'}</dd></div>
                <div><dt>관리자 메모</dt><dd>{data.note || '-'}</dd></div>
                <div><dt>자원 상태 연계</dt><dd>{linkedLabel}</dd></div>
              </dl>
            ) : (
              <p className="inspection-empty-copy">아직 점검 결과가 없습니다. 점검 완료 처리 후 결과와 조치 내용이 기록됩니다.</p>
            )}
          </Card>

          {data.returnInfo && (
            <Card title="반납 정보" description="반납점검에 연결된 대여 정보입니다.">
              <dl className="inspection-detail-list">
                <div><dt>대여번호</dt><dd><Link to={ROUTES.admin.rentalDetail(data.returnInfo.rentalId)}>{data.returnInfo.rentalNumber}</Link></dd></div>
                <div><dt>반납일</dt><dd>{data.returnInfo.returnedAt ? formatDateTime(data.returnInfo.returnedAt) : '-'}</dd></div>
                <div><dt>반납 상태</dt><dd>{data.returnInfo.returnStatus ? returnConditionMeta[data.returnInfo.returnStatus].label : '-'}</dd></div>
                <div><dt>반납 수량</dt><dd>{data.returnInfo.returnedQuantity ?? '-'}{data.returnInfo.returnedQuantity != null ? '개' : ''}</dd></div>
              </dl>
            </Card>
          )}

          <Card title="점검 이력" description="등록부터 완료, 재점검까지 시간순으로 표시합니다.">
            {data.histories.length === 0 ? (
              <p className="inspection-empty-copy">표시할 이력이 없습니다.</p>
            ) : (
              <ol className="inspection-timeline">
                {data.histories.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    {item.description && <p>{item.description}</p>}
                    <small>{formatDateTime(item.occurredAt)} · {item.actorName}</small>
                  </li>
                ))}
              </ol>
            )}
            {data.childInspections.length > 0 && (
              <div className="inspection-children">
                <strong>연결된 재점검</strong>
                {data.childInspections.map((child) => (
                  <Link key={child.id} to={ROUTES.admin.inspectionDetail(child.id)}>
                    {child.inspectionNumber}
                    <InspectionStatusBadge status={child.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="inspection-detail-side">
          <Card title="담당자 정보">
            <div className="inspection-person">
              <span><UserRound size={18} /></span>
              <div>
                <strong>{data.inspectorName}</strong>
                <p>점검 담당자</p>
              </div>
            </div>
            <dl className="inspection-detail-list inspection-detail-list--single">
              <div><dt>처리 담당자</dt><dd>{data.processorName ?? '-'}</dd></div>
            </dl>
          </Card>
          <Card title="자원 정보">
            <div className="inspection-person">
              <span><MapPin size={18} /></span>
              <div>
                <strong><Link to={ROUTES.admin.resourceDetail(data.resourceId)}>{data.resourceName}</Link></strong>
                <p>{data.resourceCode}</p>
              </div>
            </div>
            <dl className="inspection-detail-list inspection-detail-list--single">
              <div><dt>분류</dt><dd>{data.resourceCategoryName}</dd></div>
              <div><dt>유형</dt><dd>{data.resourceTypeName}</dd></div>
              <div><dt>보관 위치</dt><dd>{data.resourceLocation}</dd></div>
              <div><dt>현재 자원 상태</dt><dd><ResourceStatusBadge status={data.resourceStatus} /></dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <div className="inspection-detail-bottom">
        <Button variant="outline" leadingIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.admin.inspections)}>목록</Button>
        <div>
          {canEditInspection(data.status) && <Button variant="outline" onClick={() => navigate(ROUTES.admin.inspectionEdit(data.id))}>수정</Button>}
          {canCompleteInspection(data.status) && <Button onClick={() => setIsCompleting(true)}>점검 완료</Button>}
          {canReinspect(data.status) && <Button onClick={() => navigate(`${ROUTES.admin.inspectionNew}?parent=${data.id}`)}>재점검 등록</Button>}
        </div>
      </div>

      {isCompleting && <InspectionCompleteModal inspection={data} onClose={() => setIsCompleting(false)} onSuccess={refetch} />}
    </div>
  )
}

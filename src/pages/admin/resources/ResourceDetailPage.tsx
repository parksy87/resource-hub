import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Box,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { ResourceStatusBadge } from '../../../components/resources/ResourceStatusBadge'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  Tabs,
} from '../../../components/ui'
import { useResourceDetail } from '../../../hooks/useResources'
import { resourceStatusMeta } from '../../../config/resource'
import { ROUTES } from '../../../routes/paths'
import { resourceService } from '../../../services/resourceService'
import { useUiStore } from '../../../stores/uiStore'
import type { ResourceHistoryType } from '../../../types'
import { formatDate, formatDateTime } from '../../../utils/date'

const historyTabs = [
  { id: 'RESERVATION', label: '예약 이력' },
  { id: 'RENTAL', label: '대여/반납 이력' },
  { id: 'INSPECTION', label: '점검 이력' },
  { id: 'CHANGE', label: '변경 이력' },
]

export default function ResourceDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const resourceId = id
  const { data, status, error, refetch } = useResourceDetail(resourceId)
  const addToast = useUiStore((state) => state.addToast)
  const [activeHistory, setActiveHistory] = useState<ResourceHistoryType>('RESERVATION')
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="resource-page-state"><AdminPageState type="loading" title="자원 상세 정보를 불러오는 중입니다" /></div>
  }

  if (status === 'error') {
    return <div className="resource-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }

  if (!data) {
    return <div className="resource-page-state"><AdminPageState type="empty" title="자원을 찾을 수 없습니다" description="삭제되었거나 존재하지 않는 자원입니다." actionLabel="자원 목록" onAction={() => navigate(ROUTES.admin.resources)} /></div>
  }

  const histories = data.histories.filter((history) => history.type === activeHistory)
  const statusMeta = resourceStatusMeta[data.status]

  const handleDelete = async () => {
    try {
      await resourceService.deleteResource(data.id)
      addToast({
        tone: 'success',
        title: '자원을 삭제했습니다.',
        description: `${data.name} (${data.resourceCode})`,
      })
      navigate(ROUTES.admin.resources)
    } catch {
      addToast({ tone: 'error', title: '자원을 삭제하지 못했습니다.' })
    }
  }

  return (
    <div className="resource-detail-page">
      <div className="resource-detail-hero">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.admin.resources)}>
            <ArrowLeft size={15} /> 자원 목록
          </button>
          <div className="resource-detail-hero__title">
            <span className="resource-detail-hero__icon"><Box size={23} /></span>
            <div>
              <div><strong>{data.name}</strong><ResourceStatusBadge status={data.status} /></div>
              <p>{data.resourceCode} · {data.categoryName} / {data.typeName}</p>
            </div>
          </div>
        </div>
        <div className="resource-detail-actions">
          <Button variant="outline" leadingIcon={<Pencil size={16} />} onClick={() => navigate(ROUTES.admin.resourceEdit(data.id))}>수정</Button>
          <Button variant="danger" leadingIcon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>삭제</Button>
        </div>
      </div>

      <div className="resource-detail-grid">
        <Card title="기본 정보" description="자원의 등록 정보와 관리 기준입니다." className="resource-detail-info-card">
          <dl className="resource-detail-list">
            <DetailItem label="자원 코드" value={<strong className="resource-code">{data.resourceCode}</strong>} />
            <DetailItem label="자원 분류" value={data.categoryName} />
            <DetailItem label="자원 유형" value={data.typeName} />
            <DetailItem label="보관 위치" value={<span className="resource-detail-value-icon"><MapPin size={14} />{data.location}</span>} />
            <DetailItem label="담당자" value={<span className="resource-detail-value-icon"><UserRound size={14} />{data.managerName}</span>} />
            <DetailItem label="수량" value={`전체 ${data.totalQuantity}개 · 사용 가능 ${data.availableQuantity}개`} />
            <DetailItem label="구입일" value={data.purchaseDate ? formatDate(data.purchaseDate) : '-'} />
            <DetailItem label="관리 종료일" value={data.managementEndDate ? formatDate(data.managementEndDate) : '-'} />
            <DetailItem label="등록일" value={formatDateTime(data.createdAt)} />
            <DetailItem label="수정일" value={formatDateTime(data.updatedAt)} />
          </dl>
          <div className="resource-detail-text">
            <div><span>설명</span><p>{data.description || '등록된 설명이 없습니다.'}</p></div>
            <div><span>비고</span><p>{data.notes || '등록된 비고가 없습니다.'}</p></div>
          </div>
        </Card>

        <div className="resource-detail-side">
          <Card title="현재 상태">
            <div className={`resource-status-panel is-${data.status.toLowerCase()}`}>
              <span><Box size={23} /></span>
              <div><ResourceStatusBadge status={data.status} /><strong>{statusMeta.label}</strong><p>{statusMeta.description}</p></div>
            </div>
            <div className="resource-status-meta">
              <span><CalendarDays size={15} /> 최근 수정</span>
              <strong>{formatDateTime(data.updatedAt)}</strong>
            </div>
          </Card>
          <Card title="대표 이미지">
            {data.imageUrl ? (
              <img className="resource-detail-image" src={data.imageUrl} alt={`${data.name} 대표 이미지`} />
            ) : (
              <EmptyState compact title="등록된 이미지가 없습니다" description="수정 화면에서 대표 이미지를 추가할 수 있습니다." />
            )}
          </Card>
        </div>
      </div>

      <Card padding="none" className="resource-history-card">
        <div className="resource-history-heading">
          <div><h3>관련 이력</h3><p>예약, 대여·반납, 점검 및 정보 변경 기록을 확인합니다.</p></div>
          <Badge tone="neutral">API 연결 예정</Badge>
        </div>
        <Tabs
          items={historyTabs}
          value={activeHistory}
          onChange={(value) => setActiveHistory(value as ResourceHistoryType)}
          ariaLabel="자원 관련 이력"
        />
        <div className="resource-history-content">
          {histories.length === 0 ? (
            <EmptyState compact title={`${historyTabs.find((tab) => tab.id === activeHistory)?.label}이 없습니다`} description="향후 관련 업무 데이터가 연결되면 이곳에 표시됩니다." />
          ) : (
            <ol className="resource-history-timeline">
              {histories.map((history) => (
                <li key={history.id}>
                  <span />
                  <div><strong>{history.title}</strong><p>{history.description}</p><small>{formatDateTime(history.occurredAt)} · {history.actorName ?? '시스템'}</small></div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>

      <div className="resource-detail-bottom-actions">
        <Button variant="outline" leadingIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.admin.resources)}>목록</Button>
        <div>
          <Button variant="outline" leadingIcon={<Pencil size={16} />} onClick={() => navigate(ROUTES.admin.resourceEdit(data.id))}>수정</Button>
          <Button variant="danger" leadingIcon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>삭제</Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="해당 자원을 삭제하시겠습니까?"
        description={`${data.name} (${data.resourceCode}) 자원을 삭제합니다. 관련 이력이 있는 경우 삭제 전 다시 확인해주세요.`}
        confirmLabel="자원 삭제"
      />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

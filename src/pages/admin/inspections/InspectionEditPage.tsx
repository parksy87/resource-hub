import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { InspectionForm } from '../../../components/inspections/InspectionForm'
import { useInspectionDetail } from '../../../hooks/useInspections'
import { ROUTES } from '../../../routes/paths'
import { inspectionService } from '../../../services/inspectionService'
import { useUiStore } from '../../../stores/uiStore'
import type { InspectionFormValues, InspectionPayload } from '../../../types'
import { canEditInspection } from '../../../utils/inspection'

export default function InspectionEditPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const inspectionId = Number(id)
  const { data, status, error, refetch } = useInspectionDetail(inspectionId)
  const addToast = useUiStore((state) => state.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="inspection-page-state"><AdminPageState type="loading" title="점검 정보를 불러오는 중입니다" /></div>
  }
  if (status === 'error') {
    return <div className="inspection-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (!data) {
    return <div className="inspection-page-state"><AdminPageState type="empty" title="점검을 찾을 수 없습니다" actionLabel="점검 목록" onAction={() => navigate(ROUTES.admin.inspections)} /></div>
  }
  if (!canEditInspection(data.status)) {
    return <div className="inspection-page-state"><AdminPageState type="empty" title="완료된 점검은 수정할 수 없습니다" description="점검 예정 또는 점검 중 상태만 수정할 수 있습니다." actionLabel="점검 상세" onAction={() => navigate(ROUTES.admin.inspectionDetail(data.id))} /></div>
  }

  const initialValues: InspectionFormValues = {
    resourceId: String(data.resourceId),
    type: data.type,
    scheduledDate: data.scheduledDate,
    inspectorId: String(data.inspectorId),
    content: data.content ?? '',
    note: data.note ?? '',
    rentalId: data.rentalId ? String(data.rentalId) : '',
  }

  const handleSubmit = async (payload: InspectionPayload) => {
    setIsSubmitting(true)
    try {
      const updated = await inspectionService.updateInspection(inspectionId, payload)
      addToast({
        tone: 'success',
        title: '점검 정보를 수정했습니다.',
        description: `${updated.inspectionNumber} · ${updated.resourceName}`,
      })
      navigate(ROUTES.admin.inspectionDetail(inspectionId))
    } catch {
      addToast({ tone: 'error', title: '점검 정보를 수정하지 못했습니다.', description: '완료된 점검이거나 입력 내용을 확인해 주세요.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="resource-form-page">
      <div className="resource-page-heading">
        <div>
          <span><Pencil size={14} /> EDIT INSPECTION</span>
          <h2>점검 수정</h2>
          <p>{data.inspectionNumber}의 일정, 담당자, 점검 내용을 수정합니다.</p>
        </div>
      </div>
      <InspectionForm
        key={data.updatedAt}
        mode="edit"
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.admin.inspectionDetail(inspectionId))}
        onList={() => navigate(ROUTES.admin.inspections)}
      />
    </div>
  )
}

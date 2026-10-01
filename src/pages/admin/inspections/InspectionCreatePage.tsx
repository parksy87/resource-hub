import { useState } from 'react'
import { ClipboardPlus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { InspectionForm } from '../../../components/inspections/InspectionForm'
import { useInspectionDetail } from '../../../hooks/useInspections'
import { ROUTES } from '../../../routes/paths'
import { inspectionService } from '../../../services/inspectionService'
import { useUiStore } from '../../../stores/uiStore'
import type { InspectionFormValues, InspectionPayload } from '../../../types'
import { emptyInspectionForm } from '../../../utils/inspection'

function valuesFromParent(resourceId: number, inspectorId: number, type: InspectionFormValues['type'], rentalId: number | null, parentNumber: string): InspectionFormValues {
  return {
    ...emptyInspectionForm,
    resourceId: String(resourceId),
    inspectorId: String(inspectorId),
    type,
    rentalId: rentalId ? String(rentalId) : '',
    content: `${parentNumber} 점검 결과를 참고한 재점검입니다.`,
  }
}

export default function InspectionCreatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const parentId = Number(params.get('parent')) || null
  const { data: parent, status, error, refetch } = useInspectionDetail(parentId)
  const addToast = useUiStore((state) => state.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (parentId && (status === 'loading' || status === 'idle')) {
    return <div className="inspection-page-state"><AdminPageState type="loading" title="상위 점검 정보를 불러오는 중입니다" /></div>
  }
  if (parentId && status === 'error') {
    return <div className="inspection-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (parentId && !parent) {
    return <div className="inspection-page-state"><AdminPageState type="empty" title="상위 점검을 찾을 수 없습니다" actionLabel="점검 목록" onAction={() => navigate(ROUTES.admin.inspections)} /></div>
  }

  const initialValues = parent
    ? valuesFromParent(parent.resourceId, parent.inspectorId, parent.type, parent.rentalId, parent.inspectionNumber)
    : emptyInspectionForm

  const handleSubmit = async (payload: InspectionPayload) => {
    setIsSubmitting(true)
    try {
      const created = parent
        ? (await inspectionService.reinspect(parent.id, payload)).inspection
        : await inspectionService.createInspection(payload)
      addToast({
        tone: 'success',
        title: parent ? '재점검을 등록했습니다.' : '점검을 등록했습니다.',
        description: `${created.inspectionNumber} · ${created.resourceName}`,
      })
      navigate(ROUTES.admin.inspectionDetail(created.id))
    } catch {
      addToast({ tone: 'error', title: parent ? '재점검을 등록하지 못했습니다.' : '점검을 등록하지 못했습니다.', description: '입력 내용과 점검 상태를 확인해 주세요.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="resource-form-page">
      <div className="resource-page-heading">
        <div>
          <span><ClipboardPlus size={14} /> {parent ? 'REINSPECTION' : 'NEW INSPECTION'}</span>
          <h2>{parent ? '재점검 등록' : '점검 등록'}</h2>
          <p>자원, 점검 유형, 예정일, 담당자를 입력해 점검 예정으로 등록합니다.</p>
        </div>
      </div>
      <InspectionForm
        key={parent?.id ?? 'new'}
        mode="create"
        initialValues={initialValues}
        lockResource={Boolean(parent)}
        parentNumber={parent?.inspectionNumber}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(parent ? ROUTES.admin.inspectionDetail(parent.id) : ROUTES.admin.inspections)}
        onList={() => navigate(ROUTES.admin.inspections)}
      />
    </div>
  )
}

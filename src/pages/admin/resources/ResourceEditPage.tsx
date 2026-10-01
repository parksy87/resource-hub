import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { ResourceForm } from '../../../components/resources/ResourceForm'
import { useResourceDetail } from '../../../hooks/useResources'
import { ROUTES } from '../../../routes/paths'
import { resourceService } from '../../../services/resourceService'
import { useUiStore } from '../../../stores/uiStore'
import type { ResourcePayload } from '../../../types'
import { resourceToFormValues } from '../../../utils/resourceForm'

export default function ResourceEditPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const resourceId = id
  const { data, status, error, refetch } = useResourceDetail(resourceId)
  const addToast = useUiStore((state) => state.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'loading' || status === 'idle') {
    return <div className="resource-page-state"><AdminPageState type="loading" title="자원 정보를 불러오는 중입니다" /></div>
  }

  if (status === 'error') {
    return <div className="resource-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }

  if (!data) {
    return <div className="resource-page-state"><AdminPageState type="empty" title="자원을 찾을 수 없습니다" description="삭제되었거나 존재하지 않는 자원입니다." actionLabel="자원 목록" onAction={() => navigate(ROUTES.admin.resources)} /></div>
  }

  const handleSubmit = async (payload: ResourcePayload) => {
    setIsSubmitting(true)
    try {
      const updated = await resourceService.updateResource(resourceId, payload)
      addToast({
        tone: 'success',
        title: '자원 정보를 수정했습니다.',
        description: `${updated.name} (${updated.resourceCode})`,
      })
      navigate(ROUTES.admin.resourceDetail(resourceId))
    } catch {
      addToast({ tone: 'error', title: '자원 정보를 수정하지 못했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="resource-form-page">
      <div className="resource-page-heading">
        <div>
          <span><Pencil size={14} /> EDIT RESOURCE</span>
          <h2>자원 수정</h2>
          <p>기본 정보와 관리 기준을 수정합니다.</p>
        </div>
      </div>
      <ResourceForm
        key={data.id}
        mode="edit"
        initialValues={resourceToFormValues(data)}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.admin.resourceDetail(resourceId))}
      />
    </div>
  )
}

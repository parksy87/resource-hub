import { useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ResourceForm } from '../../../components/resources/ResourceForm'
import { ROUTES } from '../../../routes/paths'
import { ResourceServiceError, resourceService } from '../../../services/resourceService'
import { useUiStore } from '../../../stores/uiStore'
import type { ResourcePayload } from '../../../types'
import { emptyResourceForm } from '../../../utils/resourceForm'

export default function ResourceCreatePage() {
  const navigate = useNavigate()
  const addToast = useUiStore((state) => state.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (payload: ResourcePayload) => {
    setIsSubmitting(true)
    try {
      const created = await resourceService.createResource(payload)
      addToast({
        tone: 'success',
        title: '자원을 등록했습니다.',
        description: `${created.name} (${created.resourceCode})`,
      })
      navigate(ROUTES.admin.resourceDetail(created.id))
    } catch (caught) {
      const description =
        caught instanceof ResourceServiceError
          ? caught.message
          : '입력 내용을 확인하고 다시 시도해주세요.'
      addToast({ tone: 'error', title: '자원을 등록하지 못했습니다.', description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="resource-form-page">
      <div className="resource-page-heading">
        <div>
          <span><PackagePlus size={14} /> NEW RESOURCE</span>
          <h2>자원 등록</h2>
          <p><b>필수</b>로 표시된 항목을 입력해 새로운 자원을 등록합니다.</p>
        </div>
      </div>
      <ResourceForm
        mode="create"
        initialValues={emptyResourceForm}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.admin.resources)}
        onList={() => navigate(ROUTES.admin.resources)}
      />
    </div>
  )
}

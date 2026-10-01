import { useState } from 'react'
import { Pencil, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminPageState } from '../../../components/admin/AdminPageState'
import { UserForm } from '../../../components/users/UserForm'
import { Button, Modal } from '../../../components/ui'
import { useUserDetail } from '../../../hooks/useUsers'
import { ROUTES } from '../../../routes/paths'
import { userService } from '../../../services/userService'
import { useUiStore } from '../../../stores/uiStore'
import type { UserFormValues, UserPayload } from '../../../types'
import { canManageUser, isAdminRole, userErrorMessage } from '../../../utils/user'

export default function UserEditPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const userId = Number(id)
  const { data, status, error, refetch } = useUserDetail(userId)
  const addToast = useUiStore((state) => state.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pending, setPending] = useState<UserPayload | null>(null)

  if (status === 'loading' || status === 'idle') {
    return <div className="user-page-state"><AdminPageState type="loading" title="사용자 정보를 불러오는 중입니다" /></div>
  }
  if (status === 'error') {
    return <div className="user-page-state"><AdminPageState type="error" title={error ?? undefined} onAction={refetch} /></div>
  }
  if (!data) {
    return <div className="user-page-state"><AdminPageState type="empty" title="사용자를 찾을 수 없습니다" actionLabel="사용자 목록" onAction={() => navigate(ROUTES.admin.users)} /></div>
  }
  if (!canManageUser(data.status)) {
    return <div className="user-page-state"><AdminPageState type="empty" title="탈퇴한 사용자는 수정할 수 없습니다" description="탈퇴 상태의 계정은 정보 수정과 상태 변경이 제한됩니다." actionLabel="사용자 상세" onAction={() => navigate(ROUTES.admin.userDetail(data.id))} /></div>
  }

  const initialValues: UserFormValues = {
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    organization: data.organization,
    role: data.role,
    status: data.status,
    statusReason: '',
  }

  const save = async (payload: UserPayload) => {
    setIsSubmitting(true)
    try {
      const result = await userService.updateUser(userId, payload)
      addToast({ tone: 'success', title: result.message, description: result.user.name })
      navigate(ROUTES.admin.userDetail(userId))
    } catch (caught) {
      addToast({ tone: 'error', title: '사용자 정보를 수정하지 못했습니다.', description: userErrorMessage(caught, '입력 내용을 확인하고 다시 시도해주세요.') })
    } finally {
      setIsSubmitting(false)
      setPending(null)
    }
  }

  const handleSubmit = async (payload: UserPayload) => {
    if (!isAdminRole(data.role) && isAdminRole(payload.role)) {
      setPending(payload)
      return
    }
    await save(payload)
  }

  return (
    <div className="resource-form-page">
      <div className="resource-page-heading">
        <div>
          <span><Pencil size={14} /> EDIT USER</span>
          <h2>사용자 수정</h2>
          <p>{data.name}의 기본 정보와 이용 상태를 수정합니다.</p>
        </div>
      </div>
      <UserForm
        key={data.updatedAt}
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.admin.userDetail(userId))}
      />
      {pending && (
        <Modal
          isOpen
          onClose={() => setPending(null)}
          title="관리자 권한으로 변경하시겠습니까?"
          description="확인하면 이 사용자는 관리자 유형으로 저장됩니다. 실제 권한 인증은 이후 단계에서 연결합니다."
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setPending(null)} disabled={isSubmitting}>닫기</Button>
              <Button onClick={() => void save(pending)} isLoading={isSubmitting}>권한 변경</Button>
            </>
          }
        >
          <div className="user-action-summary">
            <span><ShieldCheck size={21} /></span>
            <div>
              <strong>{pending.name}</strong>
              <p>일반 사용자에서 관리자로 변경됩니다.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

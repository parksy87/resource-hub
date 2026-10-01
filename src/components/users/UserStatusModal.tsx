import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { userStatusMeta } from '../../config/user'
import { userService } from '../../services/userService'
import { useUiStore } from '../../stores/uiStore'
import type { UserListItem, UserStatus } from '../../types'
import { userErrorMessage } from '../../utils/user'
import { Button, Modal, Select, Textarea } from '../ui'

const statuses = Object.keys(userStatusMeta) as UserStatus[]

interface UserStatusModalProps {
  user: Pick<UserListItem, 'id' | 'name' | 'email' | 'status'>
  onClose: () => void
  onSuccess: () => void
}

export function UserStatusModal({ user, onClose, onSuccess }: UserStatusModalProps) {
  const addToast = useUiStore((state) => state.addToast)
  const [status, setStatus] = useState<UserStatus>(user.status)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const changed = status !== user.status

  const handleChange = async () => {
    if (!changed) return
    if (status === 'SUSPENDED' && !reason.trim()) {
      setError('이용정지 사유를 입력해 주세요.')
      return
    }
    setIsProcessing(true)
    try {
      const result = await userService.changeStatus(user.id, { status, reason: reason.trim() || null })
      addToast({ tone: 'success', title: result.message, description: `${user.name} · ${userStatusMeta[status].label}` })
      onSuccess()
      onClose()
    } catch (caught) {
      addToast({ tone: 'error', title: '사용자 상태를 변경하지 못했습니다.', description: userErrorMessage(caught, '잠시 후 다시 시도해주세요.') })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="상태를 변경하시겠습니까?"
      description="확인하면 사용자 이용 상태가 즉시 변경되고 이력이 남습니다."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>닫기</Button>
          <Button onClick={() => void handleChange()} isLoading={isProcessing} disabled={!changed}>상태 변경</Button>
        </>
      }
    >
      <div className="user-action-summary">
        <span><ShieldAlert size={21} /></span>
        <div>
          <strong>{user.name}</strong>
          <p>{user.email} · 현재 {userStatusMeta[user.status].label}</p>
        </div>
      </div>
      <div className="user-action-fields">
        <Select
          label="변경할 상태"
          required
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UserStatus)
            setError('')
          }}
          options={statuses.map((key) => ({ label: userStatusMeta[key].label, value: key }))}
        />
        {status === 'SUSPENDED' && (
          <Textarea
            label="정지 사유"
            required
            value={reason}
            error={error}
            onChange={(event) => {
              setReason(event.target.value)
              setError('')
            }}
            placeholder="이용을 제한하는 사유를 입력하세요."
          />
        )}
      </div>
    </Modal>
  )
}

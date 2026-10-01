import { useState } from 'react'
import { rentalService } from '../../services/rentalService'
import type { EntityId, RentalDetail } from '../../types'
import { Button, DatePicker, Modal, Textarea } from '../ui'

interface ReturnRequestDialogProps {
  rentalId: EntityId | string
  isOpen: boolean
  onClose: () => void
  onRequested: (detail: RentalDetail) => void
}

export function ReturnRequestDialog({ rentalId, isOpen, onClose, onRequested }: ReturnRequestDialogProps) {
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function close() {
    if (isSubmitting) return
    setDueDate('')
    setNote('')
    setError('')
    onClose()
  }

  async function submit() {
    if (!dueDate) {
      setError('반납 예정일을 선택해 주세요.')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const result = await rentalService.requestReturn(rentalId, { dueDate, note })
      setDueDate('')
      setNote('')
      onRequested(result.rental)
      onClose()
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : ''
      setError(code === 'INVALID_STATUS' ? '반납을 신청할 수 없는 대여입니다.' : '반납을 신청하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="반납 신청"
      description="해당 자원의 반납을 신청하시겠습니까?"
      size="sm"
      onClose={close}
      footer={(
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>취소</Button>
          <Button type="button" onClick={() => void submit()} isLoading={isSubmitting}>
            {isSubmitting ? '반납 신청 중' : '반납 신청'}
          </Button>
        </>
      )}
    >
      <div className="user-rental-return-form">
        <DatePicker
          label="반납 예정일"
          name="return-due-date"
          value={dueDate}
          required
          autoFocus
          error={error}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <Textarea
          label="반납 메모"
          name="return-note"
          value={note}
          rows={4}
          placeholder="반납 시 전달할 내용을 입력해 주세요"
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </Modal>
  )
}

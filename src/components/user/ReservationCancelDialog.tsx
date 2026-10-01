import { useState } from 'react'
import { reservationService } from '../../services/reservationService'
import type { ReservationDetail } from '../../types'
import { Button, Modal, Textarea } from '../ui'

interface ReservationCancelDialogProps {
  reservationId: number | string
  isOpen: boolean
  onClose: () => void
  onCancelled: (detail: ReservationDetail) => void
}

export function ReservationCancelDialog({
  reservationId,
  isOpen,
  onClose,
  onCancelled,
}: ReservationCancelDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function close() {
    if (isSubmitting) return
    setReason('')
    setError('')
    onClose()
  }

  async function submit() {
    const nextReason = reason.trim()
    if (!nextReason) {
      setError('취소 사유를 입력해 주세요.')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const result = await reservationService.cancelMyReservation(reservationId, nextReason)
      setReason('')
      onCancelled(result.reservation)
      onClose()
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : ''
      setError(code === 'INVALID_STATUS' ? '취소할 수 없는 예약입니다.' : '예약을 취소하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="예약 취소"
      description="예약을 취소하시겠습니까?"
      size="sm"
      onClose={close}
      footer={(
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>닫기</Button>
          <Button type="button" variant="danger" onClick={() => void submit()} isLoading={isSubmitting}>예약 취소</Button>
        </>
      )}
    >
      <Textarea
        label="취소 사유"
        name="cancellation-reason"
        value={reason}
        required
        autoFocus
        rows={4}
        error={error}
        placeholder="취소 사유를 입력해 주세요"
        onChange={(event) => setReason(event.target.value)}
      />
    </Modal>
  )
}

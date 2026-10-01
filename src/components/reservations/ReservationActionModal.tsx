import { useState } from 'react'
import { AlertTriangle, CheckCircle2, CircleX } from 'lucide-react'
import { reservationService } from '../../services/reservationService'
import { useUiStore } from '../../stores/uiStore'
import type { ReservationDetail, ReservationListItem } from '../../types'
import { Button, Modal, Textarea } from '../ui'

export type ReservationAction = 'approve' | 'reject' | 'cancel'

interface ReservationActionModalProps {
  action: ReservationAction
  reservation: ReservationListItem | ReservationDetail
  onClose: () => void
  onSuccess: () => void
}

const actionCopy = {
  approve: {
    title: '해당 예약을 승인하시겠습니까?',
    description: '승인 후 사용자는 예약 기간에 자원을 이용할 수 있습니다.',
    confirmLabel: '예약 승인',
  },
  reject: {
    title: '예약을 반려하시겠습니까?',
    description: '예약자에게 전달할 명확한 반려 사유를 입력해주세요.',
    confirmLabel: '예약 반려',
  },
  cancel: {
    title: '예약을 취소하시겠습니까?',
    description: '취소 후에는 이전 상태로 되돌릴 수 없습니다.',
    confirmLabel: '예약 취소',
  },
} as const

export function ReservationActionModal({
  action,
  reservation,
  onClose,
  onSuccess,
}: ReservationActionModalProps) {
  const addToast = useUiStore((state) => state.addToast)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const copy = actionCopy[action]

  const handleProcess = async () => {
    if (action === 'reject' && !reason.trim()) {
      setReasonError('반려 사유를 입력해주세요.')
      return
    }

    setIsProcessing(true)
    try {
      const result =
        action === 'approve'
          ? await reservationService.approveReservation(reservation.id)
          : action === 'reject'
            ? await reservationService.rejectReservation(reservation.id, reason)
            : await reservationService.cancelReservation(reservation.id, reason)

      addToast({
        tone: 'success',
        title: result.message,
        description: `${reservation.reservationNumber} · ${reservation.resourceName}`,
      })
      onSuccess()
      onClose()
    } catch {
      addToast({
        tone: 'error',
        title: '예약 상태를 변경하지 못했습니다.',
        description: '현재 상태를 확인하고 다시 시도해주세요.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const ActionIcon = action === 'approve' ? CheckCircle2 : action === 'reject' ? CircleX : AlertTriangle

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>닫기</Button>
          <Button
            variant={action === 'approve' ? 'primary' : 'danger'}
            onClick={() => void handleProcess()}
            isLoading={isProcessing}
          >
            {copy.confirmLabel}
          </Button>
        </>
      }
    >
      <div className={`reservation-action-summary is-${action}`}>
        <span><ActionIcon size={21} /></span>
        <div>
          <strong>{reservation.resourceName}</strong>
          <p>{reservation.reservationNumber} · {reservation.userName}</p>
        </div>
      </div>
      {action !== 'approve' && (
        <div className="reservation-action-reason">
          <Textarea
            label={action === 'reject' ? '반려 사유' : '취소 사유'}
            required={action === 'reject'}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setReasonError('')
            }}
            error={reasonError}
            placeholder={
              action === 'reject'
                ? '예약을 반려하는 사유를 입력하세요.'
                : '취소 사유를 입력하세요. 입력하지 않으면 기본 사유가 기록됩니다.'
            }
          />
        </div>
      )}
    </Modal>
  )
}

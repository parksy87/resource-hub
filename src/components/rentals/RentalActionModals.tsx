import { useState } from 'react'
import { PackageCheck, RotateCcw } from 'lucide-react'
import { returnConditionMeta } from '../../config/rental'
import { rentalService } from '../../services/rentalService'
import { useUiStore } from '../../stores/uiStore'
import type { RentalDetail, RentalListItem, ReturnCondition } from '../../types'
import { Button, DatePicker, Input, Modal, Select, Textarea } from '../ui'

const todayDate = new Date().toISOString().slice(0, 10)

interface RentalProcessModalProps {
  rental: RentalListItem | RentalDetail
  onClose: () => void
  onSuccess: () => void
}

export function RentalProcessModal({ rental, onClose, onSuccess }: RentalProcessModalProps) {
  const addToast = useUiStore((state) => state.addToast)
  const [note, setNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const result = await rentalService.processRental(rental.id, note)
      addToast({
        tone: 'success',
        title: result.message,
        description: `${rental.rentalNumber} · ${rental.resourceName}`,
      })
      onSuccess()
      onClose()
    } catch {
      addToast({ tone: 'error', title: '대여 처리를 완료하지 못했습니다.', description: '현재 상태를 확인하고 다시 시도해주세요.' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="해당 자원의 대여 처리를 진행하시겠습니까?"
      description="확인하면 대여 신청 상태가 대여 중으로 변경됩니다."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>닫기</Button>
          <Button onClick={() => void handleProcess()} isLoading={isProcessing}>대여 처리</Button>
        </>
      }
    >
      <div className="rental-action-summary">
        <span><PackageCheck size={21} /></span>
        <div><strong>{rental.resourceName}</strong><p>{rental.rentalNumber} · {rental.userName}</p></div>
      </div>
      <div className="rental-action-fields">
        <Textarea label="대여 시 비고" value={note} onChange={(event) => setNote(event.target.value)} placeholder="인계한 구성품이나 확인 사항을 입력하세요." />
      </div>
    </Modal>
  )
}

export function RentalReturnModal({ rental, onClose, onSuccess }: RentalProcessModalProps) {
  const addToast = useUiStore((state) => state.addToast)
  const [returnedDate, setReturnedDate] = useState(todayDate)
  const [returnStatus, setReturnStatus] = useState<ReturnCondition | ''>('NORMAL')
  const [quantity, setQuantity] = useState(String(rental.quantity))
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    const nextErrors: Record<string, string> = {}
    const returnedQuantity = Number(quantity)
    if (!returnedDate) nextErrors.returnedDate = '실제 반납일을 선택해주세요.'
    if (!returnStatus) nextErrors.returnStatus = '반납 상태를 선택해주세요.'
    if (!Number.isInteger(returnedQuantity) || returnedQuantity < 0 || returnedQuantity > rental.quantity) {
      nextErrors.quantity = `반납 수량은 0~${rental.quantity}개 사이여야 합니다.`
    } else if (returnStatus === 'NORMAL' && returnedQuantity !== rental.quantity) {
      nextErrors.quantity = '정상 반납은 대여 수량과 같아야 합니다.'
    } else if (returnStatus === 'PARTIAL' && (returnedQuantity <= 0 || returnedQuantity >= rental.quantity)) {
      nextErrors.quantity = '일부 반납은 대여 수량보다 적어야 합니다.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsProcessing(true)
    try {
      const result = await rentalService.processReturn(rental.id, {
        returnedAt: `${returnedDate}T18:00:00+09:00`,
        returnStatus: returnStatus as ReturnCondition,
        returnedQuantity,
        returnNote: note.trim() || null,
      })
      addToast({
        tone: 'success',
        title: result.message,
        description: `${rental.rentalNumber} · ${rental.resourceName}`,
      })
      onSuccess()
      onClose()
    } catch {
      addToast({ tone: 'error', title: '반납 처리를 완료하지 못했습니다.', description: '입력 내용과 현재 상태를 확인해주세요.' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="자원 반납 처리"
      description="실제 반납일과 자원 상태를 기록하면 반납 완료로 변경됩니다."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>닫기</Button>
          <Button onClick={() => void handleProcess()} isLoading={isProcessing}>반납 완료</Button>
        </>
      }
    >
      <div className="rental-action-summary is-return">
        <span><RotateCcw size={21} /></span>
        <div><strong>{rental.resourceName}</strong><p>{rental.rentalNumber} · 대여 {rental.quantity}개</p></div>
      </div>
      <div className="rental-action-fields">
        <DatePicker label="실제 반납일" required value={returnedDate} onChange={(event) => setReturnedDate(event.target.value)} error={errors.returnedDate} />
        <Select
          label="반납 상태"
          required
          value={returnStatus}
          onChange={(event) => setReturnStatus(event.target.value as ReturnCondition)}
          error={errors.returnStatus}
          placeholder="반납 상태 선택"
          options={(Object.keys(returnConditionMeta) as ReturnCondition[]).map((key) => ({
            label: returnConditionMeta[key].label,
            value: key,
          }))}
        />
        <Input label="반납 수량" required type="number" min="0" max={rental.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} error={errors.quantity} />
        <Textarea label="반납 비고" value={note} onChange={(event) => setNote(event.target.value)} placeholder="파손, 분실 또는 구성품 확인 내용을 입력하세요." />
      </div>
    </Modal>
  )
}

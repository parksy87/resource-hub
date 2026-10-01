import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { inspectionResultMeta } from '../../config/inspection'
import { resourceStatusMeta } from '../../config/resource'
import { inspectionService } from '../../services/inspectionService'
import { useUiStore } from '../../stores/uiStore'
import type { InspectionDetail, InspectionListItem, InspectionResult } from '../../types'
import { resolveLinkedResourceStatus } from '../../utils/inspection'
import { Button, DatePicker, Modal, Select, Textarea } from '../ui'

const todayDate = new Date().toISOString().slice(0, 10)

interface InspectionCompleteModalProps {
  inspection: InspectionListItem | InspectionDetail
  onClose: () => void
  onSuccess: () => void
}

export function InspectionCompleteModal({ inspection, onClose, onSuccess }: InspectionCompleteModalProps) {
  const addToast = useUiStore((state) => state.addToast)
  const [inspectedDate, setInspectedDate] = useState(todayDate)
  const [result, setResult] = useState<InspectionResult | ''>('NORMAL')
  const [issueDescription, setIssueDescription] = useState('')
  const [actionDescription, setActionDescription] = useState('')
  const [note, setNote] = useState(inspection.note ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const handleComplete = async () => {
    const nextErrors: Record<string, string> = {}
    if (!inspectedDate) nextErrors.inspectedDate = '실제 점검일을 선택해주세요.'
    if (!result) nextErrors.result = '점검 결과를 선택해주세요.'
    if (result && result !== 'NORMAL' && !issueDescription.trim()) nextErrors.issueDescription = '이상 내용을 입력해 주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !result) return

    setIsProcessing(true)
    try {
      const response = await inspectionService.completeInspection(inspection.id, {
        inspectedDate,
        result,
        issueDescription: issueDescription.trim() || null,
        actionDescription: actionDescription.trim() || null,
        note: note.trim() || null,
      })
      const linked = resolveLinkedResourceStatus('COMPLETED', result)
      const linkedLabel = linked.pendingDisposal
        ? '폐기 검토 대상으로 등록됩니다.'
        : linked.resourceStatus
          ? `자원 상태는 ${resourceStatusMeta[linked.resourceStatus].label}으로 연계됩니다.`
          : undefined
      addToast({
        tone: 'success',
        title: response.message,
        description: linkedLabel ?? `${inspection.inspectionNumber} · ${inspection.resourceName}`,
      })
      onSuccess()
      onClose()
    } catch {
      addToast({ tone: 'error', title: '점검 완료 처리를 하지 못했습니다.', description: '현재 상태를 확인하고 다시 시도해주세요.' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="점검 완료 처리"
      description="실제 점검일과 결과를 기록하면 점검 완료로 변경됩니다."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>닫기</Button>
          <Button onClick={() => void handleComplete()} isLoading={isProcessing}>점검 완료</Button>
        </>
      }
    >
      <div className="inspection-action-summary">
        <span><ClipboardCheck size={21} /></span>
        <div><strong>{inspection.resourceName}</strong><p>{inspection.inspectionNumber} · {inspection.inspectorName}</p></div>
      </div>
      <div className="inspection-action-fields">
        <DatePicker label="실제 점검일" required value={inspectedDate} onChange={(event) => setInspectedDate(event.target.value)} error={errors.inspectedDate} />
        <Select
          label="점검 결과"
          required
          value={result}
          onChange={(event) => setResult(event.target.value as InspectionResult)}
          error={errors.result}
          placeholder="점검 결과 선택"
          options={(Object.keys(inspectionResultMeta) as InspectionResult[]).map((key) => ({
            label: inspectionResultMeta[key].label,
            value: key,
          }))}
        />
        <Textarea label="이상 내용" value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)} error={errors.issueDescription} placeholder="확인된 이상 내용을 입력하세요. 이상 없음이면 비워둘 수 있습니다." />
        <Textarea label="조치 내용" value={actionDescription} onChange={(event) => setActionDescription(event.target.value)} placeholder="조치했거나 예정된 내용을 입력하세요." />
        <Textarea label="관리자 메모" value={note} onChange={(event) => setNote(event.target.value)} placeholder="관리자만 참고할 내용을 입력하세요." />
      </div>
    </Modal>
  )
}

import { useState, type FormEvent } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { inspectionTypeMeta } from '../../config/inspection'
import { useInspectionOptions } from '../../hooks/useInspections'
import type { InspectionFormValues, InspectionPayload, InspectionType } from '../../types'
import { Button, Card, DatePicker, Loading, Select, Textarea } from '../ui'

interface InspectionFormProps {
  mode: 'create' | 'edit'
  initialValues: InspectionFormValues
  lockResource?: boolean
  parentNumber?: string | null
  isSubmitting: boolean
  onSubmit: (payload: InspectionPayload) => Promise<void>
  onCancel: () => void
  onList?: () => void
}

export function InspectionForm({
  mode,
  initialValues,
  lockResource = false,
  parentNumber,
  isSubmitting,
  onSubmit,
  onCancel,
  onList,
}: InspectionFormProps) {
  const { data: options, status } = useInspectionOptions()
  const [values, setValues] = useState<InspectionFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof InspectionFormValues, string>>>({})

  const setField = <K extends keyof InspectionFormValues,>(key: K, value: InspectionFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<keyof InspectionFormValues, string>> = {}
    if (!values.resourceId) next.resourceId = '자원을 선택해주세요.'
    if (!values.type) next.type = '점검 유형을 선택해주세요.'
    if (!values.scheduledDate) next.scheduledDate = '점검 예정일을 선택해주세요.'
    if (!values.inspectorId) next.inspectorId = '점검 담당자를 선택해주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate() || !values.type) return
    void onSubmit({
      resourceId: Number(values.resourceId),
      type: values.type,
      scheduledDate: values.scheduledDate,
      inspectorId: Number(values.inspectorId),
      content: values.content.trim() || null,
      note: values.note.trim() || null,
      rentalId: values.type === 'RETURN' && values.rentalId ? Number(values.rentalId) : null,
    })
  }

  if (status === 'loading') {
    return <Card><Loading size="lg" label="입력 항목을 준비하는 중입니다" /></Card>
  }

  const rentals = (options?.rentals ?? []).filter((item) => !values.resourceId || item.resourceId === Number(values.resourceId))

  return (
    <form className="inspection-form" onSubmit={handleSubmit} noValidate>
      {parentNumber && (
        <p className="inspection-parent-note">상위 점검 {parentNumber}을 참고해 재점검을 등록합니다. 새 점검 상태는 점검 예정입니다.</p>
      )}
      <Card title="점검 정보" description="자원과 점검 일정을 등록합니다. 필수 항목을 입력해주세요.">
        <div className="inspection-form-grid">
          <Select
            label="자원"
            required
            disabled={mode === 'edit' || lockResource}
            value={values.resourceId}
            onChange={(event) => {
              setField('resourceId', event.target.value)
              setField('rentalId', '')
            }}
            error={errors.resourceId}
            placeholder="자원 선택"
            options={(options?.resources ?? []).map((item) => ({
              label: `${item.name} (${item.resourceCode})`,
              value: String(item.id),
            }))}
          />
          <Select
            label="점검 유형"
            required
            value={values.type}
            onChange={(event) => setField('type', event.target.value as InspectionType)}
            error={errors.type}
            placeholder="점검 유형 선택"
            options={(Object.keys(inspectionTypeMeta) as InspectionType[]).map((key) => ({
              label: inspectionTypeMeta[key].label,
              value: key,
            }))}
          />
          <DatePicker
            label="점검 예정일"
            required
            value={values.scheduledDate}
            onChange={(event) => setField('scheduledDate', event.target.value)}
            error={errors.scheduledDate}
          />
          <Select
            label="점검 담당자"
            required
            value={values.inspectorId}
            onChange={(event) => setField('inspectorId', event.target.value)}
            error={errors.inspectorId}
            placeholder="담당자 선택"
            options={(options?.managers ?? []).map((item) => ({
              label: `${item.name} · ${item.department}`,
              value: String(item.id),
            }))}
          />
          {values.type === 'RETURN' && (
            <Select
              label="연결 대여"
              value={values.rentalId}
              disabled={lockResource}
              onChange={(event) => setField('rentalId', event.target.value)}
              placeholder="반납 대여 선택"
              hint="반납점검인 경우 대여 건을 연결할 수 있습니다."
              options={rentals.map((item) => ({ label: item.rentalNumber, value: String(item.id) }))}
            />
          )}
          <div className="inspection-form-grid__wide">
            <Textarea label="점검 내용" value={values.content} onChange={(event) => setField('content', event.target.value)} placeholder="점검 목적과 확인 항목을 입력하세요." />
          </div>
          <div className="inspection-form-grid__wide">
            <Textarea label="관리자 메모" value={values.note} onChange={(event) => setField('note', event.target.value)} placeholder="관리자만 참고할 내용을 입력하세요." />
          </div>
        </div>
      </Card>
      <div className="resource-form-actions">
        <div>
          {onList && <Button type="button" variant="ghost" leadingIcon={<ArrowLeft size={16} />} onClick={onList}>목록</Button>}
        </div>
        <div>
          <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
          <Button type="submit" leadingIcon={<Save size={16} />} isLoading={isSubmitting}>{mode === 'create' ? '등록' : '수정'}</Button>
        </div>
      </div>
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import {
  Button,
  Card,
  DatePicker,
  FileUpload,
  Input,
  Loading,
  Select,
  Textarea,
} from '../ui'
import { useResourceOptions } from '../../hooks/useResources'
import type {
  ResourceFormErrors,
  ResourceFormValues,
  ResourcePayload,
  ResourceStatus,
} from '../../types'
import { resourceStatusMeta } from '../../config/resource'
import { resourceFormToPayload } from '../../utils/resourceForm'

interface ResourceFormProps {
  mode: 'create' | 'edit'
  initialValues: ResourceFormValues
  isSubmitting: boolean
  onSubmit: (payload: ResourcePayload) => Promise<void>
  onCancel: () => void
  onList?: () => void
}

export function ResourceForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
  onList,
}: ResourceFormProps) {
  const { data: options, status: optionsStatus } = useResourceOptions()
  const [values, setValues] = useState<ResourceFormValues>(initialValues)
  const [errors, setErrors] = useState<ResourceFormErrors>({})

  const setField = <K extends keyof ResourceFormValues,>(key: K, value: ResourceFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const next: ResourceFormErrors = {}
    if (!values.name.trim()) next.name = '자원명을 입력해 주세요.'
    if (!values.resourceCode.trim()) next.resourceCode = '자원 코드를 입력해 주세요.'
    if (!values.categoryId) next.categoryId = '자원 분류를 선택해주세요.'
    if (!values.type) next.type = '자원 유형을 선택해주세요.'
    if (!values.location) next.location = '보관 위치를 선택해주세요.'
    if (!values.managerId) next.managerId = '담당자를 선택해주세요.'
    if (!values.quantity || Number(values.quantity) < 1) next.quantity = '수량은 1개 이상이어야 합니다.'
    if (!values.status) next.status = '자원 상태를 선택해주세요.'
    if (
      values.purchaseDate &&
      values.managementEndDate &&
      values.managementEndDate < values.purchaseDate
    ) {
      next.managementEndDate = '관리 종료일은 구입일 이후여야 합니다.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    void onSubmit(resourceFormToPayload(values))
  }

  if (optionsStatus === 'loading') {
    return <Card><Loading size="lg" label="입력 항목을 준비하는 중입니다" /></Card>
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit} noValidate>
      <Card title="기본 정보">
        <div className="resource-form-grid">
          <Input
            label="자원명"
            required
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors.name}
            placeholder="예: MacBook Pro 14″ M4"
          />
          <Input
            label="자원 코드"
            required
            value={values.resourceCode}
            onChange={(event) => setField('resourceCode', event.target.value.toUpperCase())}
            error={errors.resourceCode}
            hint="영문, 숫자와 하이픈 조합을 권장합니다."
            placeholder="예: NB-2026-0143"
          />
          <Select
            label="자원 분류"
            required
            value={values.categoryId}
            onChange={(event) => {
              setField('categoryId', event.target.value)
              setField('type', '')
            }}
            error={errors.categoryId}
            placeholder="분류 선택"
            options={(options?.categories ?? []).map((item) => ({ label: item.name, value: String(item.id) }))}
          />
          <Select
            label="자원 유형"
            required
            value={values.type}
            onChange={(event) => setField('type', event.target.value)}
            error={errors.type}
            placeholder="유형 선택"
            options={(options?.types ?? [])
              .filter((item) => !values.categoryId || item.categoryId === Number(values.categoryId))
              .map((item) => ({ label: item.name, value: item.code }))}
          />
          <Select
            label="보관 위치"
            required
            value={values.location}
            onChange={(event) => setField('location', event.target.value)}
            error={errors.location}
            placeholder="위치 선택"
            options={(options?.locations ?? []).map((item) => ({ label: item, value: item }))}
          />
          <Select
            label="담당자"
            required
            value={values.managerId}
            onChange={(event) => setField('managerId', event.target.value)}
            error={errors.managerId}
            placeholder="담당자 선택"
            options={(options?.managers ?? []).map((item) => ({
              label: `${item.name} · ${item.department}`,
              value: String(item.id),
            }))}
          />
          <Input
            label="수량"
            required
            type="number"
            min="1"
            value={values.quantity}
            onChange={(event) => setField('quantity', event.target.value)}
            error={errors.quantity}
          />
          <Select
            label="상태"
            required
            value={values.status}
            onChange={(event) => setField('status', event.target.value as ResourceStatus)}
            error={errors.status}
            placeholder="상태 선택"
            options={(Object.keys(resourceStatusMeta) as ResourceStatus[]).map((key) => ({
              label: resourceStatusMeta[key].label,
              value: key,
            }))}
          />
        </div>
      </Card>

      <Card title="관리 정보" description="구입일과 관리 기간을 기록합니다.">
        <div className="resource-form-grid resource-form-grid--dates">
          <DatePicker
            label="구입일"
            value={values.purchaseDate}
            onChange={(event) => setField('purchaseDate', event.target.value)}
          />
          <DatePicker
            label="관리 종료일"
            value={values.managementEndDate}
            onChange={(event) => setField('managementEndDate', event.target.value)}
            error={errors.managementEndDate}
            hint="비워두면 관리 종료일을 지정하지 않습니다."
          />
        </div>
      </Card>

      <Card title="상세 정보">
        <div className="resource-form-grid">
          <div className="resource-form-grid__wide">
            <Textarea
              label="설명"
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="자원의 특징과 이용 시 주의사항을 입력하세요."
            />
          </div>
          <div className="resource-form-grid__wide">
            <Textarea
              label="비고"
              value={values.notes}
              onChange={(event) => setField('notes', event.target.value)}
              placeholder="관리자만 참고할 내용을 입력하세요."
            />
          </div>
        </div>
      </Card>

      <Card title="자원 이미지" description="대표 이미지는 한 장만 등록할 수 있습니다.">
        {values.imageUrl && (
          <div className="resource-form-image-preview">
            <img src={values.imageUrl} alt="선택된 자원 미리보기" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setField('imageUrl', '')}>이미지 제거</Button>
          </div>
        )}
        <FileUpload
          label={values.imageUrl ? '이미지 변경' : '이미지 첨부'}
          onChange={(files) => {
            const file = files[0]
            if (file) setField('imageUrl', URL.createObjectURL(file))
          }}
        />
      </Card>

      <div className="resource-form-actions">
        <div>
          {onList && <Button type="button" variant="ghost" leadingIcon={<ArrowLeft size={16} />} onClick={onList}>목록</Button>}
        </div>
        <div>
          <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
          <Button type="submit" leadingIcon={<Save size={16} />} isLoading={isSubmitting}>
            {mode === 'create' ? '등록' : '수정'}
          </Button>
        </div>
      </div>
    </form>
  )
}

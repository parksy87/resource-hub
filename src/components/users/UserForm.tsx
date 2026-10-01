import { useState, type FormEvent } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { userRoleMeta, userStatusMeta } from '../../config/user'
import type { UserFormValues, UserPayload, UserRole, UserStatus } from '../../types'
import { isValidEmail, isValidPhone } from '../../utils/user'
import { Button, Card, Input, Select, Textarea } from '../ui'

interface UserFormProps {
  initialValues: UserFormValues
  isSubmitting: boolean
  onSubmit: (payload: UserPayload) => Promise<void>
  onCancel: () => void
}

const roleOptions: { label: string; value: UserRole }[] = [
  { label: userRoleMeta.USER.label, value: 'USER' },
  { label: userRoleMeta.ADMIN.label, value: 'ADMIN' },
  { label: userRoleMeta.MANAGER.label, value: 'MANAGER' },
]

export function UserForm({ initialValues, isSubmitting, onSubmit, onCancel }: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})
  const keepsManagerRole = values.role === 'MANAGER' || initialValues.role === 'MANAGER'
  const visibleRoles = roleOptions.filter((option) => {
    if (option.value === 'MANAGER') return keepsManagerRole
    if (option.value === 'ADMIN') return !keepsManagerRole
    return true
  })

  const setField = <K extends keyof UserFormValues,>(key: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<keyof UserFormValues, string>> = {}
    if (!values.name.trim()) next.name = '이름을 입력해 주세요.'
    if (!values.email.trim()) next.email = '이메일을 입력해 주세요.'
    else if (!isValidEmail(values.email)) next.email = '이메일 형식을 확인해 주세요.'
    if (!values.phone.trim()) next.phone = '전화번호를 입력해 주세요.'
    else if (!isValidPhone(values.phone)) next.phone = '010-0000-0000 형식으로 입력해 주세요.'
    if (!values.role) next.role = '사용자 유형을 선택해주세요.'
    if (!values.status) next.status = '상태를 선택해주세요.'
    if (values.status === 'SUSPENDED' && initialValues.status !== 'SUSPENDED' && !values.statusReason.trim()) {
      next.statusReason = '이용정지 사유를 입력해 주세요.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    void onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      organization: values.organization.trim(),
      role: values.role,
      status: values.status,
      statusReason: values.statusReason.trim() || null,
    })
  }

  return (
    <form className="user-form" onSubmit={handleSubmit} noValidate>
      <Card title="기본 정보" description="이름, 연락처, 소속과 이용 권한을 수정합니다.">
        <div className="user-form-grid">
          <Input label="이름" required value={values.name} error={errors.name} onChange={(event) => setField('name', event.target.value)} />
          <Input label="이메일" type="email" required value={values.email} error={errors.email} hint="name@company.com" onChange={(event) => setField('email', event.target.value)} />
          <Input label="전화번호" type="tel" required value={values.phone} error={errors.phone} hint="010-0000-0000" onChange={(event) => setField('phone', event.target.value)} />
          <Input label="소속" value={values.organization} onChange={(event) => setField('organization', event.target.value)} />
          <Select
            label="사용자 유형"
            required
            value={values.role}
            error={errors.role}
            onChange={(event) => setField('role', event.target.value as UserRole)}
            options={visibleRoles.map((option) => ({ label: option.label, value: option.value }))}
          />
          <Select
            label="상태"
            required
            value={values.status}
            error={errors.status}
            onChange={(event) => setField('status', event.target.value as UserStatus)}
            options={(Object.keys(userStatusMeta) as UserStatus[]).map((key) => ({ label: userStatusMeta[key].label, value: key }))}
          />
          {values.status === 'SUSPENDED' && initialValues.status !== 'SUSPENDED' && (
            <div className="user-form-grid__wide">
              <Textarea
                label="정지 사유"
                required
                value={values.statusReason}
                error={errors.statusReason}
                onChange={(event) => setField('statusReason', event.target.value)}
                placeholder="이용을 제한하는 사유를 입력하세요."
              />
            </div>
          )}
        </div>
      </Card>
      <div className="resource-form-actions">
        <Button type="button" variant="ghost" leadingIcon={<ArrowLeft size={16} />} onClick={onCancel}>취소</Button>
        <Button type="submit" leadingIcon={<Save size={16} />} isLoading={isSubmitting}>저장</Button>
      </div>
    </form>
  )
}

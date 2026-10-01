import type {
  NotificationSettings,
  OperationSettings,
  RentalSettings,
  ReservationSettings,
  SystemSettings,
} from '../../types'
import type { SettingsFieldErrors } from '../../utils/settings'
import { Input, Radio, Select, Textarea } from '../ui'
import { SettingsToggle } from './SettingsToggle'

type FieldErrors = SettingsFieldErrors

const pageSizeOptions = [
  { label: '10건', value: '10' },
  { label: '20건', value: '20' },
  { label: '50건', value: '50' },
]

const windowOptions = [
  { label: '당일', value: 'SAME_DAY' },
  { label: '7일', value: '7D' },
  { label: '30일', value: '30D' },
  { label: '90일', value: '90D' },
]

function numberValue(value: number) {
  return Number.isNaN(value) ? '' : String(value)
}

function readNumber(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value)
}

interface BasicProps {
  values: SystemSettings
  errors: FieldErrors
  onChange: (partial: Partial<SystemSettings>) => void
}

export function BasicSettingsForm({ values, errors, onChange }: BasicProps) {
  return (
    <div className="settings-grid">
      <Input id="systemName" label="시스템명" required value={values.systemName} error={errors.systemName} onChange={(event) => onChange({ systemName: event.target.value })} />
      <Input id="adminEmail" label="관리자 이메일" type="email" required value={values.adminEmail} error={errors.adminEmail} onChange={(event) => onChange({ adminEmail: event.target.value })} />
      <Input id="phone" label="대표 연락처" type="tel" required hint="010-0000-0000" value={values.phone} error={errors.phone} onChange={(event) => onChange({ phone: event.target.value })} />
      <Input id="organizationName" label="운영기관명" required value={values.organizationName} error={errors.organizationName} onChange={(event) => onChange({ organizationName: event.target.value })} />
      <div className="settings-span">
        <Textarea id="description" label="시스템 설명" rows={4} value={values.description} onChange={(event) => onChange({ description: event.target.value })} />
      </div>
      <Select
        id="pageSize"
        label="기본 페이지 표시 건수"
        required
        value={String(values.pageSize)}
        error={errors.pageSize}
        options={pageSizeOptions}
        onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
      />
    </div>
  )
}

interface ReservationProps {
  values: ReservationSettings
  errors: FieldErrors
  onChange: (partial: Partial<ReservationSettings>) => void
}

export function ReservationSettingsForm({ values, errors, onChange }: ReservationProps) {
  return (
    <div className="settings-stack">
      <SettingsToggle label="예약 사용 여부" description="끄면 새 예약 신청을 받지 않는 정책입니다." checked={values.enabled} onChange={(enabled) => onChange({ enabled })} />
      <fieldset className="settings-radios">
        <legend>예약 승인 방식</legend>
        <Radio name="approvalMode" label="자동 승인" checked={values.approvalMode === 'AUTO'} onChange={() => onChange({ approvalMode: 'AUTO' })} />
        <Radio name="approvalMode" label="관리자 승인" checked={values.approvalMode === 'MANUAL'} onChange={() => onChange({ approvalMode: 'MANUAL' })} />
      </fieldset>
      <div className="settings-grid">
        <Select id="reservationWindow" label="예약 가능 기간" value={values.window} options={windowOptions} onChange={(event) => onChange({ window: event.target.value as ReservationSettings['window'] })} />
        <Input id="maxCount" label="최대 예약 가능 건수" type="number" min={1} step={1} required value={numberValue(values.maxCount)} error={errors.maxCount} onChange={(event) => onChange({ maxCount: readNumber(event.target.value) })} />
        <Input id="cancelBeforeHours" label="이용 시작 전 취소 가능 시간" type="number" min={0} step={1} hint="시간 단위" disabled={!values.cancelEnabled} value={numberValue(values.cancelBeforeHours)} error={errors.cancelBeforeHours} onChange={(event) => onChange({ cancelBeforeHours: readNumber(event.target.value) })} />
      </div>
      <SettingsToggle label="예약 취소 가능 여부" checked={values.cancelEnabled} onChange={(cancelEnabled) => onChange({ cancelEnabled })} />
      <SettingsToggle label="중복 예약 허용 여부" description="같은 자원의 시간이 겹치는 예약을 허용합니다." checked={values.allowOverlap} onChange={(allowOverlap) => onChange({ allowOverlap })} />
    </div>
  )
}

interface RentalProps {
  values: RentalSettings
  errors: FieldErrors
  onChange: (partial: Partial<RentalSettings>) => void
}

export function RentalSettingsForm({ values, errors, onChange }: RentalProps) {
  return (
    <div className="settings-stack">
      <SettingsToggle label="대여 사용 여부" checked={values.enabled} onChange={(enabled) => onChange({ enabled })} />
      <div className="settings-grid">
        <Input id="defaultDays" label="기본 대여 기간" type="number" min={1} step={1} required hint="일 단위" value={numberValue(values.defaultDays)} error={errors.defaultDays} onChange={(event) => onChange({ defaultDays: readNumber(event.target.value) })} />
        <Input id="maxExtensions" label="최대 대여 연장 횟수" type="number" min={0} step={1} required value={numberValue(values.maxExtensions)} error={errors.maxExtensions} onChange={(event) => onChange({ maxExtensions: readNumber(event.target.value) })} />
        <Input id="overdueNoticeHours" label="연체 알림 기준" type="number" min={0} step={1} hint="반납 예정 시각 이후 시간" disabled={!values.overdueEnabled} value={numberValue(values.overdueNoticeHours)} error={errors.overdueNoticeHours} onChange={(event) => onChange({ overdueNoticeHours: readNumber(event.target.value) })} />
      </div>
      <SettingsToggle label="연체 사용 여부" checked={values.overdueEnabled} onChange={(overdueEnabled) => onChange({ overdueEnabled })} />
      <SettingsToggle label="반납 승인 필요 여부" checked={values.returnApprovalRequired} onChange={(returnApprovalRequired) => onChange({ returnApprovalRequired })} />
      <SettingsToggle label="반납 후 자동 점검 여부" checked={values.autoInspectionAfterReturn} onChange={(autoInspectionAfterReturn) => onChange({ autoInspectionAfterReturn })} />
    </div>
  )
}

const notificationItems: { key: keyof NotificationSettings; label: string }[] = [
  { key: 'reservationRequested', label: '예약 신청 알림' },
  { key: 'reservationApproved', label: '예약 승인 알림' },
  { key: 'reservationRejected', label: '예약 반려 알림' },
  { key: 'reservationCancelled', label: '예약 취소 알림' },
  { key: 'rentalStarted', label: '대여 시작 알림' },
  { key: 'returnDue', label: '반납 예정 알림' },
  { key: 'overdue', label: '연체 알림' },
  { key: 'inspectionCompleted', label: '점검 완료 알림' },
]

interface NotificationProps {
  values: NotificationSettings
  onChange: (partial: Partial<NotificationSettings>) => void
}

export function NotificationSettingsForm({ values, onChange }: NotificationProps) {
  return (
    <div className="settings-stack">
      <div className="settings-toggle-list">
        {notificationItems.map((item) => (
          <SettingsToggle
            key={item.key}
            label={item.label}
            checked={values[item.key]}
            onChange={(checked) => onChange({ [item.key]: checked })}
          />
        ))}
      </div>
      <div className="settings-channel">
        <h4>알림 채널</h4>
        <p>이메일과 SMS는 사용 여부만 저장되며 알림은 발송되지 않습니다.</p>
        <SettingsToggle label="이메일 알림 사용 여부" checked={values.emailEnabled} onChange={(emailEnabled) => onChange({ emailEnabled })} />
        <SettingsToggle label="SMS 알림 사용 여부" checked={values.smsEnabled} onChange={(smsEnabled) => onChange({ smsEnabled })} />
        <SettingsToggle label="시스템 알림 사용 여부" checked={values.systemEnabled} onChange={(systemEnabled) => onChange({ systemEnabled })} />
      </div>
    </div>
  )
}

interface OperationProps {
  values: OperationSettings
  errors: FieldErrors
  onChange: (partial: Partial<OperationSettings>) => void
}

export function OperationSettingsForm({ values, errors, onChange }: OperationProps) {
  return (
    <div className="settings-stack">
      <SettingsToggle label="시스템 운영 여부" checked={values.operating} onChange={(operating) => onChange({ operating })} />
      <SettingsToggle label="점검 모드 사용 여부" description="켜면 사용자에게 표시할 안내문을 입력합니다." checked={values.maintenanceMode} onChange={(maintenanceMode) => onChange({ maintenanceMode })} />
      {values.maintenanceMode && (
        <Textarea
          id="maintenanceMessage"
          label="점검 안내문"
          required
          rows={4}
          value={values.maintenanceMessage}
          error={errors.maintenanceMessage}
          onChange={(event) => onChange({ maintenanceMessage: event.target.value })}
        />
      )}
      <SettingsToggle label="신규 회원가입 허용" checked={values.signupAllowed} onChange={(signupAllowed) => onChange({ signupAllowed })} />
      <SettingsToggle label="사용자 예약 허용" checked={values.userReservationAllowed} onChange={(userReservationAllowed) => onChange({ userReservationAllowed })} />
      <SettingsToggle label="사용자 대여 신청 허용" checked={values.userRentalAllowed} onChange={(userRentalAllowed) => onChange({ userRentalAllowed })} />
      <SettingsToggle label="관리자만 자원 등록 가능 여부" checked={values.adminOnlyResourceCreate} onChange={(adminOnlyResourceCreate) => onChange({ adminOnlyResourceCreate })} />
      <SettingsToggle label="개인정보 표시 제한 여부" checked={values.maskPersonalInfo} onChange={(maskPersonalInfo) => onChange({ maskPersonalInfo })} />
    </div>
  )
}

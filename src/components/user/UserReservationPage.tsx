import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { reservationStatusMeta } from '../../config/reservation'
import {
  availabilityLabel,
  reservationSteps,
  reservationTimeOptions,
  reservationToday,
} from '../../config/userReservation'
import { reserveBlockedReason, userStatusMeta } from '../../config/userResource'
import { ROUTES } from '../../routes/paths'
import { reservationService } from '../../services/reservationService'
import { resourceService } from '../../services/resourceService'
import { useUserSessionStore } from '../../stores/userSessionStore'
import type {
  AsyncStatus,
  ReservationApplicant,
  ReservationAvailability,
  ReservationCreateResult,
  ReservationForm,
  ReservationFormErrors,
  ResourceDetail,
} from '../../types'
import {
  formatReservationWhen,
  hasReservationErrors,
  reservationRangeError,
  toReservationDateTime,
  toReservationRequest,
  validateReservationForm,
} from '../../utils/reservationForm'
import { Badge, Button, Checkbox, DatePicker, ErrorState, Input, Loading, Modal, Select, Textarea } from '../ui'
import { userLoginPath } from '../../utils/authNavigation'
import { ResourceVisual } from './resources/ResourceCard'

const emptyForm: ReservationForm = {
  schedule: { startDate: '', startTime: '', endDate: '', endTime: '' },
  purpose: '',
  usageLocation: '',
  attendeeCount: '',
  requestNote: '',
  agreement: { usageGuide: false, privacy: false, notifications: false },
}

function ReservationGate() {
  const location = useLocation()
  return (
    <section className="user-reservation-gate">
      <p>RESERVATION</p>
      <h2>예약 신청</h2>
      <p>예약 신청은 로그인 후 이용할 수 있습니다.</p>
      <div>
        <Link className="ui-button ui-button--primary ui-button--md" to={userLoginPath(location.pathname)}>로그인</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.resources}>자원 목록으로</Link>
      </div>
    </section>
  )
}

function ReservationComplete({ result }: { result: ReservationCreateResult }) {
  const status = reservationStatusMeta[result.status]
  return (
    <section className="user-reservation-complete">
      <CheckCircle2 size={42} aria-hidden="true" />
      <h2>예약 신청이 완료되었습니다.</h2>
      <dl>
        <div><dt>예약번호</dt><dd>{result.reservationNumber}</dd></div>
        <div><dt>자원명</dt><dd>{result.resourceName}</dd></div>
        <div><dt>예약 일정</dt><dd>{formatReservationWhen(result.startAt)} – {formatReservationWhen(result.endAt)}</dd></div>
        <div><dt>예약 상태</dt><dd><Badge tone={status.tone}>{status.label}</Badge></dd></div>
      </dl>
      <div>
        <Link className="ui-button ui-button--primary ui-button--md" to={ROUTES.user.reservationHistory}>예약 내역 보기</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.home}>홈으로 이동</Link>
      </div>
    </section>
  )
}

export function UserReservationPage() {
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)
  if (!isLoggedIn) return <ReservationGate />
  return <ReservationEditor />
}

function ReservationEditor() {
  const [params] = useSearchParams()
  const rawId = params.get('resourceId')?.trim() ?? ''
  const resourceId = rawId.length > 0 ? rawId : null
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [resourceStatus, setResourceStatus] = useState<AsyncStatus | 'missing'>(resourceId == null ? 'idle' : 'loading')
  const [resourceAttempt, setResourceAttempt] = useState(0)
  const [applicant, setApplicant] = useState<ReservationApplicant | null>(null)
  const [form, setForm] = useState<ReservationForm>(emptyForm)
  const [errors, setErrors] = useState<ReservationFormErrors>({})
  const [submitAttempt, setSubmitAttempt] = useState(0)
  const [checked, setChecked] = useState<ReservationAvailability | null>(null)
  const [checkedKey, setCheckedKey] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [phase, setPhase] = useState<'editing' | 'submitting' | 'success' | 'error'>('editing')
  const [result, setResult] = useState<ReservationCreateResult | null>(null)

  useEffect(() => {
    if (resourceId == null) return undefined
    let active = true
    void resourceService.getResource(resourceId).then((item) => {
      if (!active) return
      setResource(item)
      setResourceStatus(item ? 'success' : 'missing')
    }).catch(() => {
      if (active) setResourceStatus('error')
    })
    return () => {
      active = false
    }
  }, [resourceId, resourceAttempt])

  useEffect(() => {
    let active = true
    void reservationService.getApplicant().then((item) => {
      if (active) setApplicant(item)
    }).catch(() => {
      if (active) setApplicant(null)
    })
    return () => {
      active = false
    }
  }, [])

  const selected = resource?.status === 'AVAILABLE' ? resource : null
  const rangeError = reservationRangeError(form.schedule)
  const scheduleReady = Boolean(
    selected &&
    form.schedule.startDate &&
    form.schedule.startTime &&
    form.schedule.endDate &&
    form.schedule.endTime &&
    !rangeError &&
    form.schedule.startDate >= reservationToday &&
    form.schedule.endDate >= reservationToday,
  )
  const scheduleKey = scheduleReady && selected
    ? `${selected.id}|${toReservationDateTime(form.schedule.startDate, form.schedule.startTime)}|${toReservationDateTime(form.schedule.endDate, form.schedule.endTime)}`
    : ''

  useEffect(() => {
    if (!scheduleKey || !selected) return undefined
    let active = true
    void reservationService.checkReservationAvailability({
      resourceId: selected.id,
      startAt: toReservationDateTime(form.schedule.startDate, form.schedule.startTime),
      endAt: toReservationDateTime(form.schedule.endDate, form.schedule.endTime),
    }).then((item) => {
      if (!active) return
      setChecked(item)
      setCheckedKey(scheduleKey)
    }).catch(() => {
      if (!active) return
      setChecked({ status: 'pending', message: '예약 가능 여부를 확인하지 못했습니다. 다시 선택해 주세요.' })
      setCheckedKey(scheduleKey)
    })
    return () => {
      active = false
    }
  }, [scheduleKey, selected, form.schedule.startDate, form.schedule.startTime, form.schedule.endDate, form.schedule.endTime])

  useEffect(() => {
    if (!submitAttempt || !hasReservationErrors(errors)) return
    const invalid = document.querySelector<HTMLElement>('.user-reservation [aria-invalid="true"]')
    if (invalid) {
      invalid.focus()
      return
    }
    document.getElementById('reservation-resource-action')?.focus()
  }, [submitAttempt, errors])

  const availability: ReservationAvailability = !resource
    ? { status: 'pending', message: '자원을 선택하면 예약 가능 여부를 확인할 수 있습니다.' }
    : resource.status !== 'AVAILABLE'
      ? { status: 'unavailable', message: reserveBlockedReason[resource.status] }
      : !scheduleReady
        ? { status: 'pending', message: rangeError ?? '예약 일정을 모두 입력하면 가능 여부를 확인합니다.' }
        : checkedKey === scheduleKey && checked
          ? checked
          : { status: 'pending', message: '예약 가능 여부를 확인하고 있습니다.' }

  const agreementsReady = form.agreement.usageGuide && form.agreement.privacy
  const stepDone = [
    Boolean(selected),
    availability.status === 'available',
    Boolean(applicant),
    Boolean(form.purpose.trim() && form.usageLocation.trim() && Number(form.attendeeCount) >= 1 && Number.isInteger(Number(form.attendeeCount))),
    agreementsReady && availability.status === 'available',
    false,
  ]
  const currentStep = stepDone.findIndex((done) => !done) + 1

  function patchSchedule(partial: Partial<ReservationForm['schedule']>) {
    setForm((current) => ({ ...current, schedule: { ...current.schedule, ...partial } }))
    setErrors((current) => ({ ...current, startDate: undefined, startTime: undefined, endDate: undefined, endTime: undefined, schedule: undefined }))
  }

  function onApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const availabilityMessage = availability.status === 'available'
      ? null
      : availability.message
    const nextErrors = validateReservationForm({
      form,
      resourceStatus: selected ? 'AVAILABLE' : resource?.status ?? null,
      availabilityMessage: availability.status === 'unavailable' || (scheduleReady && availability.status === 'pending')
        ? availabilityMessage
        : null,
    })
    setErrors(nextErrors)
    setSubmitAttempt((value) => value + 1)
    if (hasReservationErrors(nextErrors)) return
    setConfirmOpen(true)
  }

  async function onConfirm() {
    if (!selected || !applicant) return
    setPhase('submitting')
    try {
      const created = await reservationService.createReservation(
        toReservationRequest(form, selected.id, applicant.userId),
      )
      setResult(created)
      setPhase('success')
      setConfirmOpen(false)
    } catch {
      setPhase('error')
      setConfirmOpen(false)
    }
  }

  if (phase === 'success' && result) return <ReservationComplete result={result} />

  const scheduleText = form.schedule.startDate && form.schedule.startTime
    ? `${form.schedule.startDate.replaceAll('-', '.')} ${form.schedule.startTime}`
    : '-'
  const endText = form.schedule.endDate && form.schedule.endTime
    ? `${form.schedule.endDate.replaceAll('-', '.')} ${form.schedule.endTime}`
    : '-'

  return (
    <form className="user-reservation" noValidate onSubmit={onApply}>
      <header className="user-reservation-heading">
        <p>RESERVATION</p>
        <h2>예약 신청</h2>
        <p>자원과 일정을 확인한 뒤 예약 정보를 입력해 신청합니다.</p>
      </header>
      <ol className="user-reservation-steps">
        {reservationSteps.map((step, index) => (
          <li key={step.id} aria-current={currentStep === step.id ? 'step' : undefined} data-done={stepDone[index] ? 'true' : 'false'}>
            <span>{step.id}</span>
            {step.label}
          </li>
        ))}
      </ol>
      {phase === 'error' && (
        <ErrorState
          title="예약 신청에 실패했습니다."
          description="입력 내용을 확인한 뒤 다시 신청해 주세요."
          actionLabel="다시 입력"
          onAction={() => setPhase('editing')}
        />
      )}
      <div className="user-reservation-layout">
        <div className="user-reservation-main">
          <section>
            <h3>1. 예약 자원 선택</h3>
            {resourceStatus === 'loading' && <Loading label="자원 정보를 불러오는 중입니다" />}
            {resourceStatus === 'error' && (
              <ErrorState title="자원 정보를 불러오지 못했습니다" actionLabel="다시 시도" onAction={() => {
                setResourceStatus('loading')
                setResourceAttempt((value) => value + 1)
              }} />
            )}
            {resourceStatus === 'missing' && (
              <ErrorState title="자원을 찾을 수 없습니다." description="자원 목록에서 다시 선택해 주세요." />
            )}
            {resourceStatus === 'idle' && (
              <div className="user-reservation-resource">
                <p>예약할 자원을 선택해 주세요.</p>
                <Link id="reservation-resource-action" className="ui-button ui-button--outline ui-button--sm" to={ROUTES.user.resources}>자원 찾기</Link>
              </div>
            )}
            {resourceStatus === 'success' && resource && (
              <div className="user-reservation-resource">
                <div className="user-reservation-resource__media">
                  <ResourceVisual imageUrl={resource.imageUrl} alt={resource.name} />
                </div>
                <div>
                  <strong>{resource.name}</strong>
                  <span>{resource.resourceCode}</span>
                  <span>{resource.categoryName} · {resource.location}</span>
                  <p className="user-reservation-status">
                    <Badge tone={userStatusMeta(resource.status).tone}>{userStatusMeta(resource.status).label}</Badge>
                    <span>{resource.status === 'AVAILABLE' ? '예약할 수 있는 자원입니다.' : reserveBlockedReason[resource.status]}</span>
                  </p>
                  <Link id="reservation-resource-action" className="ui-button ui-button--outline ui-button--sm" to={ROUTES.user.resources}>자원 변경</Link>
                </div>
              </div>
            )}
            {errors.resource && <p className="user-reservation-error" role="alert">{errors.resource}</p>}
          </section>

          <section>
            <h3>2. 예약 일정 선택</h3>
            <div className="user-reservation-schedule">
              <DatePicker id="reservation-start-date" label="이용 시작일" required min={reservationToday} value={form.schedule.startDate} error={errors.startDate} onChange={(event) => patchSchedule({ startDate: event.target.value })} />
              <Select id="reservation-start-time" label="이용 시작 시간" required value={form.schedule.startTime} error={errors.startTime} placeholder="시간을 선택하세요" options={reservationTimeOptions} onChange={(event) => patchSchedule({ startTime: event.target.value })} />
              <DatePicker id="reservation-end-date" label="이용 종료일" required min={reservationToday} value={form.schedule.endDate} error={errors.endDate} onChange={(event) => patchSchedule({ endDate: event.target.value })} />
              <Select id="reservation-end-time" label="이용 종료 시간" required value={form.schedule.endTime} error={errors.endTime ?? rangeError ?? undefined} placeholder="시간을 선택하세요" options={reservationTimeOptions} onChange={(event) => patchSchedule({ endTime: event.target.value })} />
            </div>
            <p className={`user-reservation-availability is-${availability.status}`} role="status">
              <Badge tone={availability.status === 'available' ? 'green' : availability.status === 'unavailable' ? 'red' : 'yellow'}>{availabilityLabel[availability.status]}</Badge>
              <span>{availability.message}</span>
            </p>
            {errors.schedule && <p className="user-reservation-error" role="alert">{errors.schedule}</p>}
          </section>

          <section>
            <h3>3. 예약 정보 입력</h3>
            {applicant ? (
              <dl className="user-reservation-applicant">
                <div><dt>이름</dt><dd>{applicant.name}</dd></div>
                <div><dt>이메일</dt><dd>{applicant.email}</dd></div>
                <div><dt>휴대전화</dt><dd>{applicant.phone}</dd></div>
                <div><dt>소속</dt><dd>{applicant.organization}</dd></div>
              </dl>
            ) : <Loading label="예약자 정보를 불러오는 중입니다" />}
            <Link className="user-reservation-edit" to={ROUTES.user.mypage}>정보 수정은 마이페이지에서 할 수 있습니다.</Link>
          </section>

          <section>
            <h3>4. 이용 목적 입력</h3>
            <Textarea id="reservation-purpose" label="이용 목적" required value={form.purpose} error={errors.purpose} onChange={(event) => {
              setForm((current) => ({ ...current, purpose: event.target.value }))
              setErrors((current) => ({ ...current, purpose: undefined }))
            }} />
            <Input id="reservation-location" label="이용 장소" required value={form.usageLocation} error={errors.usageLocation} onChange={(event) => {
              setForm((current) => ({ ...current, usageLocation: event.target.value }))
              setErrors((current) => ({ ...current, usageLocation: undefined }))
            }} />
            <Input id="reservation-attendee" label="참석 인원" type="number" required min={1} inputMode="numeric" value={form.attendeeCount} error={errors.attendeeCount} onChange={(event) => {
              setForm((current) => ({ ...current, attendeeCount: event.target.value }))
              setErrors((current) => ({ ...current, attendeeCount: undefined }))
            }} />
            <Textarea id="reservation-note" label="비고" value={form.requestNote} onChange={(event) => setForm((current) => ({ ...current, requestNote: event.target.value }))} />
          </section>
        </div>

        <aside className="user-reservation-side">
          <section>
            <h3>5. 예약 내용 확인</h3>
            <h4>예약 자원</h4>
            <dl>
              <div><dt>자원명</dt><dd>{resource?.name ?? '-'}</dd></div>
              <div><dt>자원 코드</dt><dd>{resource?.resourceCode ?? '-'}</dd></div>
              <div><dt>카테고리</dt><dd>{resource?.categoryName ?? '-'}</dd></div>
            </dl>
            <h4>예약 일정</h4>
            <dl>
              <div><dt>이용 시작</dt><dd>{scheduleText}</dd></div>
              <div><dt>이용 종료</dt><dd>{endText}</dd></div>
            </dl>
            <h4>예약자</h4>
            <dl>
              <div><dt>이름</dt><dd>{applicant?.name ?? '-'}</dd></div>
              <div><dt>연락처</dt><dd>{applicant?.phone ?? '-'}</dd></div>
              <div><dt>소속</dt><dd>{applicant?.organization ?? '-'}</dd></div>
            </dl>
            <h4>이용 정보</h4>
            <dl>
              <div><dt>이용 목적</dt><dd>{form.purpose.trim() || '-'}</dd></div>
              <div><dt>이용 장소</dt><dd>{form.usageLocation.trim() || '-'}</dd></div>
              <div><dt>참석 인원</dt><dd>{form.attendeeCount.trim() ? `${form.attendeeCount}명` : '-'}</dd></div>
              <div><dt>비고</dt><dd>{form.requestNote.trim() || '-'}</dd></div>
            </dl>
          </section>
          <fieldset className="user-reservation-agreements" aria-describedby={errors.agreement ? 'reservation-agreement-error' : undefined}>
            <legend>이용 약관 동의</legend>
            <Checkbox id="reservation-agree-guide" required label="예약 이용 안내 동의" description="필수" checked={form.agreement.usageGuide} aria-invalid={Boolean(errors.agreement)} onChange={(event) => {
              setForm((current) => ({ ...current, agreement: { ...current.agreement, usageGuide: event.target.checked } }))
              setErrors((current) => ({ ...current, agreement: undefined }))
            }} />
            <Checkbox id="reservation-agree-privacy" required label="개인정보 수집 및 이용 동의" description="필수" checked={form.agreement.privacy} aria-invalid={Boolean(errors.agreement)} onChange={(event) => {
              setForm((current) => ({ ...current, agreement: { ...current.agreement, privacy: event.target.checked } }))
              setErrors((current) => ({ ...current, agreement: undefined }))
            }} />
            <Checkbox id="reservation-agree-alert" label="알림 수신 동의" description="선택" checked={form.agreement.notifications} onChange={(event) => setForm((current) => ({ ...current, agreement: { ...current.agreement, notifications: event.target.checked } }))} />
            {errors.agreement && <p id="reservation-agreement-error" className="user-reservation-error" role="alert">{errors.agreement}</p>}
          </fieldset>
          <div className="user-reservation-submit">
            <Button type="submit" fullWidth disabled={!agreementsReady || phase === 'submitting'}>예약 신청</Button>
          </div>
        </aside>
      </div>
      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (phase !== 'submitting') setConfirmOpen(false)
        }}
        title="예약 신청"
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={phase === 'submitting'}>취소</Button>
            <Button type="button" onClick={() => void onConfirm()} isLoading={phase === 'submitting'}>{phase === 'submitting' ? '신청 중' : '신청'}</Button>
          </>
        }
      >
        <p>입력한 내용으로 예약을 신청하시겠습니까?</p>
      </Modal>
    </form>
  )
}

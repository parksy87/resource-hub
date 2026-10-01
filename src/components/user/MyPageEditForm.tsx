import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userRoleMeta, userStatusMeta } from '../../config/user'
import { ROUTES } from '../../routes/paths'
import { myPageService } from '../../services/myPageService'
import type { MyProfile, MyProfileForm } from '../../types'
import { formatReservationDate } from '../../utils/reservationDisplay'
import { isValidEmail, isValidPhone } from '../../utils/user'
import { Badge, Button, Card, ErrorState, Input, Loading, Modal } from '../ui'

type ProfileErrors = Partial<Record<keyof MyProfileForm, string>>

function validateProfile(values: MyProfileForm) {
  const next: ProfileErrors = {}
  if (!values.name.trim()) next.name = '이름을 입력해주세요.'
  if (!values.phone.trim()) next.phone = '전화번호를 입력해주세요.'
  else if (!isValidPhone(values.phone)) next.phone = '010-0000-0000 형식으로 입력해주세요.'
  if (!values.organization.trim()) next.organization = '소속을 입력해주세요.'
  if (!values.email.trim()) next.email = '이메일을 입력해주세요.'
  else if (!isValidEmail(values.email)) next.email = '이메일 형식을 확인해주세요.'
  return next
}

function ProfileEditor({ profile }: { profile: MyProfile }) {
  const navigate = useNavigate()
  const [values, setValues] = useState<MyProfileForm>({
    name: profile.name,
    phone: profile.phone,
    organization: profile.organization,
    email: profile.email,
  })
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function setField<K extends keyof MyProfileForm>(key: K, value: MyProfileForm[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateProfile(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSaveError('')
    setConfirmOpen(true)
  }

  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      await myPageService.updateMyProfile(values)
      navigate(ROUTES.user.mypage, { state: { profileSaved: true } })
    } catch {
      setSaveError('회원정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setSaving(false)
    }
  }

  return (
    <>
      <form className="user-mypage-form" onSubmit={submit} noValidate>
        <Card title="수정할 정보" description="이름, 전화번호, 소속, 이메일을 수정할 수 있습니다.">
          <div className="user-mypage-form-grid">
            <Input
              label="이름"
              name="name"
              required
              autoComplete="name"
              value={values.name}
              error={errors.name}
              onChange={(event) => setField('name', event.target.value)}
            />
            <Input
              label="전화번호"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint="010-0000-0000"
              value={values.phone}
              error={errors.phone}
              onChange={(event) => setField('phone', event.target.value)}
            />
            <Input
              label="소속"
              name="organization"
              required
              autoComplete="organization"
              value={values.organization}
              error={errors.organization}
              onChange={(event) => setField('organization', event.target.value)}
            />
            <Input
              label="이메일"
              name="email"
              type="email"
              required
              autoComplete="email"
              hint="현재 단계에서는 계정 인증 없이 저장됩니다."
              value={values.email}
              error={errors.email}
              onChange={(event) => setField('email', event.target.value)}
            />
          </div>
        </Card>

        <Card title="변경할 수 없는 정보" description="가입일, 회원 상태, 회원 권한은 수정할 수 없습니다.">
          <dl className="user-mypage-fields">
            <div><dt>가입일</dt><dd><time dateTime={profile.joinedAt}>{formatReservationDate(profile.joinedAt)}</time></dd></div>
            <div>
              <dt>회원 상태</dt>
              <dd><Badge tone={userStatusMeta[profile.status].tone}>{userStatusMeta[profile.status].label}</Badge></dd>
            </div>
            <div><dt>회원 권한</dt><dd>{userRoleMeta[profile.role].label}</dd></div>
          </dl>
        </Card>

        <div className="user-mypage-form-actions">
          <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.mypage}>취소</Link>
          <Button type="submit" disabled={saving}>저장</Button>
        </div>
      </form>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (!saving) setConfirmOpen(false)
        }}
        title="회원정보를 저장할까요?"
        description="입력한 이름, 전화번호, 소속, 이메일이 마이페이지에 반영됩니다."
        size="sm"
        footer={(
          <>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setConfirmOpen(false)}>취소</Button>
            <Button type="button" isLoading={saving} onClick={() => void save()}>
              {saving ? '저장 중' : '저장'}
            </Button>
          </>
        )}
      >
        <div className="user-mypage-withdraw-modal">
          <p className="user-mypage-confirm">저장 후 마이페이지로 이동합니다. 이메일 계정 인증은 이 단계에서 진행하지 않습니다.</p>
          {saveError && <p className="user-mypage-alert" role="alert">{saveError}</p>}
        </div>
      </Modal>
    </>
  )
}

export function MyPageEditForm() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [status, setStatus] = useState<'success' | 'error'>('success')
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const requestKey = String(requestId)

  useEffect(() => {
    let active = true
    void myPageService.getMyProfile().then((data) => {
      if (!active) return
      setProfile(data)
      setStatus('success')
      setSettledKey(requestKey)
    }).catch(() => {
      if (!active) return
      setStatus('error')
      setSettledKey(requestKey)
    })
    return () => {
      active = false
    }
  }, [requestKey])

  const visibleStatus = settledKey === requestKey ? status : 'loading'

  return (
    <section className="user-mypage-edit">
      <header className="user-mypage-heading">
        <p>ACCOUNT</p>
        <h2>회원정보 수정</h2>
        <Link to={ROUTES.user.mypage}>마이페이지로</Link>
      </header>
      {visibleStatus === 'loading' && <Loading label="회원정보를 불러오는 중입니다" />}
      {visibleStatus === 'error' && (
        <ErrorState
          title="회원정보를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => setRequestId((value) => value + 1)}
        />
      )}
      {visibleStatus === 'success' && profile && (
        <ProfileEditor key={`${profile.id}-${profile.email}-${profile.phone}-${profile.organization}`} profile={profile} />
      )}
    </section>
  )
}

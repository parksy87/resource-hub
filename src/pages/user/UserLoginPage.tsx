import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail } from 'lucide-react'
import { Button, Input } from '../../components/ui'
import { ROUTES } from '../../routes/paths'
import { demoUserName, useUserSessionStore } from '../../stores/userSessionStore'

export default function UserLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useUserSessionStore((state) => state.login)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as { from?: string } | null)?.from ??
    ROUTES.user.home

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    login()
    navigate(redirectTo, { replace: true })
    setSubmitting(false)
  }

  return (
    <section className="user-placeholder user-login">
      <p>ACCOUNT</p>
      <h2>로그인</h2>
      <p>
        시연용 더미 계정으로 로그인합니다. 실제 Firebase Authentication은 사용하지 않으며,{' '}
        <strong>{demoUserName}</strong> 프로필로 화면을 확인할 수 있습니다.
      </p>
      <form className="user-login__form" onSubmit={handleSubmit} noValidate>
        <Input
          name="email"
          type="email"
          label="이메일"
          autoComplete="email"
          defaultValue="demo@resource.co.kr"
          readOnly
          leadingIcon={<Mail size={17} />}
        />
        <Input
          name="password"
          type="password"
          label="비밀번호"
          autoComplete="current-password"
          defaultValue="demo"
          readOnly
          leadingIcon={<LockKeyhole size={17} />}
        />
        <Button type="submit" size="lg" fullWidth isLoading={submitting}>
          시연 로그인
        </Button>
      </form>
      <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.home}>
        홈으로
      </Link>
    </section>
  )
}

import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, UserRound } from 'lucide-react'
import { Button, Input } from '../../components/ui'
import {
  PORTFOLIO_DEMO_USER_ID,
  PORTFOLIO_DEMO_USER_PASSWORD,
} from '../../config/portfolioAuth'
import { ROUTES } from '../../routes/paths'
import { demoUserName, useUserSessionStore } from '../../stores/userSessionStore'

export default function UserLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useUserSessionStore((state) => state.login)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const redirectTo =
    (location.state as { from?: string } | null)?.from ??
    ROUTES.user.home

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const loginId = String(formData.get('loginId') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (loginId !== PORTFOLIO_DEMO_USER_ID || password !== PORTFOLIO_DEMO_USER_PASSWORD) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    setSubmitting(true)
    login()
    navigate(redirectTo, { replace: true })
    setSubmitting(false)
  }

  return (
    <main className="user-login-screen">
    <section className="user-placeholder user-login">
      <p>ACCOUNT</p>
      <h2>로그인</h2>
      <p>
        시연 계정으로 로그인합니다. <strong>{demoUserName}</strong> 샘플 프로필이 사용됩니다.
      </p>
      <p>
        시연 계정: <strong>{PORTFOLIO_DEMO_USER_ID}</strong> / <strong>{PORTFOLIO_DEMO_USER_PASSWORD}</strong>
      </p>
      <form className="user-login__form" onSubmit={handleSubmit} noValidate>
        <Input
          name="loginId"
          type="text"
          label="아이디"
          autoComplete="username"
          placeholder={PORTFOLIO_DEMO_USER_ID}
          leadingIcon={<UserRound size={17} />}
          required
        />
        <Input
          name="password"
          type="password"
          label="비밀번호"
          autoComplete="current-password"
          placeholder={PORTFOLIO_DEMO_USER_PASSWORD}
          leadingIcon={<LockKeyhole size={17} />}
          required
        />
        {error && <p className="user-login__error" role="alert">{error}</p>}
        <Button type="submit" size="lg" fullWidth isLoading={submitting}>
          로그인
        </Button>
      </form>
      <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.home}>
        홈으로
      </Link>
      </section>
    </main>
  )
}

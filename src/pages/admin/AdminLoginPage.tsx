import { type FormEvent, useState } from 'react'



import { Boxes, CheckCircle2, LockKeyhole, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react'



import { useLocation, useNavigate } from 'react-router-dom'



import { Button, Checkbox, Input, Tooltip } from '../../components/ui'



import { PORTFOLIO_ADMIN_DISPLAY_ID } from '../../config/portfolioAuth'
import { authService } from '../../services/authService'



import { ROUTES } from '../../routes/paths'



import { useThemeStore } from '../../stores/themeStore'



import { useUiStore } from '../../stores/uiStore'



import { useAdminSessionStore } from '../../stores/adminSessionStore'
import { AuthServiceError } from '../../types/auth'










export default function AdminLoginPage() {



  const navigate = useNavigate()



  const location = useLocation()



  const theme = useThemeStore((state) => state.theme)



  const toggleTheme = useThemeStore((state) => state.toggleTheme)



  const addToast = useUiStore((state) => state.addToast)



  const [submitting, setSubmitting] = useState(false)



  const [error, setError] = useState('')







  const redirectTo =



    (location.state as { from?: string } | null)?.from ??



    ROUTES.admin.dashboard







  async function handleSubmit(event: FormEvent<HTMLFormElement>) {



    event.preventDefault()



    setError('')



    const formData = new FormData(event.currentTarget)



    const loginId = String(formData.get('loginId') ?? '')



    const password = String(formData.get('password') ?? '')







    setSubmitting(true)



    try {



      const user = await authService.loginAsAdmin(loginId, password)
      const token = await authService.getIdToken()
      useAdminSessionStore.getState().applyAdminUser(user, token)

      addToast({ tone: 'success', title: '관리자로 로그인했습니다.' })



      navigate(redirectTo, { replace: true })



    } catch (caught) {



      const message =



        caught instanceof AuthServiceError



          ? caught.message



          : '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'



      setError(message)



    } finally {



      setSubmitting(false)



    }



  }







  return (



    <main className="admin-login">



      <section className="admin-login__visual">



        <div className="admin-login__visual-inner">



          <a className="admin-login__brand" href="/">



            <span><Boxes size={24} /></span>



            <div><strong>Resource Hub</strong><small>RESOURCE MANAGEMENT SYSTEM</small></div>



          </a>



          <div className="admin-login__message">



            <span className="admin-login__eyebrow"><ShieldCheck size={15} /> ADMIN CONSOLE</span>



            <h1>자원 관리 시스템</h1>



            <p>예약, 대여·반납, 점검 업무를 관리합니다.</p>



          </div>



          <ul className="admin-login__benefits">



            <li><CheckCircle2 size={16} /> 자원 현황 및 상태 관리</li>



            <li><CheckCircle2 size={16} /> 예약 승인 및 반려</li>



            <li><CheckCircle2 size={16} /> 대여·반납 및 점검</li>



          </ul>



          <small className="admin-login__copyright">© 2026 Resource Hub. Portfolio project.</small>



        </div>



      </section>







      <section className="admin-login__form-section">



        <div className="admin-login__theme">



          <Tooltip label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}>



            <button



              type="button"



              onClick={toggleTheme}



              aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}



            >



              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}



            </button>



          </Tooltip>



        </div>



        <div className="admin-login__form-wrap">



          <div className="admin-login__mobile-brand"><Boxes size={21} /><strong>Resource Hub</strong></div>



          <div className="admin-login__heading">



            <span>관리자 전용</span>



            <h2>관리자 로그인</h2>



            <p>
              아이디 <strong>{PORTFOLIO_ADMIN_DISPLAY_ID}</strong>와 관리자 비밀번호를 입력하세요.
            </p>



          </div>



          <form className="admin-login__form" onSubmit={(event) => void handleSubmit(event)} noValidate>



            <Input



              name="loginId"



              type="text"



              label="아이디"



              placeholder={PORTFOLIO_ADMIN_DISPLAY_ID}



              leadingIcon={<UserRound size={17} />}



              autoComplete="username"



              required



            />



            <Input



              name="password"



              type="password"



              label="비밀번호"



              placeholder="비밀번호를 입력하세요"



              leadingIcon={<LockKeyhole size={17} />}



              autoComplete="current-password"



              required



            />



            {error && <p className="admin-login__error" role="alert">{error}</p>}



            <div className="admin-login__options">



              <Checkbox name="remember" label="로그인 유지" />



              <button



                type="button"



                onClick={() => addToast({ tone: 'info', title: '비밀번호 찾기는 준비 중입니다.' })}



              >



                비밀번호 찾기



              </button>



            </div>



            <Button type="submit" size="lg" fullWidth isLoading={submitting}>로그인</Button>



          </form>



          <div className="admin-login__notice">



            <ShieldCheck size={16} />



            <p>
              <strong>보안 안내</strong>
              <span>공용 기기에서는 로그인 유지를 선택하지 마세요.</span>
            </p>



          </div>



        </div>



      </section>



    </main>



  )



}





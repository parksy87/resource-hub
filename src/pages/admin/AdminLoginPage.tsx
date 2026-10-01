import { type FormEvent, useState } from 'react'



import { Boxes, CheckCircle2, LockKeyhole, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react'



import { useLocation, useNavigate } from 'react-router-dom'



import { Button, Checkbox, Input, Tooltip } from '../../components/ui'



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



    const email = String(formData.get('email') ?? '')



    const password = String(formData.get('password') ?? '')







    setSubmitting(true)



    try {



      const user = await authService.loginAsAdmin(email, password)
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



            <h1>조직의 모든 자원을<br />한눈에, 빈틈없이.</h1>



            <p>예약부터 반납, 점검까지 자원 운영의 전체 흐름을 하나의 시스템에서 관리합니다.</p>



          </div>



          <ul className="admin-login__benefits">



            <li><CheckCircle2 size={16} /> 명확한 자원 상태와 업무 흐름</li>



            <li><CheckCircle2 size={16} /> 역할에 기반한 관리자 화면</li>



            <li><CheckCircle2 size={16} /> 확장 가능한 운영 데이터 구조</li>



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



            <h2>다시 만나 반갑습니다</h2>



            <p>관리자 계정으로 로그인하여 운영 현황을 확인하세요.</p>



          </div>



          <form className="admin-login__form" onSubmit={(event) => void handleSubmit(event)} noValidate>



            <Input



              name="email"



              type="email"



              label="이메일"



              placeholder="admin@example.com"



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



            <p><strong>보안 안내</strong><span>공용 기기에서는 로그인 유지를 선택하지 마세요.</span></p>



          </div>



        </div>



      </section>



    </main>



  )



}





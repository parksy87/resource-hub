import { useNavigate } from 'react-router-dom'
import { StateDisplay } from '../../components/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="not-found-page">
      <div className="not-found-page__panel">
        <StateDisplay
          variant="unavailable"
          title="페이지를 찾을 수 없습니다."
          description="주소가 올바른지 확인하거나 홈으로 이동해 주세요."
          actionLabel="홈으로"
          onAction={() => navigate('/')}
        />
      </div>
    </main>
  )
}

import { ErrorState, Loading } from '../../components/ui'
import {
  AvailableResourceList,
  HomeHero,
  HomeNoticeList,
  HomeQuickMenu,
  HomeSearchForm,
  HomeUsage,
  PopularResourceList,
} from '../../components/user/home/HomeSections'
import { useHome } from '../../hooks/useHome'
import { useUserSessionStore } from '../../stores/userSessionStore'

export default function Home() {
  const { data, status, error, refetch } = useHome()
  const isLoggedIn = useUserSessionStore((state) => state.isLoggedIn)

  return (
    <div className="home-page">
      <HomeHero />
      <HomeQuickMenu />
      <HomeSearchForm />
      {status === 'loading' && <Loading size="lg" label="홈 정보를 불러오는 중입니다" />}
      {status === 'error' && (
        <ErrorState title="홈 정보를 불러오지 못했습니다" description={error ?? undefined} actionLabel="다시 시도" onAction={refetch} />
      )}
      {status === 'success' && data && (
        <>
          <PopularResourceList items={data.popular} />
          <AvailableResourceList items={data.available} />
          <div className="home-columns">
            <HomeUsage loggedIn={isLoggedIn} summary={data.summary} activities={data.activities} />
            <HomeNoticeList items={data.notifications} />
          </div>
        </>
      )}
    </div>
  )
}

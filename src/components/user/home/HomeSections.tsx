import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  Bell,
  CalendarClock,
  ClipboardList,
  Laptop,
  Package,
  Search,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatHomeDate, homeAvailabilityOptions, homeCategoryOptions, homeStatusMeta } from '../../../config/home'
import { ROUTES } from '../../../routes/paths'
import type { HomeNotification, HomeResource, PopularResource, RecentActivity, UserUsageSummary } from '../../../types/home'
import { Badge, Button, EmptyState, Input, Select } from '../../ui'

const quickMenus = [
  { label: '자원 찾기', to: ROUTES.user.resources, icon: Search },
  { label: '예약 신청', to: ROUTES.user.reservations, icon: CalendarClock },
  { label: '예약 내역', to: ROUTES.user.reservationHistory, icon: ClipboardList },
  { label: '대여·반납', to: ROUTES.user.rentals, icon: Package },
  { label: '알림', to: ROUTES.user.notifications, icon: Bell },
  { label: '마이페이지', to: ROUTES.user.mypage, icon: UserRound },
]

export function HomeHero() {
  return (
    <section className="home-hero">
      <p>Resource Hub</p>
      <h2>공용 자원 예약</h2>
      <p>자원 조회, 예약, 대여·반납 내역을 확인합니다.</p>
      <div className="home-hero__actions">
        <Link className="ui-button ui-button--primary ui-button--md" to={ROUTES.user.resources}>자원 찾기</Link>
        <Link className="ui-button ui-button--outline ui-button--md" to={ROUTES.user.reservationHistory}>예약 내역</Link>
      </div>
    </section>
  )
}

export function HomeQuickMenu() {
  return (
    <section className="home-section" aria-labelledby="home-quick-title">
      <h2 id="home-quick-title">빠른 메뉴</h2>
      <div className="home-quick">
        {quickMenus.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} className="home-quick__item" to={item.to}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function HomeSearchForm() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [available, setAvailable] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    const trimmed = keyword.trim()
    if (trimmed) params.set('keyword', trimmed)
    if (category) params.set('category', category)
    if (available) params.set('available', available)
    const query = params.toString()
    navigate(query ? `${ROUTES.user.resources}?${query}` : ROUTES.user.resources)
  }

  return (
    <section className="home-section" aria-labelledby="home-search-title">
      <h2 id="home-search-title">자원 검색</h2>
      <form className="home-search" onSubmit={onSubmit}>
        <Input id="home-keyword" label="자원명" value={keyword} placeholder="자원명을 입력하세요" onChange={(event) => setKeyword(event.target.value)} />
        <Select id="home-category" label="카테고리" value={category} options={homeCategoryOptions} onChange={(event) => setCategory(event.target.value)} />
        <Select id="home-available" label="이용 가능 여부" value={available} options={homeAvailabilityOptions} onChange={(event) => setAvailable(event.target.value)} />
        <Button type="submit">검색</Button>
      </form>
    </section>
  )
}

function ResourceVisual({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) return <img src={imageUrl} alt="" />
  return (
    <span aria-hidden="true">
      <Laptop size={22} />
    </span>
  )
}

export function PopularResourceList({ items }: { items: PopularResource[] }) {
  return (
    <section className="home-section" aria-labelledby="home-popular-title">
      <h2 id="home-popular-title">인기 자원</h2>
      {items.length === 0 ? (
        <EmptyState title="추천 자원이 없습니다" />
      ) : (
        <div className="home-cards">
          {items.map((item) => {
            const status = homeStatusMeta[item.status]
            return (
              <Link key={item.id} className="home-card" to={ROUTES.user.resourceDetail(item.id)}>
                <div className="home-card__visual"><ResourceVisual imageUrl={item.imageUrl} /></div>
                <div>
                  <Badge tone="neutral">{item.categoryName}</Badge>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  <div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <span>이용 {item.usageCount}회</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function AvailableResourceList({ items }: { items: HomeResource[] }) {
  return (
    <section className="home-section" aria-labelledby="home-available-title">
      <h2 id="home-available-title">이용 가능한 자원</h2>
      {items.length === 0 ? (
        <EmptyState title="이용 가능한 자원이 없습니다" />
      ) : (
        <ul className="home-available">
          {items.map((item) => {
            const status = homeStatusMeta[item.status]
            return (
              <li key={item.id}>
                <div>
                  <Link to={ROUTES.user.resourceDetail(item.id)}>{item.name}</Link>
                  <span>{item.categoryName}</span>
                  <span>{item.location}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <Link className="ui-button ui-button--outline ui-button--sm" to={`${ROUTES.user.reservations}?resourceId=${item.id}`}>예약</Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const summaryItems = [
  { key: 'reserving', label: '예약 중', to: ROUTES.user.reservations },
  { key: 'renting', label: '대여 중', to: ROUTES.user.rentals },
  { key: 'dueSoon', label: '반납 예정', to: ROUTES.user.rentals },
  { key: 'unreadNotifications', label: '읽지 않은 알림', to: ROUTES.user.notifications },
] as const

export function HomeUsage({
  loggedIn,
  summary,
  activities,
}: {
  loggedIn: boolean
  summary: UserUsageSummary
  activities: RecentActivity[]
}) {
  return (
    <section className="home-section" aria-labelledby="home-usage-title">
      <h2 id="home-usage-title">나의 이용</h2>
      {loggedIn ? (
        <>
          <div className="home-summary">
            {summaryItems.map((item) => (
              <Link key={item.key} to={item.to}>
                <span>{item.label}</span>
                <strong>{summary[item.key]}</strong>
              </Link>
            ))}
          </div>
          <h3>최근 이용</h3>
          {activities.length === 0 ? (
            <EmptyState title="최근 이용 내역이 없습니다" />
          ) : (
            <ul className="home-activity">
              {activities.map((item) => (
                <li key={item.id}>
                  <Link to={ROUTES.user.resourceDetail(item.resourceId)}>
                    <strong>{item.resourceName}</strong>
                    <span>{formatHomeDate(item.usedOn)}</span>
                    <span>{item.statusLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="home-guest">로그인 후 최근 이용 내역을 확인할 수 있습니다.</p>
      )}
    </section>
  )
}

export function HomeNoticeList({ items }: { items: HomeNotification[] }) {
  return (
    <section className="home-section" aria-labelledby="home-notice-title">
      <div className="home-section__head">
        <h2 id="home-notice-title">공지</h2>
        <Link to={ROUTES.user.notifications}>전체 보기</Link>
      </div>
      {items.length === 0 ? (
        <EmptyState title="등록된 공지가 없습니다" />
      ) : (
        <ul className="home-notices">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={ROUTES.user.notifications}>
                {item.important && <Badge tone="red">중요</Badge>}
                <strong>{item.title}</strong>
                <time dateTime={item.publishedAt}>{formatHomeDate(item.publishedAt)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

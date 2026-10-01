import { useState } from 'react'
import { BarChart3, CalendarCheck2, CalendarRange, CalendarX, ClipboardCheck, Clock3, Download, PackageCheck, RotateCcw, TriangleAlert, UsersRound } from 'lucide-react'
import { StatisticsCard } from '../../../components/statistics/StatisticsCard'
import { StatisticsBarChart, StatisticsCategoryBars, StatisticsDonutChart, StatisticsLineChart } from '../../../components/statistics/StatisticsCharts'
import { StatisticsFilterBar } from '../../../components/statistics/StatisticsFilterBar'
import { Button, Card, EmptyState, ErrorState, Loading, Table, type TableColumn } from '../../../components/ui'
import { statisticsPeriodOptions } from '../../../config/statistics'
import { defaultStatisticsFilter, useStatistics } from '../../../hooks/useStatistics'
import { useUiStore } from '../../../stores/uiStore'
import type { CategoryStatistics, PopularResource, StatisticsFilter, UserStatistics } from '../../../types'

const kpiIcons = [CalendarRange, CalendarCheck2, CalendarX, PackageCheck, RotateCcw, TriangleAlert, ClipboardCheck, UsersRound] as const
const kpiTones = ['brand', 'info', 'danger', 'warning', 'success', 'danger', 'warning', 'info'] as const

const detailColumns: TableColumn<CategoryStatistics>[] = [
  { key: 'category', header: '구분', render: (row) => row.categoryName },
  { key: 'total', header: '전체', render: (row) => row.total.toLocaleString('ko-KR') },
  { key: 'reservations', header: '예약', render: (row) => row.reservations.toLocaleString('ko-KR') },
  { key: 'rentals', header: '대여', render: (row) => row.rentals.toLocaleString('ko-KR') },
  { key: 'returns', header: '반납', render: (row) => row.returns.toLocaleString('ko-KR') },
  { key: 'overdue', header: '연체', render: (row) => row.overdue.toLocaleString('ko-KR') },
  { key: 'inspections', header: '점검', render: (row) => row.inspections.toLocaleString('ko-KR') },
  { key: 'rate', header: '이용률', render: (row) => `${row.utilizationRate}%` },
]

const popularColumns: TableColumn<PopularResource>[] = [
  { key: 'rank', header: '순위', width: '72px', render: (row) => row.rank },
  { key: 'name', header: '자원명', render: (row) => row.name },
  { key: 'category', header: '카테고리', render: (row) => row.categoryName },
  { key: 'usage', header: '이용 횟수', render: (row) => row.usageCount.toLocaleString('ko-KR') },
  { key: 'rate', header: '이용률', render: (row) => `${row.utilizationRate}%` },
]

function userMetrics(users: UserStatistics) {
  return [
    { label: '전체 회원', value: users.totalUsers },
    { label: '활성 회원', value: users.activeUsers },
    { label: '신규 가입', value: users.newUsers },
    { label: '실제 이용 회원', value: users.actualUsers },
    { label: '예약 이용 회원', value: users.reservationUsers },
    { label: '대여 이용 회원', value: users.rentalUsers },
  ]
}

export default function StatisticsPage() {
  const { filter, setFilter, options, data, status, error, refetch } = useStatistics()
  const addToast = useUiStore((state) => state.addToast)
  const [draft, setDraft] = useState<StatisticsFilter>(defaultStatisticsFilter)
  const [dateError, setDateError] = useState('')
  const periodLabel = statisticsPeriodOptions.find((item) => item.value === filter.period)?.label ?? '조회 기간'

  const applyFilter = () => {
    if (draft.period === 'CUSTOM' && (!draft.startDate || !draft.endDate)) {
      setDateError('시작일과 종료일을 선택해주세요.')
      return
    }
    if (draft.period === 'CUSTOM' && draft.startDate > draft.endDate) {
      setDateError('종료일은 시작일 이후여야 합니다.')
      return
    }
    setDateError('')
    setFilter(draft)
  }

  const resetFilter = () => {
    setDraft(defaultStatisticsFilter)
    setDateError('')
    setFilter(defaultStatisticsFilter)
  }

  return (
    <div className="statistics-page">
      <div className="resource-page-heading">
        <div>
          <span><BarChart3 size={14} /> STATISTICS</span>
          <h2>통계</h2>
          <p>예약, 대여, 점검, 회원 이용 현황을 기간별로 확인합니다. 현재 수치는 화면 확인용 집계입니다.</p>
        </div>
        <Button
          variant="outline"
          leadingIcon={<Download size={16} />}
          onClick={() => addToast({ tone: 'info', title: '엑셀 다운로드는 이후 단계에서 연결합니다.' })}
        >
          엑셀 다운로드
        </Button>
      </div>

      <StatisticsFilterBar draft={draft} options={options} dateError={dateError} onChange={setDraft} onSearch={applyFilter} onReset={resetFilter} />

      {status === 'loading' && <div className="statistics-state"><Loading size="lg" label="통계를 집계하는 중입니다" /></div>}
      {status === 'error' && <div className="statistics-state"><ErrorState title={error ?? '통계를 불러오지 못했습니다'} actionLabel="다시 시도" onAction={refetch} /></div>}
      {status === 'success' && data?.summary.empty && (
        <div className="statistics-state">
          <EmptyState title="검색 결과가 없습니다" description="선택한 카테고리에 해당 자원이 없습니다. 조건을 변경해보세요." actionLabel="조회 초기화" onAction={resetFilter} />
        </div>
      )}
      {status === 'success' && data && !data.summary.empty && (
        <>
          <section className="statistics-kpi-grid" aria-label="주요 통계">
            {data.summary.items.map((item, index) => (
              <StatisticsCard key={item.key} label={item.label} value={item.value} changeRate={item.changeRate} icon={kpiIcons[index]} tone={kpiTones[index]} />
            ))}
          </section>

          <section className="statistics-section" aria-labelledby="reservation-statistics">
            <header>
              <h3 id="reservation-statistics">예약 통계</h3>
              <p><Clock3 size={14} /> {periodLabel} 기준 예약 신청, 승인, 취소 추이와 상태 분포입니다.</p>
            </header>
            <div className="statistics-grid">
              <Card title="예약 추이" description="기간별 예약 신청, 승인, 취소 건수입니다.">
                <StatisticsLineChart trend={data.reservations.trend} label="예약 신청, 승인, 취소 건수를 기간 순으로 비교합니다." />
              </Card>
              <Card title="예약 상태 분포" description="신청, 승인, 반려, 취소, 이용완료 건수입니다.">
                <StatisticsDonutChart items={data.reservations.statuses} label="예약 상태별 건수 분포입니다." />
              </Card>
            </div>
          </section>

          <section className="statistics-section" aria-labelledby="resource-statistics">
            <header>
              <h3 id="resource-statistics">자원 이용 통계</h3>
              <p>자원 상태, 카테고리별 이용량, 이용이 많은 자원입니다.</p>
            </header>
            <div className="statistics-grid">
              <Card title="자원 상태 분포" description="사용 가능, 예약됨, 대여 중, 점검 중, 폐기 수량입니다.">
                <StatisticsDonutChart items={data.resources.statuses} label="자원 상태별 수량입니다." />
              </Card>
              <Card title="카테고리별 이용량" description="카테고리별 이용 횟수입니다.">
                <StatisticsCategoryBars items={data.resources.categories} label="카테고리별 이용 횟수입니다." />
              </Card>
            </div>
            <Card title="많이 이용된 자원" description="이용 횟수 기준 상위 자원입니다." padding="none" className="statistics-table-card">
              {data.resources.topResources.length === 0
                ? <div className="statistics-table-empty"><EmptyState compact title="이용 자원이 없습니다" description="선택한 조건의 이용 기록이 없습니다." /></div>
                : <Table columns={popularColumns} data={data.resources.topResources} rowKey={(row) => row.resourceId} caption="많이 이용된 자원" />}
            </Card>
          </section>

          <section className="statistics-section" aria-labelledby="rental-statistics">
            <header>
              <h3 id="rental-statistics">대여·반납 통계</h3>
              <p>대여, 반납, 연체 추이와 반납 상태입니다.</p>
            </header>
            <div className="statistics-grid">
              <Card title="대여/반납 추이" description="기간별 대여, 반납, 연체 건수입니다.">
                <StatisticsBarChart trend={data.rentals.trend} label="대여, 반납, 연체 건수를 기간 순으로 비교합니다." />
              </Card>
              <Card title="반납 상태" description="정상 반납, 일부 반납, 파손, 분실 건수입니다.">
                <StatisticsDonutChart items={data.rentals.returnConditions} label="반납 상태별 건수입니다." />
              </Card>
            </div>
          </section>

          <section className="statistics-section" aria-labelledby="inspection-statistics">
            <header>
              <h3 id="inspection-statistics">점검 통계</h3>
              <p>점검 결과와 점검 유형별 건수입니다.</p>
            </header>
            <div className="statistics-grid">
              <Card title="점검 결과" description="이상 없음, 경미한 이상, 수리 필요, 폐기 검토입니다.">
                <StatisticsDonutChart items={data.inspections.results} label="점검 결과별 건수입니다." />
              </Card>
              <Card title="점검 유형" description="정기점검, 반납점검, 수시점검, 장애점검입니다.">
                <StatisticsDonutChart items={data.inspections.types} label="점검 유형별 건수입니다." />
              </Card>
            </div>
          </section>

          <section className="statistics-section" aria-labelledby="user-statistics">
            <header>
              <h3 id="user-statistics">회원 이용 통계</h3>
              <p>회원 규모와 신규 가입, 이용 회원 추이입니다.</p>
            </header>
            <div className="statistics-user-grid">
              {userMetrics(data.users).map((item) => (
                <article key={item.label}>
                  <strong>{item.value.toLocaleString('ko-KR')}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
            <Card title="신규 가입·이용 회원 추이" description="선택한 기간의 신규 가입과 이용 회원 수입니다.">
              <StatisticsLineChart trend={data.users.trend} label="신규 가입과 이용 회원 추이입니다." />
            </Card>
          </section>

          <section className="statistics-section" aria-labelledby="detail-statistics">
            <header>
              <h3 id="detail-statistics">상세 통계</h3>
              <p>카테고리별 예약, 대여, 반납, 연체, 점검과 이용률입니다.</p>
            </header>
            <Card padding="none" className="statistics-table-card">
              <Table columns={detailColumns} data={data.resources.details} rowKey={(row) => row.category} caption="카테고리별 상세 통계" />
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

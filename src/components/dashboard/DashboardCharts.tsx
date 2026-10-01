import { EmptyState } from '../ui'
import type { ResourceCategoryStatistic, ResourceStatusStatistic } from '../../types'

export function ResourceStatusChart({
  items,
  total,
}: {
  items: ResourceStatusStatistic[]
  total: number
}) {
  if (items.length === 0) {
    return <EmptyState compact title="상태 데이터가 없습니다" description="자원 상태가 집계되면 차트가 표시됩니다." />
  }

  const segments = items.map((item, index) => ({
    item,
    offset: items
      .slice(0, index)
      .reduce((totalPercentage, current) => totalPercentage + current.percentage, 0),
  }))

  return (
    <div className="dashboard-status-chart">
      <div className="dashboard-donut" role="img" aria-label={`전체 자원 ${total}개의 상태 비율`}>
        <svg viewBox="0 0 42 42" aria-hidden="true">
          <circle className="dashboard-donut__track" cx="21" cy="21" r="15.9155" />
          {segments.map(({ item, offset }) => (
              <circle
                key={item.status}
                className={`dashboard-donut__segment is-${item.status.toLowerCase()}`}
                cx="21"
                cy="21"
                r="15.9155"
                strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                strokeDashoffset={-offset}
              />
          ))}
        </svg>
        <div><strong>{total}</strong><span>전체 자원</span></div>
      </div>
      <ul className="dashboard-chart-legend">
        {items.map((item) => (
          <li key={item.status}>
            <span className={`is-${item.status.toLowerCase()}`} />
            <div><strong>{item.label}</strong><small>{item.percentage}%</small></div>
            <b>{item.count}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResourceCategoryChart({ items }: { items: ResourceCategoryStatistic[] }) {
  if (items.length === 0) {
    return <EmptyState compact title="카테고리 데이터가 없습니다" description="카테고리별 자원이 집계되면 표시됩니다." />
  }

  const maxCount = Math.max(...items.map((item) => item.count))

  return (
    <div className="dashboard-category-chart" role="img" aria-label="카테고리별 자원 수 막대 그래프">
      {items.map((item, index) => (
        <div className="dashboard-category-row" key={item.categoryId}>
          <div className="dashboard-category-row__label">
            <span>{item.categoryName}</span>
            <strong>{item.count}<small>개</small></strong>
          </div>
          <div className="dashboard-category-row__track">
            <span
              className={`is-category-${index + 1}`}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <small>{item.percentage}%</small>
        </div>
      ))}
    </div>
  )
}

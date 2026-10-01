import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import type { FormEvent } from 'react'
import { statisticsCategoryOptions, statisticsPeriodOptions } from '../../config/statistics'
import type { StatisticsCategory, StatisticsFilter, StatisticsPeriod, StatisticsResourceOption } from '../../types'
import { Button, DatePicker, Select } from '../ui'

interface StatisticsFilterBarProps {
  draft: StatisticsFilter
  options: StatisticsResourceOption[]
  dateError: string
  onChange: (next: StatisticsFilter) => void
  onSearch: () => void
  onReset: () => void
}

export function StatisticsFilterBar({ draft, options, dateError, onChange, onSearch, onReset }: StatisticsFilterBarProps) {
  const resources = options

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="ui-search-filter statistics-filter" onSubmit={handleSubmit}>
      <div className="ui-search-filter__heading">
        <span><SlidersHorizontal size={18} /> 조회 조건</span>
        <button type="button" onClick={onReset}><RotateCcw size={14} /> 초기화</button>
      </div>
      <div className="ui-search-filter__fields">
        <Select
          aria-label="조회 기간"
          value={draft.period}
          onChange={(event) => onChange({ ...draft, period: event.target.value as StatisticsPeriod })}
          options={statisticsPeriodOptions}
        />
        {draft.period === 'CUSTOM' && (
          <>
            <DatePicker aria-label="조회 시작일" value={draft.startDate} error={dateError} onChange={(event) => onChange({ ...draft, startDate: event.target.value })} />
            <DatePicker aria-label="조회 종료일" value={draft.endDate} onChange={(event) => onChange({ ...draft, endDate: event.target.value })} />
          </>
        )}
        <Select
          aria-label="자원 카테고리"
          value={draft.category ?? ''}
          placeholder="전체 카테고리"
          onChange={(event) => onChange({ ...draft, category: (event.target.value || null) as StatisticsCategory | null })}
          options={statisticsCategoryOptions}
        />
        <Select
          aria-label="자원 선택"
          value={draft.resourceId ? String(draft.resourceId) : ''}
          placeholder="전체 자원"
          onChange={(event) => onChange({ ...draft, resourceId: event.target.value ? Number(event.target.value) : null })}
          options={resources.map((item) => ({ label: item.name, value: String(item.id) }))}
        />
        <Button type="submit" leadingIcon={<Search size={16} />}>검색</Button>
      </div>
    </form>
  )
}

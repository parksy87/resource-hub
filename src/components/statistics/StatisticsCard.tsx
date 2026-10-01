import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface StatisticsCardProps {
  label: string
  value: number
  changeRate: number
  icon: LucideIcon
  tone: 'brand' | 'info' | 'success' | 'warning' | 'danger'
}

export function StatisticsCard({ label, value, changeRate, icon: Icon, tone }: StatisticsCardProps) {
  const increased = changeRate >= 0
  return (
    <article className={cn('statistics-kpi', `is-${tone}`)}>
      <div>
        <span><Icon size={18} /></span>
        <b className={cn(increased ? 'is-up' : 'is-down')}>
          {increased ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {increased ? '증가' : '감소'} {Math.abs(changeRate)}%
        </b>
      </div>
      <strong>{value.toLocaleString('ko-KR')}</strong>
      <p>{label}</p>
      <small>전 기간 대비</small>
    </article>
  )
}

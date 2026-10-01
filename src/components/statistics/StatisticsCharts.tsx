import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '../ui'
import type { StatisticsCount, StatisticsTrend } from '../../types'
import { useChartPalette } from './chartTheme'

function ChartLegend({ items }: { items: { key: string; label: string; count?: number; color: string }[] }) {
  return (
    <ul className="statistics-legend">
      {items.map((item) => (
        <li key={item.key}>
          <span style={{ background: item.color }} />
          <strong>{item.label}</strong>
          {item.count !== undefined && <b>{item.count.toLocaleString('ko-KR')}</b>}
        </li>
      ))}
    </ul>
  )
}

export function StatisticsLineChart({ trend, label }: { trend: StatisticsTrend; label: string }) {
  const palette = useChartPalette()
  if (trend.points.length === 0) {
    return <EmptyState compact title="표시할 추이가 없습니다" description="조회 조건을 변경하면 추이 데이터가 표시됩니다." />
  }

  return (
    <div className="statistics-chart-block">
      <div className="statistics-chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend.points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: palette.text }}
            />
            {trend.series.map((series, index) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={palette.series[index % palette.series.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={trend.series.map((series, index) => ({
          key: series.key,
          label: series.label,
          color: palette.series[index % palette.series.length],
          count: trend.points.reduce((total, point) => total + Number(point[series.key] ?? 0), 0),
        }))}
      />
      <p className="statistics-chart-summary">{label}</p>
    </div>
  )
}

export function StatisticsBarChart({ trend, label }: { trend: StatisticsTrend; label: string }) {
  const palette = useChartPalette()
  if (trend.points.length === 0) {
    return <EmptyState compact title="표시할 추이가 없습니다" description="조회 조건을 변경하면 비교 데이터가 표시됩니다." />
  }

  return (
    <div className="statistics-chart-block">
      <div className="statistics-chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trend.points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: palette.text }}
            />
            {trend.series.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={series.label}
                fill={palette.series[index % palette.series.length]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={trend.series.map((series, index) => ({
          key: series.key,
          label: series.label,
          color: palette.series[index % palette.series.length],
          count: trend.points.reduce((total, point) => total + Number(point[series.key] ?? 0), 0),
        }))}
      />
      <p className="statistics-chart-summary">{label}</p>
    </div>
  )
}

export function StatisticsDonutChart({ items, label }: { items: StatisticsCount[]; label: string }) {
  const palette = useChartPalette()
  const total = items.reduce((sum, item) => sum + item.count, 0)
  if (items.length === 0 || total === 0) {
    return <EmptyState compact title="분포 데이터가 없습니다" description="해당 조건의 집계가 생기면 표시됩니다." />
  }

  return (
    <div className="statistics-donut">
      <div className="statistics-donut__chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="count" nameKey="label" innerRadius={58} outerRadius={84} paddingAngle={2} isAnimationActive={false} stroke="none">
              {items.map((item, index) => (
                <Cell key={item.key} fill={palette.series[index % palette.series.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 8, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div><strong>{total.toLocaleString('ko-KR')}</strong><span>합계</span></div>
      </div>
      <ChartLegend
        items={items.map((item, index) => ({
          key: item.key,
          label: item.label,
          count: item.count,
          color: palette.series[index % palette.series.length],
        }))}
      />
      <p className="statistics-chart-summary">{label}</p>
    </div>
  )
}

export function StatisticsCategoryBars({ items, label }: { items: StatisticsCount[]; label: string }) {
  const trend: StatisticsTrend = {
    series: [{ key: 'count', label: '이용 횟수' }],
    points: items.map((item) => ({ label: item.label, count: item.count })),
  }
  if (items.length === 0) {
    return <EmptyState compact title="카테고리 이용량이 없습니다" description="선택한 조건에 해당하는 이용 기록이 없습니다." />
  }
  return <StatisticsBarChart trend={trend} label={label} />
}

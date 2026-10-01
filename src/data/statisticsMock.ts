import { statisticsCategoryLabel } from '../config/statistics'
import { inspectionResultMeta, inspectionTypeMeta } from '../config/inspection'
import { reservationStatusMeta } from '../config/reservation'
import { resourceStatusMeta } from '../config/resource'
import { returnConditionMeta } from '../config/rental'
import { resourcesMock } from './resourceMock'
import type {
  CategoryStatistics,
  InspectionResult,
  InspectionType,
  ReservationStatus,
  ResourceStatus,
  ReturnCondition,
  StatisticsBundle,
  StatisticsCategory,
  StatisticsFilter,
  StatisticsResourceOption,
  StatisticsSummaryItem,
  StatisticsTrend,
  StatisticsTrendPoint,
} from '../types'

const ANCHOR = new Date('2026-10-01T00:00:00+09:00')

const typeCategory: Record<string, StatisticsCategory> = {
  NOTEBOOK: 'NOTEBOOK',
  TABLET: 'TABLET',
  CAMERA: 'CAMERA',
  PROJECTOR: 'PROJECTOR',
  MEETING_ROOM: 'MEETING_ROOM',
  PASSENGER_VEHICLE: 'VEHICLE',
}

const categoryWeight: Record<StatisticsCategory, number> = {
  NOTEBOOK: 0.32,
  TABLET: 0.14,
  CAMERA: 0.16,
  PROJECTOR: 0.08,
  MEETING_ROOM: 0.12,
  VEHICLE: 0.1,
  ETC: 0.08,
}

const categoryBase: CategoryStatistics[] = [
  { category: 'NOTEBOOK', categoryName: '노트북', total: 186, reservations: 120, rentals: 74, returns: 61, overdue: 6, inspections: 18, utilizationRate: 84 },
  { category: 'TABLET', categoryName: '태블릿', total: 82, reservations: 48, rentals: 31, returns: 24, overdue: 3, inspections: 8, utilizationRate: 71 },
  { category: 'CAMERA', categoryName: '카메라', total: 96, reservations: 58, rentals: 36, returns: 29, overdue: 4, inspections: 11, utilizationRate: 76 },
  { category: 'PROJECTOR', categoryName: '프로젝터', total: 44, reservations: 27, rentals: 16, returns: 14, overdue: 1, inspections: 5, utilizationRate: 63 },
  { category: 'MEETING_ROOM', categoryName: '회의실', total: 73, reservations: 51, rentals: 22, returns: 20, overdue: 2, inspections: 6, utilizationRate: 88 },
  { category: 'VEHICLE', categoryName: '차량', total: 39, reservations: 24, rentals: 15, returns: 12, overdue: 3, inspections: 7, utilizationRate: 58 },
  { category: 'ETC', categoryName: '기타', total: 31, reservations: 18, rentals: 11, returns: 9, overdue: 1, inspections: 4, utilizationRate: 46 },
]

const changeRates: Record<Exclude<StatisticsFilter['period'], 'CUSTOM'>, number[]> = {
  TODAY: [4.2, 3.1, -1.4, 2.2, 1.8, -6.5, 0.4, 1.1],
  '7D': [8.4, 6.2, -3.1, 5.5, 4.8, -2.4, 1.6, 3.2],
  '30D': [12.6, 9.4, -4.8, 7.1, 6.3, 1.2, 2.8, 5.4],
  '3M': [18.2, 14.1, -6.2, 11.4, 9.7, -0.8, 4.1, 8.6],
}

export function resourceCategory(type: string): StatisticsCategory {
  return typeCategory[type] ?? 'ETC'
}

export function statisticsResourceOptions(): StatisticsResourceOption[] {
  return resourcesMock.map((item) => ({
    id: item.id as number,
    name: item.name,
    category: resourceCategory(item.type),
  }))
}

function scaleOf(filter: StatisticsFilter) {
  if (filter.period === 'TODAY') return 0.12
  if (filter.period === '7D') return 0.35
  if (filter.period === '3M') return 2.4
  if (filter.period === 'CUSTOM' && filter.startDate && filter.endDate) {
    const days = Math.max(1, Math.round((Date.parse(`${filter.endDate}T00:00:00+09:00`) - Date.parse(`${filter.startDate}T00:00:00+09:00`)) / 86_400_000) + 1)
    return Math.min(3, Math.max(0.08, days / 30))
  }
  return 1
}

function pointCount(filter: StatisticsFilter) {
  if (filter.period === 'TODAY') return 1
  if (filter.period === '7D') return 7
  if (filter.period === '30D') return 10
  if (filter.period === '3M') return 12
  if (filter.startDate && filter.endDate) {
    const days = Math.max(1, Math.round((Date.parse(`${filter.endDate}T00:00:00+09:00`) - Date.parse(`${filter.startDate}T00:00:00+09:00`)) / 86_400_000) + 1)
    return Math.min(12, days)
  }
  return 6
}

function labelsFor(filter: StatisticsFilter) {
  const count = pointCount(filter)
  const end = filter.period === 'CUSTOM' && filter.endDate
    ? new Date(`${filter.endDate}T00:00:00+09:00`)
    : ANCHOR
  const span = filter.period === 'TODAY' ? 0 : filter.period === '7D' ? 6 : filter.period === '30D' ? 29 : filter.period === '3M' ? 84 : Math.max(0, count - 1)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end)
    const offset = count === 1 ? 0 : Math.round((span * (count - 1 - index)) / (count - 1))
    date.setDate(date.getDate() - offset)
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  })
}

function distribute(total: number, count: number) {
  if (count <= 0) return []
  const weights = Array.from({ length: count }, (_, index) => 0.72 + ((index * 3) % 5) * 0.11)
  const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0)
  const values = weights.map((weight) => Math.max(0, Math.floor((total * weight) / sum)))
  const gap = total - values.reduce((totalValue, value) => totalValue + value, 0)
  values[values.length - 1] = Math.max(0, values[values.length - 1] + gap)
  return values
}

function trend(labels: string[], series: { key: string; label: string; total: number }[]): StatisticsTrend {
  const distributed = series.map((item) => distribute(item.total, labels.length))
  const points: StatisticsTrendPoint[] = labels.map((label, index) => {
    const point: StatisticsTrendPoint = { label }
    series.forEach((item, seriesIndex) => {
      point[item.key] = distributed[seriesIndex][index] ?? 0
    })
    return point
  })
  return { series: series.map(({ key, label }) => ({ key, label })), points }
}

function round(value: number) {
  return Math.max(0, Math.round(value))
}

function emptyBundle(): StatisticsBundle {
  return buildStatistics({ period: '30D', startDate: '', endDate: '', category: null, resourceId: null }, true)
}

export function buildStatistics(filter: StatisticsFilter, forceEmpty = false): StatisticsBundle {
  const resource = statisticsResourceOptions().find((item) => item.id === filter.resourceId) ?? null
  const mismatch = Boolean(resource && filter.category && resource.category !== filter.category)
  if (forceEmpty || mismatch) {
    if (!forceEmpty) return emptyBundle()
  }

  const periodScale = scaleOf(filter)
  const focus = resource ? 0.22 : filter.category ? categoryWeight[filter.category] : 1
  const amount = (base: number) => round(base * periodScale * focus)
  const labels = labelsFor(filter)
  const rates = filter.period === 'CUSTOM' ? changeRates['30D'] : changeRates[filter.period]
  const summaryKeys: StatisticsSummaryItem['key'][] = ['reservations', 'approved', 'cancelled', 'rentals', 'returned', 'overdue', 'inspections', 'users']
  const summaryLabels = ['전체 예약', '승인 예약', '취소 예약', '대여 건수', '반납 완료', '연체 건수', '점검 건수', '이용 사용자 수']
  const summaryBases = [346, 214, 28, 205, 169, 20, 59, 86]
  const items: StatisticsSummaryItem[] = summaryKeys.map((key, index) => ({
    key,
    label: summaryLabels[index],
    value: amount(summaryBases[index]),
    changeRate: rates[index],
  }))

  const reservationStatuses: ReservationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']
  const reservationShares = [0.18, 0.42, 0.08, 0.08, 0.24]
  const reservationTotal = amount(346)
  const resourceStatuses: ResourceStatus[] = ['AVAILABLE', 'RESERVED', 'RENTED', 'INSPECTION', 'DISPOSED']
  const selectedResource = resource ? resourcesMock.find((item) => item.id === resource.id) : null
  const categories = (Object.keys(statisticsCategoryLabel) as StatisticsCategory[])
    .filter((category) => !filter.category || category === filter.category)
    .filter((category) => !resource || category === resource.category)
    .map((category) => ({
      key: category,
      label: statisticsCategoryLabel[category],
      count: amount(category === 'NOTEBOOK' ? 120 : category === 'CAMERA' ? 58 : category === 'TABLET' ? 48 : category === 'MEETING_ROOM' ? 51 : category === 'VEHICLE' ? 24 : category === 'PROJECTOR' ? 27 : 18),
    }))

  const topPool = [
    { resourceId: 248, name: 'MacBook Pro 14″ M4', category: 'NOTEBOOK' as const, usage: 86, rate: 92 },
    { resourceId: 243, name: 'Galaxy Tab S10 Ultra', category: 'TABLET' as const, usage: 64, rate: 81 },
    { resourceId: 241, name: 'Canon EOS R6 Mark II', category: 'CAMERA' as const, usage: 58, rate: 74 },
    { resourceId: 245, name: '프로젝트룸 C', category: 'MEETING_ROOM' as const, usage: 51, rate: 88 },
    { resourceId: 246, name: '스타리아 11인승', category: 'VEHICLE' as const, usage: 41, rate: 63 },
    { resourceId: 240, name: 'Epson EB-L630U', category: 'PROJECTOR' as const, usage: 29, rate: 57 },
    { resourceId: 236, name: 'RODE Wireless PRO', category: 'ETC' as const, usage: 22, rate: 44 },
  ].filter((item) => (!filter.category || item.category === filter.category) && (!resource || item.resourceId === resource.id))

  const details = categoryBase
    .filter((row) => (!filter.category || row.category === filter.category) && (!resource || row.category === resource.category))
    .map((row) => ({
      ...row,
      total: amount(row.total),
      reservations: amount(row.reservations),
      rentals: amount(row.rentals),
      returns: amount(row.returns),
      overdue: amount(row.overdue),
      inspections: amount(row.inspections),
      utilizationRate: Math.min(100, Math.max(0, Math.round(row.utilizationRate + (periodScale - 1) * 3))),
    }))

  const returnConditions: ReturnCondition[] = ['NORMAL', 'PARTIAL', 'DAMAGED', 'LOST']
  const inspectionResults: InspectionResult[] = ['NORMAL', 'MINOR', 'REPAIR', 'DISPOSAL_REVIEW']
  const inspectionTypes: InspectionType[] = ['PERIODIC', 'RETURN', 'ADHOC', 'INCIDENT']

  return {
    summary: { empty: false, items },
    reservations: {
      trend: trend(labels, [
        { key: 'requested', label: '예약 신청', total: reservationTotal },
        { key: 'approved', label: '승인', total: amount(214) },
        { key: 'cancelled', label: '취소', total: amount(28) },
      ]),
      statuses: reservationStatuses.map((status, index) => ({
        key: status,
        label: reservationStatusMeta[status].label,
        count: round(reservationTotal * reservationShares[index]),
      })),
    },
    resources: {
      statuses: resourceStatuses.map((status) => ({
        key: status,
        label: resourceStatusMeta[status].label,
        count: selectedResource
          ? (selectedResource.status === status ? 1 : 0)
          : amount(status === 'AVAILABLE' ? 142 : status === 'RESERVED' ? 38 : status === 'RENTED' ? 46 : status === 'INSPECTION' ? 14 : 8),
      })),
      categories,
      topResources: topPool.map((item, index) => ({
        rank: index + 1,
        resourceId: item.resourceId,
        name: item.name,
        categoryName: statisticsCategoryLabel[item.category],
        usageCount: amount(item.usage),
        utilizationRate: item.rate,
      })),
      details,
    },
    rentals: {
      trend: trend(labels, [
        { key: 'rented', label: '대여', total: amount(205) },
        { key: 'returned', label: '반납', total: amount(169) },
        { key: 'overdue', label: '연체', total: amount(20) },
      ]),
      returnConditions: returnConditions.map((condition, index) => ({
        key: condition,
        label: returnConditionMeta[condition].label,
        count: amount([128, 22, 13, 6][index]),
      })),
    },
    inspections: {
      results: inspectionResults.map((result, index) => ({
        key: result,
        label: inspectionResultMeta[result].label,
        count: amount([34, 14, 8, 3][index]),
      })),
      types: inspectionTypes.map((type, index) => ({
        key: type,
        label: inspectionTypeMeta[type].label,
        count: amount([26, 18, 10, 5][index]),
      })),
    },
    users: {
      totalUsers: resource || filter.category ? amount(128) : 128,
      activeUsers: resource || filter.category ? amount(96) : 96,
      newUsers: amount(14),
      actualUsers: amount(86),
      reservationUsers: amount(74),
      rentalUsers: amount(61),
      trend: trend(labels, [
        { key: 'joined', label: '신규 가입', total: amount(14) },
        { key: 'active', label: '이용 사용자', total: amount(86) },
      ]),
    },
  }
}

export function buildEmptyStatistics(): StatisticsBundle {
  const data = buildStatistics({ period: '30D', startDate: '', endDate: '', category: null, resourceId: null })
  const zeroItems = data.summary.items.map((item) => ({ ...item, value: 0, changeRate: 0 }))
  return {
    summary: { empty: true, items: zeroItems },
    reservations: { trend: { series: data.reservations.trend.series, points: [] }, statuses: [] },
    resources: { statuses: [], categories: [], topResources: [], details: [] },
    rentals: { trend: { series: data.rentals.trend.series, points: [] }, returnConditions: [] },
    inspections: { results: [], types: [] },
    users: { ...data.users, totalUsers: 0, activeUsers: 0, newUsers: 0, actualUsers: 0, reservationUsers: 0, rentalUsers: 0, trend: { series: data.users.trend.series, points: [] } },
  }
}

export function resolveStatistics(filter: StatisticsFilter) {
  const resource = statisticsResourceOptions().find((item) => item.id === filter.resourceId) ?? null
  if (resource && filter.category && resource.category !== filter.category) return buildEmptyStatistics()
  return buildStatistics(filter)
}

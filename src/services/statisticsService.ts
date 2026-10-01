import { resolveStatistics, statisticsResourceOptions } from '../data/statisticsMock'
import type {
  InspectionStatistics,
  ReservationStatistics,
  ResourceUsageStatistics,
  RentalStatistics,
  StatisticsFilter,
  StatisticsResourceOption,
  StatisticsSummary,
  UserStatistics,
} from '../types'

export interface StatisticsService {
  getStatisticsSummary: (filter: StatisticsFilter) => Promise<StatisticsSummary>
  getReservationStatistics: (filter: StatisticsFilter) => Promise<ReservationStatistics>
  getResourceUsageStatistics: (filter: StatisticsFilter) => Promise<ResourceUsageStatistics>
  getRentalStatistics: (filter: StatisticsFilter) => Promise<RentalStatistics>
  getInspectionStatistics: (filter: StatisticsFilter) => Promise<InspectionStatistics>
  getUserStatistics: (filter: StatisticsFilter) => Promise<UserStatistics>
  getStatisticsOptions: () => Promise<StatisticsResourceOption[]>
}

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

export const statisticsService: StatisticsService = {
  async getStatisticsSummary(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).summary)
  },
  async getReservationStatistics(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).reservations)
  },
  async getResourceUsageStatistics(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).resources)
  },
  async getRentalStatistics(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).rentals)
  },
  async getInspectionStatistics(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).inspections)
  },
  async getUserStatistics(filter) {
    await wait()
    return structuredClone(resolveStatistics(filter).users)
  },
  async getStatisticsOptions() {
    return statisticsResourceOptions()
  },
}

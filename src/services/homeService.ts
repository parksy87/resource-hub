import { homeMock } from '../data/homeMock'
import type {
  HomeNotification,
  HomeResource,
  PopularResource,
  RecentActivity,
  UserUsageSummary,
} from '../types/home'

export interface HomeService {
  getPopularResources: () => Promise<PopularResource[]>
  getAvailableResources: () => Promise<HomeResource[]>
  getRecentActivities: () => Promise<RecentActivity[]>
  getHomeNotifications: () => Promise<HomeNotification[]>
  getUserUsageSummary: () => Promise<UserUsageSummary>
}

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

export const homeService: HomeService = {
  async getPopularResources() {
    await wait()
    return structuredClone(homeMock.popular)
  },
  async getAvailableResources() {
    await wait()
    return structuredClone(homeMock.available)
  },
  async getRecentActivities() {
    await wait()
    return structuredClone(homeMock.activities)
  },
  async getHomeNotifications() {
    await wait()
    return structuredClone(homeMock.notifications)
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .slice(0, 5)
  },
  async getUserUsageSummary() {
    await wait()
    return structuredClone(homeMock.summary)
  },
}

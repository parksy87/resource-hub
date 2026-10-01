import { dashboardMockData } from '../data/dashboardMock'
import type { DashboardData } from '../types'

export interface DashboardService {
  getDashboard: () => Promise<DashboardData>
}

/**
 * PHP REST API 연결 전 사용하는 개발용 구현입니다.
 * UI는 이 계약만 의존하므로 이후 HTTP 구현으로 교체할 수 있습니다.
 */
export const dashboardService: DashboardService = {
  async getDashboard() {
    await new Promise((resolve) => window.setTimeout(resolve, 180))
    return structuredClone(dashboardMockData)
  },
}

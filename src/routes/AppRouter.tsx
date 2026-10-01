import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loading } from '../components/ui'
import { AdminAuthGuard } from '../components/auth/AdminAuthGuard'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import ResourceCreatePage from '../pages/admin/resources/ResourceCreatePage'
import ResourceDetailPage from '../pages/admin/resources/ResourceDetailPage'
import ResourceEditPage from '../pages/admin/resources/ResourceEditPage'
import ResourceListPage from '../pages/admin/resources/ResourceListPage'
import InspectionCreatePage from '../pages/admin/inspections/InspectionCreatePage'
import InspectionDetailPage from '../pages/admin/inspections/InspectionDetailPage'
import InspectionEditPage from '../pages/admin/inspections/InspectionEditPage'
import InspectionListPage from '../pages/admin/inspections/InspectionListPage'
import RentalDetailPage from '../pages/admin/rentals/RentalDetailPage'
import RentalListPage from '../pages/admin/rentals/RentalListPage'
import ReservationDetailPage from '../pages/admin/reservations/ReservationDetailPage'
import ReservationListPage from '../pages/admin/reservations/ReservationListPage'
import UserDetailPage from '../pages/admin/users/UserDetailPage'
import UserEditPage from '../pages/admin/users/UserEditPage'
import UserListPage from '../pages/admin/users/UserListPage'

const StatisticsPage = lazy(() => import('../pages/admin/statistics/StatisticsPage'))
const SettingsPage = lazy(() => import('../pages/admin/settings/SettingsPage'))
const UserLayout = lazy(() => import('../layouts/UserLayout'))
const Home = lazy(() => import('../pages/user/Home'))
const Resources = lazy(() => import('../pages/user/Resources'))
const ResourceDetail = lazy(() => import('../pages/user/ResourceDetail'))
const Reservations = lazy(() => import('../pages/user/Reservations'))
const ReservationHistory = lazy(() => import('../pages/user/ReservationHistory'))
const ReservationHistoryDetail = lazy(() => import('../pages/user/ReservationHistoryDetail'))
const Rentals = lazy(() => import('../pages/user/Rentals'))
const RentalDetail = lazy(() => import('../pages/user/RentalDetail'))
const Notifications = lazy(() => import('../pages/user/Notifications'))
const NotificationDetail = lazy(() => import('../pages/user/NotificationDetail'))
const MyPage = lazy(() => import('../pages/user/MyPage'))
const MyPageEdit = lazy(() => import('../pages/user/MyPageEdit'))
import UserLoginPage from '../pages/user/UserLoginPage'
import DesignSystemPage from '../pages/system/DesignSystemPage'
import NotFoundPage from '../pages/system/NotFoundPage'
import { ROUTES } from './paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.designSystem} element={<DesignSystemPage />} />
        <Route path={ROUTES.admin.login} element={<AdminLoginPage />} />
        <Route path={ROUTES.admin.root} element={<AdminAuthGuard />}>
          <Route element={<AdminLayout />}>
          <Route index element={<Navigate to={ROUTES.admin.dashboard} replace />} />
          <Route
            path="dashboard"
            element={<AdminDashboardPage />}
          />
          <Route
            path="resources"
            element={<ResourceListPage />}
          />
          <Route
            path="resources/new"
            element={<ResourceCreatePage />}
          />
          <Route
            path="resources/:id/edit"
            element={<ResourceEditPage />}
          />
          <Route
            path="resources/:id"
            element={<ResourceDetailPage />}
          />
          <Route
            path="reservations"
            element={<ReservationListPage />}
          />
          <Route
            path="reservations/:id"
            element={<ReservationDetailPage />}
          />
          <Route path="rentals" element={<RentalListPage />} />
          <Route path="rentals/:id" element={<RentalDetailPage />} />
          <Route path="inspections" element={<InspectionListPage />} />
          <Route path="inspections/new" element={<InspectionCreatePage />} />
          <Route path="inspections/:id/edit" element={<InspectionEditPage />} />
          <Route path="inspections/:id" element={<InspectionDetailPage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:id/edit" element={<UserEditPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="statistics" element={<Suspense fallback={<div className="statistics-state"><Loading size="lg" label="통계를 불러오는 중입니다" /></div>}><StatisticsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<div className="settings-screen"><Loading size="lg" label="시스템 설정을 불러오는 중입니다" /></div>}><SettingsPage /></Suspense>} />
          </Route>
        </Route>
        <Route element={<Suspense fallback={<Loading size="lg" label="화면을 불러오는 중입니다" />}><UserLayout /></Suspense>}>
          <Route path="login" element={<UserLoginPage />} />
          <Route index element={<Home />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:id" element={<ResourceDetail />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reservations/history" element={<ReservationHistory />} />
          <Route path="reservations/history/:id" element={<ReservationHistoryDetail />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="rentals/:id" element={<RentalDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="notifications/:id" element={<NotificationDetail />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="mypage/edit" element={<MyPageEdit />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

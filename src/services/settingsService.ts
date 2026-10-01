import { settingsMock } from '../data/settingsMock'
import type {
  NotificationSettings,
  OperationSettings,
  RentalSettings,
  ReservationSettings,
  SystemSettings,
} from '../types'

export interface SettingsService {
  getSystemSettings: () => Promise<SystemSettings>
  updateSystemSettings: (payload: SystemSettings) => Promise<SystemSettings>
  getReservationSettings: () => Promise<ReservationSettings>
  updateReservationSettings: (payload: ReservationSettings) => Promise<ReservationSettings>
  getRentalSettings: () => Promise<RentalSettings>
  updateRentalSettings: (payload: RentalSettings) => Promise<RentalSettings>
  getNotificationSettings: () => Promise<NotificationSettings>
  updateNotificationSettings: (payload: NotificationSettings) => Promise<NotificationSettings>
  getOperationSettings: () => Promise<OperationSettings>
  updateOperationSettings: (payload: OperationSettings) => Promise<OperationSettings>
}

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))

let settings = structuredClone(settingsMock)

function requireText(value: string) {
  if (!value.trim()) throw new Error('INVALID_SETTINGS')
}

export const settingsService: SettingsService = {
  async getSystemSettings() {
    await wait()
    return structuredClone(settings.basic)
  },
  async updateSystemSettings(payload) {
    await wait()
    requireText(payload.systemName)
    requireText(payload.adminEmail)
    settings = { ...settings, basic: structuredClone(payload) }
    return structuredClone(settings.basic)
  },
  async getReservationSettings() {
    await wait()
    return structuredClone(settings.reservation)
  },
  async updateReservationSettings(payload) {
    await wait()
    if (payload.maxCount < 1) throw new Error('INVALID_SETTINGS')
    settings = { ...settings, reservation: structuredClone(payload) }
    return structuredClone(settings.reservation)
  },
  async getRentalSettings() {
    await wait()
    return structuredClone(settings.rental)
  },
  async updateRentalSettings(payload) {
    await wait()
    if (payload.defaultDays < 1) throw new Error('INVALID_SETTINGS')
    settings = { ...settings, rental: structuredClone(payload) }
    return structuredClone(settings.rental)
  },
  async getNotificationSettings() {
    await wait()
    return structuredClone(settings.notification)
  },
  async updateNotificationSettings(payload) {
    await wait()
    settings = { ...settings, notification: structuredClone(payload) }
    return structuredClone(settings.notification)
  },
  async getOperationSettings() {
    await wait()
    return structuredClone(settings.operation)
  },
  async updateOperationSettings(payload) {
    await wait()
    if (payload.maintenanceMode) requireText(payload.maintenanceMessage)
    settings = { ...settings, operation: structuredClone(payload) }
    return structuredClone(settings.operation)
  },
}

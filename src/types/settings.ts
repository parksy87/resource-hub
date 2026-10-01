export type SettingsSectionId = 'basic' | 'reservation' | 'rental' | 'notification' | 'operation'

export type ReservationApprovalMode = 'AUTO' | 'MANUAL'

export type ReservationWindow = 'SAME_DAY' | '7D' | '30D' | '90D'

export interface SystemSettings {
  systemName: string
  adminEmail: string
  phone: string
  organizationName: string
  description: string
  pageSize: number
}

export interface ReservationSettings {
  enabled: boolean
  approvalMode: ReservationApprovalMode
  window: ReservationWindow
  maxCount: number
  cancelEnabled: boolean
  cancelBeforeHours: number
  allowOverlap: boolean
}

export interface RentalSettings {
  enabled: boolean
  defaultDays: number
  maxExtensions: number
  overdueEnabled: boolean
  overdueNoticeHours: number
  returnApprovalRequired: boolean
  autoInspectionAfterReturn: boolean
}

export interface NotificationSettings {
  reservationRequested: boolean
  reservationApproved: boolean
  reservationRejected: boolean
  reservationCancelled: boolean
  rentalStarted: boolean
  returnDue: boolean
  overdue: boolean
  inspectionCompleted: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  systemEnabled: boolean
}

export interface OperationSettings {
  operating: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  signupAllowed: boolean
  userReservationAllowed: boolean
  userRentalAllowed: boolean
  adminOnlyResourceCreate: boolean
  maskPersonalInfo: boolean
}

export interface SettingsBundle {
  basic: SystemSettings
  reservation: ReservationSettings
  rental: RentalSettings
  notification: NotificationSettings
  operation: OperationSettings
}

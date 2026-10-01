import type { SettingsSectionId } from '../types'

export const settingsSections: { id: SettingsSectionId; label: string; description: string }[] = [
  { id: 'basic', label: '기본 설정', description: '시스템 이름과 연락처, 목록 표시 건수를 관리합니다.' },
  { id: 'reservation', label: '예약 설정', description: '예약 승인, 기간, 취소와 중복 예약 정책을 관리합니다.' },
  { id: 'rental', label: '대여·반납 설정', description: '대여 기간, 연장, 연체와 반납 정책을 관리합니다.' },
  { id: 'notification', label: '알림 설정', description: '알림 항목과 발송 채널 사용 여부를 관리합니다.' },
  { id: 'operation', label: '운영 설정', description: '시스템 운영, 점검 모드와 사용자 이용 허용을 관리합니다.' },
]

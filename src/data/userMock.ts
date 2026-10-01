import { reservationUsers } from './reservationMock'
import type { User, UserRole, UserStatus } from '../types'
import type { UserStatusHistory } from '../types'

interface UserSeed {
  id: number
  role: UserRole
  status: UserStatus
  joinedAt: string
  lastLoginAt?: string
  employeeNumber?: string
  position?: string
}

const extraUsers: User[] = [
  {
    id: 109,
    employeeNumber: 'EMP-109',
    name: '김관리',
    email: 'admin.kim@resource.co.kr',
    phone: '010-1000-2001',
    department: 'IT운영팀',
    position: '시스템 관리자',
    role: 'ADMIN',
    status: 'ACTIVE',
    profileImageUrl: null,
    lastLoginAt: '2026-09-30T09:10:00+09:00',
    lastUsedAt: '2026-09-30T09:10:00+09:00',
    createdAt: '2025-03-02T09:00:00+09:00',
    updatedAt: '2026-09-30T09:10:00+09:00',
  },
  {
    id: 110,
    employeeNumber: 'EMP-110',
    name: '서민재',
    email: 'minjae.seo@resource.co.kr',
    phone: '010-5521-8830',
    department: '총무팀',
    position: '운영 담당',
    role: 'MANAGER',
    status: 'ACTIVE',
    profileImageUrl: null,
    lastLoginAt: '2026-09-29T18:40:00+09:00',
    lastUsedAt: null,
    createdAt: '2025-11-12T09:00:00+09:00',
    updatedAt: '2026-09-29T18:40:00+09:00',
  },
  {
    id: 111,
    employeeNumber: 'EMP-111',
    name: '문하준',
    email: 'hajun.moon@resource.co.kr',
    phone: '010-7780-2214',
    department: '인사팀',
    position: null,
    role: 'USER',
    status: 'WITHDRAWN',
    profileImageUrl: null,
    lastLoginAt: '2026-06-18T11:20:00+09:00',
    lastUsedAt: '2026-06-02T15:00:00+09:00',
    createdAt: '2024-08-01T09:00:00+09:00',
    updatedAt: '2026-07-01T10:00:00+09:00',
  },
  {
    id: 112,
    employeeNumber: 'EMP-112',
    name: '서지우',
    email: 'jiwoo.seo@resource.co.kr',
    phone: '010-4419-7602',
    department: '브랜드전략팀',
    position: null,
    role: 'USER',
    status: 'ACTIVE',
    profileImageUrl: null,
    lastLoginAt: '2026-09-27T08:15:00+09:00',
    lastUsedAt: null,
    createdAt: '2026-09-12T09:00:00+09:00',
    updatedAt: '2026-09-27T08:15:00+09:00',
  },
]

const accountSeed: UserSeed[] = [
  { id: 101, role: 'USER', status: 'ACTIVE', joinedAt: '2024-02-12T09:00:00', lastLoginAt: '2026-09-30T08:12:00' },
  { id: 102, role: 'USER', status: 'ACTIVE', joinedAt: '2024-05-20T09:00:00', lastLoginAt: '2026-09-30T16:40:00' },
  { id: 103, role: 'USER', status: 'ACTIVE', joinedAt: '2024-09-03T09:00:00', lastLoginAt: '2026-09-29T19:05:00' },
  { id: 104, role: 'USER', status: 'SUSPENDED', joinedAt: '2025-01-16T09:00:00', lastLoginAt: '2026-09-20T13:22:00' },
  { id: 105, role: 'USER', status: 'ACTIVE', joinedAt: '2025-04-08T09:00:00', lastLoginAt: '2026-09-28T10:18:00' },
  { id: 106, role: 'USER', status: 'ACTIVE', joinedAt: '2025-06-11T09:00:00', lastLoginAt: '2026-09-26T09:44:00' },
  { id: 107, role: 'USER', status: 'ACTIVE', joinedAt: '2025-08-19T09:00:00', lastLoginAt: '2026-09-29T17:02:00' },
  { id: 108, role: 'USER', status: 'ACTIVE', joinedAt: '2026-01-06T09:00:00', lastLoginAt: '2026-09-29T15:30:00' },
]

export const usersMock: User[] = [
  ...accountSeed.map((seed) => {
    const profile = reservationUsers.find((user) => user.id === seed.id)
    return {
      id: seed.id,
      employeeNumber: seed.employeeNumber ?? `EMP-${seed.id}`,
      name: profile?.name ?? '사용자',
      email: profile?.email ?? `user${seed.id}@resource.co.kr`,
      phone: profile?.phone ?? null,
      department: profile?.organization ?? '미소속',
      position: seed.position ?? null,
      role: seed.role,
      status: seed.status,
      profileImageUrl: null,
      lastLoginAt: seed.lastLoginAt ? `${seed.lastLoginAt}+09:00` : null,
      lastUsedAt: null,
      createdAt: `${seed.joinedAt}+09:00`,
      updatedAt: seed.lastLoginAt ? `${seed.lastLoginAt}+09:00` : `${seed.joinedAt}+09:00`,
    }
  }),
  ...extraUsers,
]

export const userStatusHistoriesMock: UserStatusHistory[] = [
  {
    id: 1,
    userId: 104,
    fromStatus: 'ACTIVE',
    toStatus: 'SUSPENDED',
    reason: '반납 기한을 반복해서 초과했습니다.',
    changedAt: '2026-09-21T11:00:00+09:00',
    processorName: '김관리',
  },
  {
    id: 2,
    userId: 111,
    fromStatus: 'ACTIVE',
    toStatus: 'WITHDRAWN',
    reason: '퇴사에 따른 계정 탈퇴 처리',
    changedAt: '2026-07-01T10:00:00+09:00',
    processorName: '김관리',
  },
]

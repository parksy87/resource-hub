import { Badge } from '../ui'
import { userRoleMeta, userStatusMeta } from '../../config/user'
import type { UserRole, UserStatus } from '../../types'

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const meta = userStatusMeta[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  const meta = userRoleMeta[role]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

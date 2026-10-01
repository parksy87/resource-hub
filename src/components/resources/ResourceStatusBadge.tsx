import { Badge } from '../ui'
import { resourceStatusMeta } from '../../config/resource'
import type { ResourceStatus } from '../../types'

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  const meta = resourceStatusMeta[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

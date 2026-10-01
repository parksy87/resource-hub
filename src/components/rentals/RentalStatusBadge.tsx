import { rentalStatusMeta } from '../../config/rental'
import type { RentalStatus } from '../../types'
import { Badge } from '../ui'

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const meta = rentalStatusMeta[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

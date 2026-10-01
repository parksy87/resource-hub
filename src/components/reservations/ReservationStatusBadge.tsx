import { reservationStatusMeta } from '../../config/reservation'
import type { ReservationStatus } from '../../types'
import { Badge } from '../ui'

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const meta = reservationStatusMeta[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

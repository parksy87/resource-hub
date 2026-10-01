import { Link } from 'react-router-dom'
import { Laptop } from 'lucide-react'
import { reserveBlockedReason, userStatusMeta } from '../../../config/userResource'
import { ROUTES } from '../../../routes/paths'
import type { ResourceListItem } from '../../../types'
import { Badge, Button } from '../../ui'

export function ResourceVisual({ imageUrl, alt = '' }: { imageUrl: string | null; alt?: string }) {
  if (imageUrl) return <img src={imageUrl} alt={alt} />
  return (
    <span aria-hidden="true">
      <Laptop size={28} />
    </span>
  )
}

export function ResourceReserveLink({ item }: { item: Pick<ResourceListItem, 'id' | 'status'> }) {
  if (item.status === 'AVAILABLE') {
    return (
      <Link className="ui-button ui-button--primary ui-button--sm" to={`${ROUTES.user.reservations}?resourceId=${item.id}`}>
        예약 신청
      </Link>
    )
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled>
      예약 불가
    </Button>
  )
}

export function ResourceStatusLine({ status }: { status: ResourceListItem['status'] }) {
  const meta = userStatusMeta(status)
  return (
    <p className="user-resource-status">
      <Badge tone={meta.tone}>{meta.label}</Badge>
      <span>{reserveBlockedReason[status] || '예약 가능'}</span>
    </p>
  )
}

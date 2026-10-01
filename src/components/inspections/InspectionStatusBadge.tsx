import { inspectionResultMeta, inspectionStatusMeta } from '../../config/inspection'
import type { InspectionResult, InspectionStatus } from '../../types'
import { Badge } from '../ui'

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const meta = inspectionStatusMeta[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

export function InspectionResultBadge({ result }: { result: InspectionResult | null }) {
  if (!result) return <span className="inspection-muted">-</span>
  const meta = inspectionResultMeta[result]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

import { Construction } from 'lucide-react'
import { Button, EmptyState, ErrorState, Loading, StateDisplay } from '../ui'

export type AdminPageStateType = 'loading' | 'empty' | 'error' | 'unauthorized' | 'coming-soon'

interface AdminPageStateProps {
  type: AdminPageStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminPageState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: AdminPageStateProps) {
  if (type === 'loading') {
    return <Loading size="lg" label={title ?? '데이터를 불러오는 중입니다'} />
  }

  if (type === 'empty') {
    return (
      <EmptyState
        title={title ?? '표시할 데이터가 없습니다'}
        description={description ?? '새 항목을 등록하면 이곳에서 확인할 수 있습니다.'}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    )
  }

  if (type === 'error') {
    return (
      <ErrorState
        title={title ?? '정보를 불러오지 못했습니다'}
        description={description ?? '잠시 후 다시 시도해주세요.'}
        actionLabel={actionLabel ?? '다시 시도'}
        onAction={onAction}
      />
    )
  }

  if (type === 'unauthorized') {
    return (
      <StateDisplay
        variant="unauthorized"
        title={title ?? '접근 권한이 없습니다'}
        description={description ?? '이 메뉴를 이용하려면 관리자 권한이 필요합니다.'}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    )
  }

  return (
    <div className="admin-coming-soon">
      <span className="admin-coming-soon__icon"><Construction size={26} /></span>
      <span className="admin-coming-soon__eyebrow">COMING SOON</span>
      <h2>{title ?? '페이지를 준비하고 있습니다'}</h2>
      <p>{description ?? '관리자 기본 구조가 완성되었습니다. 이 기능은 다음 개발 단계에서 연결됩니다.'}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

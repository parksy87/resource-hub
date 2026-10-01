import type { ReactNode } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleX,
  Inbox,
  LoaderCircle,
  SearchX,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useUiStore, type ToastTone } from '../../stores/uiStore'
import { Button } from './Button'
import { cn } from '../../utils/cn'

const toastIcons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <CircleX size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <AlertCircle size={20} />,
}

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts)
  const removeToast = useUiStore((state) => state.removeToast)

  return (
    <div className="ui-toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn('ui-toast', `ui-toast--${toast.tone}`)} role="status">
          <span className="ui-toast__icon">{toastIcons[toast.tone]}</span>
          <div className="ui-toast__content">
            <strong>{toast.title}</strong>
            {toast.description && <p>{toast.description}</p>}
          </div>
          <button
            className="ui-icon-button ui-toast__close"
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="알림 닫기"
          >
            <X size={17} />
          </button>
        </div>
      ))}
    </div>
  )
}

export interface LoadingProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ label = '불러오는 중입니다', size = 'md' }: LoadingProps) {
  return (
    <div className={cn('ui-loading', `ui-loading--${size}`)} role="status">
      <LoaderCircle className="ui-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export type StateVariant =
  | 'empty'
  | 'search-empty'
  | 'error'
  | 'success'
  | 'unauthorized'
  | 'unavailable'

const stateIcons: Record<StateVariant, ReactNode> = {
  empty: <Inbox size={28} />,
  'search-empty': <SearchX size={28} />,
  error: <CircleX size={28} />,
  success: <CheckCircle2 size={28} />,
  unauthorized: <ShieldAlert size={28} />,
  unavailable: <Ban size={28} />,
}

export interface StateDisplayProps {
  variant?: StateVariant
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export function StateDisplay({
  variant = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: StateDisplayProps) {
  return (
    <div className={cn('ui-state', `ui-state--${variant}`, compact && 'ui-state--compact')}>
      <span className="ui-state__icon">{stateIcons[variant]}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function EmptyState(props: Omit<StateDisplayProps, 'variant'>) {
  return <StateDisplay variant="empty" {...props} />
}

export function ErrorState(props: Omit<StateDisplayProps, 'variant'>) {
  return <StateDisplay variant="error" {...props} />
}

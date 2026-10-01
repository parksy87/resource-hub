import type { ReactNode } from 'react'

export interface TooltipProps {
  label: string
  children: ReactNode
  position?: 'top' | 'bottom'
}

export function Tooltip({ label, children, position = 'bottom' }: TooltipProps) {
  return (
    <span className={`ui-tooltip ui-tooltip--${position}`}>
      {children}
      <span className="ui-tooltip__content" role="tooltip">
        {label}
      </span>
    </span>
  )
}

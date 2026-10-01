import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'ui-button',
        `ui-button--${variant}`,
        `ui-button--${size}`,
        fullWidth && 'ui-button--full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="ui-spin" size={18} /> : leadingIcon}
      <span>{children}</span>
      {!isLoading && trailingIcon}
    </button>
  )
}

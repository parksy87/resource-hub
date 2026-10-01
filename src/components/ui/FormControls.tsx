import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

interface FieldShellProps {
  id?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function FieldShell({ id, label, hint, error, required, className, children }: FieldShellProps) {
  return (
    <div className={cn('ui-field', className)}>
      {label && (
        <label className="ui-field__label" htmlFor={id}>
          {label}
          {required && <span className="ui-field__required">필수</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span className={cn('ui-field__message', error && 'ui-field__message--error')}>
          {error ?? hint}
        </span>
      )}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required, leadingIcon, className, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required}>
      <div className={cn('ui-input-wrap', error && 'is-error', props.disabled && 'is-disabled')}>
        {leadingIcon && <span className="ui-input-wrap__icon">{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn('ui-input', className)}
          {...props}
        />
      </div>
    </FieldShell>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, required, className, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn('ui-textarea', error && 'is-error', className)}
        {...props}
      />
    </FieldShell>
  )
})

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, hint, error, required, options, placeholder, className, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required}>
      <div className={cn('ui-select-wrap', error && 'is-error')}>
        <select
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn('ui-select', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
    </FieldShell>
  )
})

export interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export function Checkbox({ label, description, className, ...props }: ChoiceProps) {
  return (
    <label className={cn('ui-choice', className)}>
      <input type="checkbox" className="ui-choice__control" {...props} />
      <span>
        <span className="ui-choice__label">{label}</span>
        {description && <span className="ui-choice__description">{description}</span>}
      </span>
    </label>
  )
}

export function Radio({ label, description, className, ...props }: ChoiceProps) {
  return (
    <label className={cn('ui-choice', className)}>
      <input type="radio" className="ui-choice__control" {...props} />
      <span>
        <span className="ui-choice__label">{label}</span>
        {description && <span className="ui-choice__description">{description}</span>}
      </span>
    </label>
  )
}

export type DatePickerProps = Omit<InputProps, 'type' | 'leadingIcon'>

export function DatePicker(props: DatePickerProps) {
  return <Input type="date" leadingIcon={<CalendarDays size={17} />} {...props} />
}

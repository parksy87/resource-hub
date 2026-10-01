import { cn } from '../../utils/cn'

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn('settings-toggle', checked && 'is-on')}
      onClick={() => onChange(!checked)}
    >
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className="settings-toggle__track" aria-hidden="true"><span /></span>
    </button>
  )
}

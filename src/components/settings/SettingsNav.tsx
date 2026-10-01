import { settingsSections } from '../../config/settings'
import type { SettingsSectionId } from '../../types'
import { Select } from '../ui'

interface SettingsNavProps {
  section: SettingsSectionId
  onSelect: (section: SettingsSectionId) => void
}

export function SettingsNav({ section, onSelect }: SettingsNavProps) {
  return (
    <>
      <nav className="settings-nav" aria-label="설정 메뉴">
        {settingsSections.map((item) => (
          <button
            key={item.id}
            type="button"
            id={`settings-tab-${item.id}`}
            role="tab"
            aria-selected={section === item.id}
            aria-controls="settings-panel"
            className={section === item.id ? 'is-active' : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="settings-nav-select">
        <Select
          aria-label="설정 메뉴"
          value={section}
          onChange={(event) => onSelect(event.target.value as SettingsSectionId)}
          options={settingsSections.map((item) => ({ label: item.label, value: item.id }))}
        />
      </div>
    </>
  )
}

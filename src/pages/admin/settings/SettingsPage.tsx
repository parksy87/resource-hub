import { useEffect, useState } from 'react'
import {
  BasicSettingsForm,
  NotificationSettingsForm,
  OperationSettingsForm,
  RentalSettingsForm,
  ReservationSettingsForm,
} from '../../../components/settings/SettingsForms'
import { SettingsNav } from '../../../components/settings/SettingsNav'
import { settingsSections } from '../../../config/settings'
import { Button, ErrorState, Loading, Modal } from '../../../components/ui'
import { useSettings } from '../../../hooks/useSettings'
import { settingsService } from '../../../services/settingsService'
import { useUiStore } from '../../../stores/uiStore'
import type { SettingsBundle, SettingsSectionId } from '../../../types'
import { validateBasic, validateOperation, validateRental, validateReservation } from '../../../utils/settings'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

function sameSection(bundle: SettingsBundle, draft: SettingsBundle, section: SettingsSectionId) {
  return JSON.stringify(bundle[section]) === JSON.stringify(draft[section])
}

function validateSection(bundle: SettingsBundle, section: SettingsSectionId) {
  if (section === 'basic') return validateBasic(bundle.basic)
  if (section === 'reservation') return validateReservation(bundle.reservation)
  if (section === 'rental') return validateRental(bundle.rental)
  if (section === 'operation') return validateOperation(bundle.operation)
  return {}
}

async function saveSection(bundle: SettingsBundle, section: SettingsSectionId): Promise<SettingsBundle> {
  if (section === 'basic') return { ...bundle, basic: await settingsService.updateSystemSettings(bundle.basic) }
  if (section === 'reservation') return { ...bundle, reservation: await settingsService.updateReservationSettings(bundle.reservation) }
  if (section === 'rental') return { ...bundle, rental: await settingsService.updateRentalSettings(bundle.rental) }
  if (section === 'notification') return { ...bundle, notification: await settingsService.updateNotificationSettings(bundle.notification) }
  return { ...bundle, operation: await settingsService.updateOperationSettings(bundle.operation) }
}

function SettingsEditor({ initial }: { initial: SettingsBundle }) {
  const addToast = useUiStore((state) => state.addToast)
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [section, setSection] = useState<SettingsSectionId>('basic')
  const [pendingSection, setPendingSection] = useState<SettingsSectionId | null>(null)
  const [confirmSave, setConfirmSave] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const dirty = !sameSection(saved, draft, section)
  const current = settingsSections.find((item) => item.id === section) ?? settingsSections[0]

  useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function patch<K extends SettingsSectionId>(key: K, partial: Partial<SettingsBundle[K]>) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: { ...currentDraft[key], ...partial },
    }))
    setErrors({})
    setSaveStatus('idle')
  }

  function requestSection(next: SettingsSectionId) {
    if (next === section || saveStatus === 'saving') return
    if (dirty) {
      setPendingSection(next)
      return
    }
    setSection(next)
    setErrors({})
    setSaveStatus('idle')
  }

  function discardAndMove() {
    if (!pendingSection) return
    setDraft((currentDraft) => ({ ...currentDraft, [section]: structuredClone(saved[section]) }))
    setSection(pendingSection)
    setPendingSection(null)
    setErrors({})
    setSaveStatus('idle')
  }

  function requestSave() {
    const nextErrors = validateSection(draft, section)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSaveStatus('error')
      return
    }
    if (!dirty) {
      addToast({ tone: 'info', title: '변경된 설정이 없습니다.' })
      return
    }
    setConfirmSave(true)
  }

  async function confirmAndSave() {
    setSaveStatus('saving')
    try {
      const next = await saveSection(draft, section)
      setSaved(next)
      setDraft(next)
      setSaveStatus('success')
      setConfirmSave(false)
      addToast({ tone: 'success', title: '설정이 저장되었습니다.' })
    } catch {
      setSaveStatus('error')
      setConfirmSave(false)
      addToast({ tone: 'error', title: '설정을 저장하지 못했습니다.' })
    }
  }

  return (
    <div className="settings-page">
      <SettingsNav section={section} onSelect={requestSection} />
      <section className="settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${section}`} id="settings-panel">
        <header>
          <h3>{current.label}</h3>
          <p>{current.description}</p>
        </header>
        {dirty && <p className="settings-banner is-dirty" role="status">저장하지 않은 변경사항이 있습니다.</p>}
        {saveStatus === 'success' && <p className="settings-banner is-success" role="status">설정이 저장되었습니다.</p>}
        {saveStatus === 'error' && Object.keys(errors).length > 0 && (
          <p className="settings-banner is-error" role="alert">입력값을 확인하고 다시 저장해주세요.</p>
        )}
        {saveStatus === 'error' && Object.keys(errors).length === 0 && (
          <p className="settings-banner is-error" role="alert">설정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        )}
        {section === 'basic' && <BasicSettingsForm values={draft.basic} errors={errors} onChange={(partial) => patch('basic', partial)} />}
        {section === 'reservation' && <ReservationSettingsForm values={draft.reservation} errors={errors} onChange={(partial) => patch('reservation', partial)} />}
        {section === 'rental' && <RentalSettingsForm values={draft.rental} errors={errors} onChange={(partial) => patch('rental', partial)} />}
        {section === 'notification' && <NotificationSettingsForm values={draft.notification} onChange={(partial) => patch('notification', partial)} />}
        {section === 'operation' && <OperationSettingsForm values={draft.operation} errors={errors} onChange={(partial) => patch('operation', partial)} />}
        <div className="settings-actions">
          <Button onClick={requestSave} isLoading={saveStatus === 'saving'} disabled={saveStatus === 'saving'}>저장</Button>
        </div>
      </section>
      <Modal
        isOpen={pendingSection !== null}
        onClose={() => setPendingSection(null)}
        title="변경된 설정이 저장되지 않았습니다. 이동하시겠습니까?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingSection(null)}>닫기</Button>
            <Button onClick={discardAndMove}>이동</Button>
          </>
        }
      >
        <p className="settings-modal-copy">이동하면 현재 영역의 변경 내용은 저장되지 않습니다.</p>
      </Modal>
      <Modal
        isOpen={confirmSave}
        onClose={() => { if (saveStatus !== 'saving') setConfirmSave(false) }}
        title="설정을 저장하시겠습니까?"
        description="확인하면 현재 설정 영역의 값이 저장됩니다."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmSave(false)} disabled={saveStatus === 'saving'}>닫기</Button>
            <Button onClick={() => void confirmAndSave()} isLoading={saveStatus === 'saving'}>저장</Button>
          </>
        }
      >
        <p className="settings-modal-copy">{current.label}의 변경 내용을 저장합니다.</p>
      </Modal>
    </div>
  )
}

export default function SettingsPage() {
  const { data, status, error, refetch } = useSettings()

  return (
    <div className="resource-form-page settings-screen">
      <div className="resource-page-heading">
        <div>
          <span>SETTINGS</span>
          <h2>시스템 설정</h2>
          <p>시스템 운영 설정을 관리합니다.</p>
        </div>
      </div>
      {status === 'loading' && <Loading size="lg" label="시스템 설정을 불러오는 중입니다" />}
      {status === 'error' && (
        <ErrorState title="설정을 불러오지 못했습니다" description={error ?? undefined} actionLabel="다시 시도" onAction={refetch} />
      )}
      {status === 'success' && data && <SettingsEditor key={JSON.stringify(data.basic)} initial={data} />}
    </div>
  )
}

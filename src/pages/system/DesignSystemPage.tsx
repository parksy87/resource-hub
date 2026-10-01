import { useState } from 'react'
import {
  Bell,
  Boxes,
  CalendarClock,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
  Settings,
  Trash2,
  UserRound,
} from 'lucide-react'
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  ConfirmModal,
  DatePicker,
  Dropdown,
  EmptyState,
  ErrorState,
  FileUpload,
  Input,
  Loading,
  Modal,
  Pagination,
  Radio,
  SearchFilter,
  Select,
  StateDisplay,
  Table,
  Tabs,
  Textarea,
  type TableColumn,
} from '../../components/ui'
import { useUiStore } from '../../stores/uiStore'
import type { ResourceStatus } from '../../types'

interface SampleResource {
  id: number
  code: string
  name: string
  category: string
  location: string
  status: ResourceStatus
  manager: string
}

const resources: SampleResource[] = [
  { id: 1, code: 'NB-2026-0142', name: 'MacBook Pro 14″ M4', category: '노트북', location: '본관 3층', status: 'AVAILABLE', manager: '김민준' },
  { id: 2, code: 'CAM-2026-0087', name: 'Sony Alpha 7 IV', category: '카메라', location: '미디어실', status: 'RESERVED', manager: '박서연' },
  { id: 3, code: 'MT-2025-0003', name: '컨퍼런스룸 A', category: '회의실', location: '별관 2층', status: 'RENTED', manager: '이지훈' },
  { id: 4, code: 'PJ-2024-0021', name: 'Epson EB-L630U', category: '빔프로젝터', location: '장비보관실', status: 'INSPECTION', manager: '최유진' },
]

const statusMeta: Record<ResourceStatus, { label: string; tone: 'green' | 'blue' | 'purple' | 'yellow' | 'neutral' }> = {
  AVAILABLE: { label: '사용 가능', tone: 'green' },
  RESERVED: { label: '예약됨', tone: 'blue' },
  RENTED: { label: '대여 중', tone: 'purple' },
  INSPECTION: { label: '점검 중', tone: 'yellow' },
  DISPOSED: { label: '폐기', tone: 'neutral' },
}

const columns: TableColumn<SampleResource>[] = [
  { key: 'code', header: '자원번호', render: (row) => <strong className="demo-table-code">{row.code}</strong> },
  { key: 'name', header: '자원명', render: (row) => row.name },
  { key: 'category', header: '카테고리', render: (row) => row.category },
  { key: 'location', header: '위치', render: (row) => row.location },
  { key: 'status', header: '상태', render: (row) => <Badge tone={statusMeta[row.status].tone} dot>{statusMeta[row.status].label}</Badge> },
  { key: 'manager', header: '담당자', render: (row) => row.manager },
  { key: 'action', header: '관리', align: 'center', width: '70px', render: () => <button className="demo-more-button" type="button" aria-label="관리 메뉴"><MoreHorizontal size={18} /></button> },
]

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('components')
  const [activeTab, setActiveTab] = useState('basic')
  const [page, setPage] = useState(2)
  const [keyword, setKeyword] = useState('')
  const [modal, setModal] = useState<'edit' | 'delete' | null>(null)
  const addToast = useUiStore((state) => state.addToast)

  return (
    <div className="design-page">
      <header className="design-header">
        <a className="design-brand" href="/">
          <span><Boxes size={23} /></span>
          <div><strong>Resource Hub</strong><small>Design foundation · v0.1</small></div>
        </a>
        <div className="design-header__actions">
          <Badge tone="blue" dot>프론트엔드 기반 구축</Badge>
          <button type="button" aria-label="알림"><Bell size={19} /></button>
          <span className="design-avatar">PS</span>
        </div>
      </header>

      <main>
        <section className="design-hero">
          <Breadcrumb items={[{ label: 'Resource Hub', href: '/' }, { label: '공통 디자인 시스템' }]} />
          <div className="design-hero__content">
            <div>
              <span className="design-eyebrow">FOUNDATION · PHASE 01</span>
              <h1>업무는 복잡해도,<br />인터페이스는 명확하게.</h1>
              <p>관리자와 사용자가 같은 언어로 자원을 관리하도록 설계한 확장 가능한 UI 기반입니다.</p>
            </div>
            <div className="design-hero__metrics" aria-label="프로젝트 기반 정보">
              <div><strong>21</strong><span>공통 UI</span></div>
              <div><strong>10</strong><span>도메인 모델</span></div>
              <div><strong>AA</strong><span>접근성 목표</span></div>
            </div>
          </div>
        </section>

        <nav className="design-section-nav" aria-label="디자인 시스템 섹션">
          {[
            ['foundation', 'Foundation'],
            ['components', 'Components'],
            ['states', 'Service states'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={activeSection === id ? 'is-active' : ''} onClick={() => setActiveSection(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="design-content">
          {activeSection === 'foundation' && (
            <>
              <SectionHeading number="01" title="Foundation" description="일관된 업무 화면을 만드는 색상, 글꼴, 간격의 기준입니다." />
              <div className="design-grid design-grid--2">
                <Card title="Brand & semantic color" description="정보의 중요도와 상태를 색상만으로 구분하지 않습니다.">
                  <div className="color-swatches">
                    {[
                      ['Primary', '#256FE9', 'color-brand-600'],
                      ['Slate', '#202938', 'color-slate-800'],
                      ['Success', '#10B981', 'color-success-500'],
                      ['Warning', '#F59E0B', 'color-warning-500'],
                      ['Danger', '#F43F5E', 'color-danger-500'],
                    ].map(([name, color, token]) => (
                      <div key={name}><span style={{ background: color }} /><strong>{name}</strong><small>{token}</small></div>
                    ))}
                  </div>
                </Card>
                <Card title="Typography" description="한국어 업무 화면의 가독성을 우선합니다.">
                  <div className="type-scale">
                    <div><span>Display / 30</span><strong>자원 운영 현황</strong></div>
                    <div><span>Heading / 20</span><strong>최근 예약 내역</strong></div>
                    <div><span>Body / 14</span><p>필요한 자원을 빠르게 검색하고 예약하세요.</p></div>
                    <div><span>Caption / 12</span><small>2026. 09. 30 업데이트</small></div>
                  </div>
                </Card>
              </div>
              <Card title="Status language" description="서비스 전 영역에서 같은 상태 이름과 컬러를 사용합니다.">
                <div className="badge-row">
                  <Badge tone="green" dot>사용 가능</Badge><Badge tone="blue" dot>예약됨</Badge>
                  <Badge tone="purple" dot>대여 중</Badge><Badge tone="yellow" dot>점검 중</Badge>
                  <Badge tone="neutral" dot>폐기</Badge><Badge tone="red" dot>반납지연</Badge>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'components' && (
            <>
              <SectionHeading number="02" title="Core components" description="도메인과 분리해 관리자·사용자 화면 어디서든 재사용할 수 있습니다." />
              <div className="design-grid design-grid--2">
                <Card title="Button" description="명확한 행동 우선순위를 제공합니다.">
                  <div className="component-row">
                    <Button>자원 등록</Button>
                    <Button variant="secondary">예약 승인</Button>
                    <Button variant="outline" leadingIcon={<Download size={17} />}>내보내기</Button>
                    <Button variant="ghost">취소</Button>
                    <Button variant="danger" leadingIcon={<Trash2 size={17} />} onClick={() => setModal('delete')}>삭제</Button>
                  </div>
                  <div className="component-row">
                    <Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button>
                    <Button isLoading>저장 중</Button><Button disabled>비활성</Button>
                  </div>
                </Card>
                <Card title="Badge & dropdown" description="현재 상태와 보조 작업을 간결하게 표시합니다.">
                  <div className="badge-row">
                    <Badge tone="green" dot>사용 가능</Badge><Badge tone="blue">승인</Badge>
                    <Badge tone="yellow">점검예정</Badge><Badge tone="red">반려</Badge>
                  </div>
                  <Dropdown
                    label="관리 작업"
                    items={[
                      { id: 'profile', label: '담당자 보기', icon: <UserRound size={16} /> },
                      { id: 'schedule', label: '예약 일정', icon: <CalendarClock size={16} /> },
                      { id: 'settings', label: '설정 변경', icon: <Settings size={16} /> },
                      { id: 'delete', label: '삭제', icon: <Trash2 size={16} />, danger: true },
                    ]}
                    onSelect={(id) => id === 'delete' && setModal('delete')}
                  />
                </Card>
              </div>

              <Card title="Form controls" description="필수 여부, 도움말, 오류를 입력 항목 가까이에서 전달합니다.">
                <div className="form-grid">
                  <Input label="자원명" required placeholder="자원명을 입력하세요" />
                  <Input label="자원번호" value="NB-2026-0142" readOnly hint="등록 후 변경할 수 없습니다." />
                  <Select label="카테고리" placeholder="카테고리 선택" options={[{ label: '노트북', value: 'notebook' }, { label: '태블릿', value: 'tablet' }]} />
                  <DatePicker label="구입일" defaultValue="2026-09-30" />
                  <Input label="담당자" defaultValue="김민준" error="담당자를 다시 확인해주세요." />
                  <div className="choice-group">
                    <span className="ui-field__label">예약 허용</span>
                    <div><Radio name="reservable" label="허용" defaultChecked /><Radio name="reservable" label="허용 안 함" /></div>
                  </div>
                  <div className="form-grid__wide"><Textarea label="설명" placeholder="자원의 특징과 이용 시 주의사항을 입력하세요." /></div>
                  <div className="form-grid__wide"><Checkbox label="장기 미사용 자원 알림을 받습니다." description="30일 이상 이용 기록이 없을 때 관리자에게 알립니다." /></div>
                </div>
              </Card>

              <SearchFilter keyword={keyword} onKeywordChange={setKeyword} onSearch={() => addToast({ tone: 'info', title: '검색 조건을 적용했습니다.', description: keyword || '전체 자원을 조회합니다.' })} onReset={() => setKeyword('')} placeholder="자원명 또는 자원번호">
                <Select aria-label="카테고리" options={[{ label: '전체 카테고리', value: 'all' }, { label: '노트북', value: 'notebook' }]} />
                <Select aria-label="상태" options={[{ label: '전체 상태', value: 'all' }, { label: '사용 가능', value: 'available' }]} />
              </SearchFilter>

              <Card padding="none">
                <div className="demo-table-header"><div><strong>자원 목록</strong><span>총 128개</span></div><Button size="sm" onClick={() => setModal('edit')}>자원 등록</Button></div>
                <Table columns={columns} data={resources} rowKey={(row) => row.id} caption="자원 목록 예시" />
                <div className="demo-table-footer"><span>21–40 / 128개</span><Pagination page={page} totalPages={7} onChange={setPage} /></div>
              </Card>

              <div className="design-grid design-grid--2">
                <Card title="Tabs" description="관련 정보를 한 화면 안에서 구분합니다.">
                  <Tabs items={[{ id: 'basic', label: '기본정보' }, { id: 'reservation', label: '예약 현황', count: 3 }, { id: 'inspection', label: '점검 이력', count: 8 }]} value={activeTab} onChange={setActiveTab} />
                  <p className="tab-preview">선택된 탭: <strong>{activeTab}</strong></p>
                </Card>
                <Card title="File upload" description="현재 단계에서는 로컬 파일 선택 상태만 관리합니다.">
                  <FileUpload />
                </Card>
              </div>

              <Card title="Overlay & feedback" description="위험 작업은 재확인하고 처리 결과는 즉시 안내합니다.">
                <div className="component-row">
                  <Button variant="outline" onClick={() => setModal('edit')}>Modal 열기</Button>
                  <Button variant="outline" onClick={() => setModal('delete')}>Confirm modal</Button>
                  <Button variant="outline" onClick={() => addToast({ tone: 'success', title: '저장했습니다.', description: '변경한 자원 정보가 반영되었습니다.' })}>Success toast</Button>
                  <Button variant="outline" onClick={() => addToast({ tone: 'error', title: '저장하지 못했습니다.', description: '잠시 후 다시 시도해주세요.' })}>Error toast</Button>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'states' && (
            <>
              <SectionHeading number="03" title="Service states" description="데이터가 없거나 작업이 실패한 순간에도 다음 행동을 잃지 않도록 안내합니다." />
              <Card title="Loading" description="콘텐츠의 위치를 유지하며 처리 중임을 알립니다."><Loading size="lg" label="자원 정보를 불러오는 중입니다" /></Card>
              <div className="state-grid">
                <EmptyState compact title="등록된 자원이 없습니다" description="첫 자원을 등록해 관리를 시작하세요." actionLabel="자원 등록" onAction={() => setModal('edit')} />
                <StateDisplay compact variant="search-empty" title="검색 결과가 없습니다" description="검색어나 필터 조건을 변경해보세요." actionLabel="조건 초기화" onAction={() => undefined} />
                <ErrorState compact title="정보를 불러오지 못했습니다" description="네트워크 상태를 확인하고 다시 시도해주세요." actionLabel="다시 시도" onAction={() => undefined} />
                <StateDisplay compact variant="success" title="예약 신청이 완료되었습니다" description="관리자 승인 후 알림으로 안내해드립니다." actionLabel="예약 내역 보기" onAction={() => undefined} />
                <StateDisplay compact variant="unauthorized" title="접근 권한이 없습니다" description="이 메뉴를 사용하려면 관리자 권한이 필요합니다." actionLabel="이전 화면" onAction={() => undefined} />
                <StateDisplay compact variant="unavailable" title="현재 이용할 수 없습니다" description="점검 중인 자원입니다. 완료 후 예약할 수 있습니다." actionLabel="다른 자원 찾기" onAction={() => undefined} />
                <StateDisplay compact variant="error" title="예약이 반려되었습니다" description="요청 기간에 이미 승인된 예약이 있습니다." actionLabel="다시 신청" onAction={() => undefined} />
                <StateDisplay compact variant="success" title="저장이 완료되었습니다" description="변경사항이 안전하게 반영되었습니다." actionLabel="확인" onAction={() => undefined} />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="design-footer">
        <span><Boxes size={16} /> Resource Hub</span>
        <p>확장 가능한 자원관리 시스템의 UI 기반</p>
        <a href="#top">맨 위로 <ChevronRight size={14} /></a>
      </footer>

      <Modal
        isOpen={modal === 'edit'}
        onClose={() => setModal(null)}
        title="자원 빠른 등록"
        description="상세 등록 화면에서 더 많은 정보를 입력할 수 있습니다."
        footer={<><Button variant="outline" onClick={() => setModal(null)}>취소</Button><Button onClick={() => { setModal(null); addToast({ tone: 'success', title: '임시 저장했습니다.' }) }}>저장</Button></>}
      >
        <div className="modal-form"><Input label="자원명" required placeholder="예: MacBook Pro 14″" leadingIcon={<Search size={16} />} /><Select label="카테고리" required placeholder="선택하세요" options={[{ label: '노트북', value: 'notebook' }, { label: '카메라', value: 'camera' }]} /><Textarea label="비고" placeholder="관리자가 참고할 내용을 입력하세요." /></div>
      </Modal>
      <ConfirmModal isOpen={modal === 'delete'} onClose={() => setModal(null)} onConfirm={() => addToast({ tone: 'success', title: '삭제가 완료되었습니다.' })} title="이 자원을 삭제할까요?" description="삭제한 자원 정보와 연결된 이력은 복구할 수 없습니다. 진행하기 전에 다시 확인해주세요." confirmLabel="삭제" />
    </div>
  )
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="section-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>
}

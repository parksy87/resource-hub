import type {
  Resource,
  ResourceCategory,
  ResourceHistory,
  ResourceManager,
  ResourceType,
} from '../types'

const createdAt = '2026-01-02T09:00:00+09:00'
const updatedAt = '2026-09-30T16:20:00+09:00'

export const resourceCategories: ResourceCategory[] = [
  { id: 1, name: 'IT 장비', code: 'IT', description: '노트북, 태블릿 및 주변기기', icon: null, sortOrder: 1, isActive: true, createdAt, updatedAt },
  { id: 2, name: '영상 장비', code: 'MEDIA', description: '카메라 및 촬영 장비', icon: null, sortOrder: 2, isActive: true, createdAt, updatedAt },
  { id: 3, name: '사무기기', code: 'OFFICE', description: '프린터 및 사무 장비', icon: null, sortOrder: 3, isActive: true, createdAt, updatedAt },
  { id: 4, name: '시설', code: 'FACILITY', description: '회의실 및 공용 공간', icon: null, sortOrder: 4, isActive: true, createdAt, updatedAt },
  { id: 5, name: '차량', code: 'VEHICLE', description: '업무용 차량', icon: null, sortOrder: 5, isActive: true, createdAt, updatedAt },
  { id: 6, name: '기타', code: 'ETC', description: '기타 공용 장비', icon: null, sortOrder: 6, isActive: true, createdAt, updatedAt },
]

export const resourceTypes: ResourceType[] = [
  { id: 1, categoryId: 1, code: 'NOTEBOOK', name: '노트북', isActive: true },
  { id: 2, categoryId: 1, code: 'TABLET', name: '태블릿', isActive: true },
  { id: 3, categoryId: 1, code: 'MONITOR', name: '모니터', isActive: true },
  { id: 4, categoryId: 2, code: 'CAMERA', name: '카메라', isActive: true },
  { id: 5, categoryId: 2, code: 'PROJECTOR', name: '빔프로젝터', isActive: true },
  { id: 6, categoryId: 3, code: 'PRINTER', name: '복합기', isActive: true },
  { id: 7, categoryId: 4, code: 'MEETING_ROOM', name: '회의실', isActive: true },
  { id: 8, categoryId: 5, code: 'PASSENGER_VEHICLE', name: '승용·승합차', isActive: true },
  { id: 9, categoryId: 6, code: 'AUDIO', name: '음향 장비', isActive: true },
]

export const resourceManagers: ResourceManager[] = [
  { id: 1, name: '김민준', department: 'IT운영팀' },
  { id: 2, name: '박서연', department: '미디어팀' },
  { id: 3, name: '이지훈', department: '총무팀' },
  { id: 4, name: '최유진', department: '시설관리팀' },
]

export const resourceLocations = ['본관 2층', '본관 3층', '별관 1층', '별관 2층', '미디어실', '장비보관실', '지하 주차장']

function resource(
  id: number,
  resourceCode: string,
  name: string,
  categoryId: number,
  type: string,
  location: string,
  managerId: number,
  totalQuantity: number,
  availableQuantity: number,
  status: Resource['status'],
  purchaseDate: string,
  createdDate: string,
  imageUrl: string | null = null,
): Resource {
  return {
    id,
    resourceCode,
    name,
    categoryId,
    type,
    location,
    managerId,
    totalQuantity,
    availableQuantity,
    status,
    purchaseDate,
    managementEndDate: '2030-12-31',
    description: '사용 전 예약 및 이용 수칙을 확인해 주세요.',
    imageUrl,
    notes: '이용 전 자원 상태를 확인해 주세요.',
    isReservable: status !== 'DISPOSED',
    maxRentalDays: type === 'MEETING_ROOM' ? 1 : 7,
    createdAt: `${createdDate}T09:00:00+09:00`,
    updatedAt,
  }
}

/** 포트폴리오 기본 데이터: 노트북·태블릿·카메라·프로젝터·회의실·차량 등 시연용 Mock */
export const resourcesMock: Resource[] = [
  resource(248, 'NB-2026-0142', 'MacBook Pro 14″ M4', 1, 'NOTEBOOK', '본관 3층', 1, 8, 8, 'AVAILABLE', '2026-09-22', '2026-09-30', '/resource-laptop.svg'),
  resource(247, 'CAM-2026-0091', 'DJI Osmo Pocket 4', 2, 'CAMERA', '미디어실', 2, 3, 3, 'AVAILABLE', '2026-09-18', '2026-09-29'),
  resource(246, 'VH-2026-0018', '스타리아 11인승', 5, 'PASSENGER_VEHICLE', '지하 주차장', 3, 1, 0, 'INSPECTION', '2026-09-12', '2026-09-28'),
  resource(245, 'MT-2026-0031', '프로젝트룸 C', 4, 'MEETING_ROOM', '별관 2층', 4, 1, 0, 'RESERVED', '2026-09-01', '2026-09-26'),
  resource(244, 'OF-2026-0038', '후지제록스 C5570', 3, 'PRINTER', '본관 2층', 3, 1, 1, 'AVAILABLE', '2026-08-25', '2026-09-25'),
  resource(243, 'TB-2026-0042', 'Galaxy Tab S10 Ultra', 1, 'TABLET', '본관 3층', 1, 12, 7, 'RENTED', '2026-08-10', '2026-09-20'),
  resource(242, 'NB-2026-0133', 'LG Gram Pro 16', 1, 'NOTEBOOK', '본관 3층', 1, 10, 6, 'RENTED', '2026-08-02', '2026-09-18'),
  resource(241, 'CAM-2025-0064', 'Canon EOS R6 Mark II', 2, 'CAMERA', '미디어실', 2, 4, 2, 'RENTED', '2025-11-14', '2026-09-12'),
  resource(240, 'PJ-2025-0021', 'Epson EB-L630U', 2, 'PROJECTOR', '장비보관실', 2, 3, 2, 'AVAILABLE', '2025-10-08', '2026-09-08'),
  resource(239, 'MN-2025-0078', 'Dell UltraSharp 32', 1, 'MONITOR', '본관 2층', 1, 15, 15, 'AVAILABLE', '2025-09-05', '2026-08-28'),
  resource(238, 'MT-2025-0003', '컨퍼런스룸 A', 4, 'MEETING_ROOM', '별관 2층', 4, 1, 0, 'RESERVED', '2025-03-12', '2026-08-15'),
  resource(237, 'NB-2025-0108', 'Dell XPS 15', 1, 'NOTEBOOK', '본관 3층', 1, 6, 4, 'RENTED', '2025-07-14', '2026-08-02'),
  resource(236, 'AU-2025-0014', 'RODE Wireless PRO', 6, 'AUDIO', '미디어실', 2, 5, 5, 'AVAILABLE', '2025-06-20', '2026-07-22'),
  resource(235, 'OF-2024-0026', 'HP LaserJet Enterprise', 3, 'PRINTER', '별관 1층', 3, 1, 0, 'INSPECTION', '2024-11-05', '2026-07-10'),
  resource(234, 'TB-2024-0031', 'iPad Pro 13″', 1, 'TABLET', '본관 3층', 1, 8, 0, 'DISPOSED', '2024-05-17', '2026-06-18'),
  resource(233, 'CAM-2024-0049', 'Sony Alpha 7 IV', 2, 'CAMERA', '미디어실', 2, 5, 3, 'RESERVED', '2024-03-21', '2026-06-02'),
]

export const resourceHistories: ResourceHistory[] = [
  { id: 1, resourceId: 248, type: 'CHANGE', title: '자원 정보 수정', description: '보관 위치가 본관 2층에서 본관 3층으로 변경되었습니다.', actorName: '김관리', occurredAt: '2026-09-30T16:20:00+09:00' },
  { id: 2, resourceId: 248, type: 'CHANGE', title: '자원 등록', description: 'MacBook Pro 14″ M4를 등록했습니다.', actorName: '김관리', occurredAt: '2026-09-30T09:00:00+09:00' },
]

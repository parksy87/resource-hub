import { Link, useNavigate, useParams } from 'react-router-dom'
import { reserveBlockedReason, userStatusMeta } from '../../config/userResource'
import { useUserResourceDetail } from '../../hooks/useUserResourceDetail'
import { ROUTES } from '../../routes/paths'
import { Badge, Button, ErrorState, Loading } from '../ui'
import { ResourceVisual } from './resources/ResourceCard'

export function UserResourceDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const validId = id?.trim() ? id.trim() : null
  const { resource, related, status, refetch } = useUserResourceDetail(validId)
  const viewStatus = validId == null ? 'missing' : status

  if (viewStatus === 'loading') return <Loading size="lg" label="자원 정보를 불러오는 중입니다" />
  if (viewStatus === 'error') {
    return <ErrorState title="자원 정보를 불러오지 못했습니다" actionLabel="다시 시도" onAction={refetch} />
  }
  if (viewStatus === 'missing' || !resource) {
    return (
      <ErrorState
        title="자원을 찾을 수 없습니다."
        description="주소가 올바른지 확인하거나 자원 목록으로 돌아가 주세요."
        actionLabel="목록으로 돌아가기"
        onAction={() => navigate(ROUTES.user.resources)}
      />
    )
  }

  const meta = userStatusMeta(resource.status)
  const canReserve = resource.status === 'AVAILABLE'

  return (
    <div className="user-resource-detail">
      <Link className="user-resource-back" to={ROUTES.user.resources}>목록으로</Link>
      <div className="user-resource-detail__layout">
        <div className="user-resource-detail__media">
          <ResourceVisual imageUrl={resource.imageUrl} alt={resource.name} />
        </div>
        <div className="user-resource-detail__info">
          <Badge tone="neutral">{resource.categoryName}</Badge>
          <h2>{resource.name}</h2>
          <p className="user-resource-status">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span>{canReserve ? '예약할 수 있는 자원입니다.' : reserveBlockedReason[resource.status]}</span>
          </p>
          <dl>
            <div><dt>자원 코드</dt><dd>{resource.resourceCode}</dd></div>
            <div><dt>유형</dt><dd>{resource.typeName}</dd></div>
            <div><dt>위치</dt><dd>{resource.location}</dd></div>
            <div><dt>이용 횟수</dt><dd>{resource.usageCount}회</dd></div>
          </dl>
          <h3>설명</h3>
          <p>{resource.description}</p>
          <h3>이용 안내</h3>
          <p>{resource.notes || '사용 전 예약 상태와 이용 수칙을 확인해주세요.'}</p>
          <h3>관리 정보</h3>
          <p>담당 {resource.managerName} · 보유 {resource.availableQuantity}/{resource.totalQuantity} · 구매일 {resource.purchaseDate ?? '-'}</p>
          {canReserve ? (
            <Link className="ui-button ui-button--primary ui-button--md" to={`${ROUTES.user.reservations}?resourceId=${resource.id}`}>예약하기</Link>
          ) : (
            <Button type="button" disabled>예약하기</Button>
          )}
        </div>
      </div>
      <section className="user-resource-related">
        <h3>관련 자원</h3>
        {related.length === 0 ? <p>같은 분류의 다른 자원이 없습니다.</p> : (
          <div className="user-resource-related__grid">
            {related.map((item) => (
              <Link key={item.id} to={ROUTES.user.resourceDetail(item.id)}>
                <ResourceVisual imageUrl={item.imageUrl} />
                <strong>{item.name}</strong>
                <span>{item.typeName}</span>
                <Badge tone={userStatusMeta(item.status).tone}>{userStatusMeta(item.status).label}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

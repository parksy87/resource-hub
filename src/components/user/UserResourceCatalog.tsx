import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  userResourceGroups,
  userResourceSorts,
  userResourceStatuses,
} from '../../config/userResource'
import { useUserResourceCatalog } from '../../hooks/useUserResourceCatalog'
import { ROUTES } from '../../routes/paths'
import { Button, EmptyState, ErrorState, Input, Loading, Pagination, Select, Badge } from '../ui'
import { ResourceReserveLink, ResourceStatusLine, ResourceVisual } from './resources/ResourceCard'

function readKeyword(params: URLSearchParams) {
  return params.get('keyword') ?? ''
}

export function UserResourceCatalog() {
  const [params, setParams] = useSearchParams()
  const keywordParam = readKeyword(params)
  const [keyword, setKeyword] = useState(keywordParam)
  const [seenKeyword, setSeenKeyword] = useState(keywordParam)
  if (keywordParam !== seenKeyword) {
    setSeenKeyword(keywordParam)
    setKeyword(keywordParam)
  }

  const { result, types, status, error, refetch } = useUserResourceCatalog(params)

  function update(next: Record<string, string | null>, resetPage = true) {
    const draft = new URLSearchParams(params)
    Object.entries(next).forEach(([key, value]) => {
      if (value) draft.set(key, value)
      else draft.delete(key)
    })
    if (resetPage) draft.delete('page')
    setParams(draft)
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    update({ keyword: keyword.trim() || null })
  }

  function onReset() {
    setKeyword('')
    setParams(new URLSearchParams())
  }

  const total = result?.totalItems ?? 0
  const summary = keywordParam
    ? `'${keywordParam}' 검색 결과 ${total}개`
    : `총 ${total}개의 자원`

  return (
    <div className="user-resource-page">
      <header className="user-resource-heading">
        <p>RESOURCES</p>
        <h2>자원 찾기</h2>
        <p>필요한 자원을 검색하고 상세 정보에서 예약을 시작할 수 있습니다.</p>
      </header>

      <form className="user-resource-search" onSubmit={onSearch}>
        <Input
          id="resource-keyword"
          label="자원명 또는 자원 코드"
          placeholder="자원명 또는 자원 코드를 입력하세요."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <div className="user-resource-search__actions">
          <Button type="submit">검색</Button>
          <Button type="button" variant="outline" onClick={onReset}>초기화</Button>
        </div>
      </form>

      <div className="user-resource-filters">
        <Select
          id="resource-group"
          label="카테고리"
          value={params.get('group') ?? ''}
          options={userResourceGroups}
          onChange={(event) => update({ group: event.target.value || null })}
        />
        <Select
          id="resource-type"
          label="자원 유형"
          value={params.get('type') ?? ''}
          options={[{ label: '전체', value: '' }, ...types.map((item) => ({ label: item.name, value: item.code }))]}
          onChange={(event) => update({ type: event.target.value || null })}
        />
        <Select
          id="resource-status"
          label="이용 상태"
          value={params.get('status') ?? ''}
          options={userResourceStatuses}
          onChange={(event) => update({ status: event.target.value || null, available: null })}
        />
        <Select
          id="resource-sort"
          label="정렬"
          value={params.get('sort') ?? 'latest'}
          options={userResourceSorts}
          onChange={(event) => update({ sort: event.target.value === 'latest' ? null : event.target.value })}
        />
      </div>

      {status === 'loading' && <Loading size="lg" label="자원 목록을 불러오는 중입니다" />}
      {status === 'error' && (
        <ErrorState title="자원 목록을 불러오지 못했습니다" description={error ?? undefined} actionLabel="다시 시도" onAction={refetch} />
      )}
      {status === 'success' && result && (
        <>
          <p className="user-resource-summary">{summary}</p>
          {result.totalItems === 0 ? (
            <EmptyState
              title="검색 조건에 맞는 자원이 없습니다."
              description="검색 조건을 변경해 다시 검색해 주세요."
            />
          ) : (
            <>
              <div className="user-resource-grid">
                {result.items.map((item) => (
                    <article key={item.id} className="user-resource-card">
                      <Link className="user-resource-card__media" to={ROUTES.user.resourceDetail(item.id)} aria-label={`${item.name} 상세보기`}>
                        <ResourceVisual imageUrl={item.imageUrl} />
                      </Link>
                      <div className="user-resource-card__body">
                        <Badge tone="neutral">{item.categoryName}</Badge>
                        <Link to={ROUTES.user.resourceDetail(item.id)}><strong>{item.name}</strong></Link>
                        <span>{item.resourceCode}</span>
                        <p>{item.description}</p>
                        <small>{item.location} · 이용 {item.usageCount}회</small>
                        <ResourceStatusLine status={item.status} />
                        <div className="user-resource-card__actions">
                          <ResourceReserveLink item={item} />
                          <Link className="ui-button ui-button--outline ui-button--sm" to={ROUTES.user.resourceDetail(item.id)}>상세보기</Link>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onChange={(page) => update({ page: page <= 1 ? null : String(page) }, false)}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

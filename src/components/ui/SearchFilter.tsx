import type { FormEvent, ReactNode } from 'react'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from './Button'
import { Input } from './FormControls'

export interface SearchFilterProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onSearch: () => void
  onReset?: () => void
  placeholder?: string
  children?: ReactNode
}

export function SearchFilter({
  keyword,
  onKeywordChange,
  onSearch,
  onReset,
  placeholder = '검색어를 입력하세요',
  children,
}: SearchFilterProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="ui-search-filter" onSubmit={handleSubmit}>
      <div className="ui-search-filter__heading">
        <span>
          <SlidersHorizontal size={18} />
          검색 조건
        </span>
        {onReset && (
          <button type="button" onClick={onReset}>
            <RotateCcw size={14} />
            초기화
          </button>
        )}
      </div>
      <div className="ui-search-filter__fields">
        <Input
          aria-label="검색어"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={placeholder}
          leadingIcon={<Search size={17} />}
        />
        {children}
        <Button type="submit">검색</Button>
      </div>
    </form>
  )
}

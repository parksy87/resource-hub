import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

export function Badge({ children, tone = 'neutral', dot = false, className, ...props }: BadgeProps) {
  return (
    <span className={cn('ui-badge', `ui-badge--${tone}`, className)} {...props}>
      {dot && <span className="ui-badge__dot" />}
      {children}
    </span>
  )
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  title,
  description,
  action,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <section className={cn('ui-card', `ui-card--${padding}`, className)} {...props}>
      {(title || description || action) && (
        <header className="ui-card__header">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export interface TableColumn<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  caption?: string
  emptyContent?: ReactNode
  onRowClick?: (row: T) => void
}

export function Table<T>({
  columns,
  data,
  rowKey,
  caption,
  emptyContent,
  onRowClick,
}: TableProps<T>) {
  if (data.length === 0 && emptyContent) return <>{emptyContent}</>

  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width, textAlign: column.align }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(onRowClick && 'is-clickable')}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align }}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  siblingCount?: number
  edges?: boolean
}

export function Pagination({ page, totalPages, onChange, siblingCount = 1, edges = false }: PaginationProps) {
  const start = Math.max(1, page - siblingCount)
  const end = Math.min(totalPages, page + siblingCount)
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  return (
    <nav className="ui-pagination" aria-label="페이지 이동">
      {edges && (
        <button type="button" onClick={() => onChange(1)} disabled={page <= 1} aria-label="처음 페이지">처음</button>
      )}
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="이전 페이지">
        <ChevronLeft size={17} />
      </button>
      {start > 1 && (
        <>
          <button type="button" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span>…</span>}
        </>
      )}
      {pages.map((item) => (
        <button
          type="button"
          key={item}
          className={cn(item === page && 'is-active')}
          aria-current={item === page ? 'page' : undefined}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span>…</span>}
          <button type="button" onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight size={17} />
      </button>
      {edges && (
        <button type="button" onClick={() => onChange(totalPages)} disabled={page >= totalPages} aria-label="마지막 페이지">마지막</button>
      )}
    </nav>
  )
}

export interface TabItem {
  id: string
  label: string
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  ariaLabel?: string
}

export function Tabs({ items, value, onChange, ariaLabel = '콘텐츠 탭' }: TabsProps) {
  return (
    <div className="ui-tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          className={cn('ui-tabs__item', item.id === value && 'is-active')}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {item.count !== undefined && <span>{item.count}</span>}
        </button>
      ))}
    </div>
  )
}

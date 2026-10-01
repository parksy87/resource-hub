import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="현재 위치">
      <ol className="ui-breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link to={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
}

export interface DropdownProps {
  label: string
  items: DropdownItem[]
  onSelect: (id: string) => void
  selectedId?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  label,
  items,
  onSelect,
  selectedId,
  align = 'left',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="ui-dropdown" ref={rootRef}>
      <button
        className="ui-dropdown__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((value) => !value)}
      >
        {label}
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className={cn('ui-dropdown__menu', `ui-dropdown__menu--${align}`)} role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              className={cn('ui-dropdown__item', item.danger && 'is-danger')}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                onSelect(item.id)
                setIsOpen(false)
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {selectedId === item.id && <Check size={16} className="ui-dropdown__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

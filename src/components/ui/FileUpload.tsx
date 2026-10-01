import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileImage, UploadCloud, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface FileUploadProps {
  label?: string
  hint?: string
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  onChange?: (files: File[]) => void
}

export function FileUpload({
  label = '파일 첨부',
  hint = 'PNG, JPG 파일을 끌어 놓거나 선택하세요.',
  accept = 'image/png,image/jpeg',
  multiple = false,
  maxSizeMb = 5,
  onChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const updateFiles = (incoming: File[]) => {
    const validFiles = incoming.filter((file) => file.size <= maxSizeMb * 1024 * 1024)
    setError(validFiles.length !== incoming.length ? `${maxSizeMb}MB 이하 파일만 첨부할 수 있습니다.` : '')
    const next = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
    setFiles(next)
    onChange?.(next)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    updateFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    updateFiles(Array.from(event.dataTransfer.files))
  }

  const removeFile = (index: number) => {
    const next = files.filter((_, itemIndex) => itemIndex !== index)
    setFiles(next)
    onChange?.(next)
  }

  return (
    <div className="ui-file-upload">
      <span className="ui-field__label">{label}</span>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInput}
      />
      <div
        className={cn('ui-file-upload__dropzone', isDragging && 'is-dragging')}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud size={28} aria-hidden="true" />
        <p>{hint}</p>
        <span>파일당 최대 {maxSizeMb}MB</span>
        <button type="button" onClick={() => inputRef.current?.click()}>
          내 PC에서 선택
        </button>
      </div>
      {error && <span className="ui-field__message ui-field__message--error">{error}</span>}
      {files.length > 0 && (
        <ul className="ui-file-upload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}`}>
              <FileImage size={18} />
              <span>{file.name}</span>
              <small>{(file.size / 1024).toFixed(0)} KB</small>
              <button type="button" onClick={() => removeFile(index)} aria-label={`${file.name} 삭제`}>
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

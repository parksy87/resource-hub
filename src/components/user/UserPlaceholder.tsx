import { Card } from '../ui'

interface UserPlaceholderProps {
  title: string
  description: string
  upcoming: string
}

export function UserPlaceholder({ title, description, upcoming }: UserPlaceholderProps) {
  return (
    <section className="user-placeholder">
      <p>USER</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <Card>
        <h3>준비 중인 기능</h3>
        <p>{upcoming}</p>
      </Card>
    </section>
  )
}

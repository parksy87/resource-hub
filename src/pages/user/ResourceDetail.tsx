import { useParams } from 'react-router-dom'
import { UserResourceDetailView } from '../../components/user/UserResourceDetailView'

export default function ResourceDetail() {
  const { id } = useParams()
  return <UserResourceDetailView key={id} />
}

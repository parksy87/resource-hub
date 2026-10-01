import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import './styles/components.css'
import './styles/design-system.css'
import './styles/admin.css'
import './styles/dashboard.css'
import './styles/resources.css'
import './styles/reservations.css'
import './styles/rentals.css'
import './styles/inspections.css'
import './styles/users.css'
import './styles/statistics.css'
import './styles/settings.css'
import './styles/user.css'
import './styles/home.css'
import './styles/user-resources.css'
import './styles/user-reservations.css'
import './styles/user-reservation-history.css'
import './styles/user-rentals.css'
import './styles/user-notifications.css'
import './styles/user-mypage.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

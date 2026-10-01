import { AuthProvider } from './components/auth/AuthProvider'
import { ThemeSync } from './components/theme/ThemeSync'
import { ToastViewport } from './components/ui'
import { AppRouter } from './routes/AppRouter'

function App() {
  return (
    <>
      <ThemeSync />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ToastViewport />
    </>
  )
}

export default App

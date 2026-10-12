import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import AuthRoute from './components/AuthRoute'
import HomePage from './components/HomePage'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import NotFoundPage from './components/NotFoundPage'
import { ModalProvider } from './context/ModalContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <Router>
            <Routes>
              {/* Public — login only */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected — all business routes */}
              <Route path="/" element={<AuthRoute><HomePage /></AuthRoute>} />
              <Route path="/chat/:conversationId" element={<AuthRoute><HomePage /></AuthRoute>} />
              <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />

              {/* Catch-all — 404 */}
              <Route path="*" element={<AuthRoute><NotFoundPage /></AuthRoute>} />
            </Routes>
          </Router>
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

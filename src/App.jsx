import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import AuthRoute from './components/AuthRoute'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import OnboardingPage from './components/OnboardingPage'
import AigentzLandingPage from './components/AigentzLandingPage'
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
              <Route path="/" element={<AuthRoute><Navigate to="/aigentz" replace /></AuthRoute>} />
              <Route path="/chat/:conversationId" element={<AuthRoute><Navigate to="/dashboard" replace /></AuthRoute>} />
              <Route path="/onboarding" element={<AuthRoute><OnboardingPage /></AuthRoute>} />
              <Route path="/aigentx" element={<AuthRoute><Navigate to="/aigentz" replace /></AuthRoute>} />
              <Route path="/aigentz" element={<AuthRoute><AigentzLandingPage /></AuthRoute>} />
              <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />
              <Route path="/dashboard/explorer" element={<AuthRoute><Dashboard view="explorer" /></AuthRoute>} />
              <Route path="/dashboard/recommendations" element={<AuthRoute><Dashboard view="recommendations" /></AuthRoute>} />
              <Route path="/dashboard/executive-brief" element={<AuthRoute><Dashboard view="brief" /></AuthRoute>} />

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

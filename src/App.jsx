import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './components/HomePage'
import Dashboard from './components/Dashboard'
import AdminLoginPage from './components/AdminLoginPage'
import AdminRoute from './components/AdminRoute'
import TrainingDataPage from './components/TrainingDataPage'

import { ModalProvider } from './context/ModalContext'

// Create a query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/training-data"
              element={
                <AdminRoute>
                  <TrainingDataPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </ModalProvider>
    </QueryClientProvider>
  )
}

export default App

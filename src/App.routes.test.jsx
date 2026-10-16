import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./context/AuthContext', () => ({ AuthProvider: ({ children }) => children }))
vi.mock('./context/ModalContext', () => ({ ModalProvider: ({ children }) => children }))
vi.mock('./components/AuthRoute', () => ({ default: ({ children }) => children }))
vi.mock('./components/Dashboard', () => ({ default: ({ view = 'home' }) => <div>Dashboard: {view}</div> }))
vi.mock('./components/AigentxLandingPage', () => ({ default: () => <div>AIGENTX introduction</div> }))
vi.mock('./components/LoginPage', () => ({ default: () => <div>Sign in</div> }))
vi.mock('./components/OnboardingPage', () => ({ default: () => <div>Onboarding</div> }))
vi.mock('./components/NotFoundPage', () => ({ default: () => <div>Page not found</div> }))

describe('app routes', () => {
  it.each([['/', '/aigentx'], ['/chat/old-conversation', '/dashboard']])('redirects %s to %s', async (path, destination) => {
    window.history.replaceState({}, '', path)
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe(destination))
    expect(screen.getByText(destination === '/aigentx' ? 'AIGENTX introduction' : 'Dashboard: home')).toBeTruthy()
  })

  it('keeps the AIGENTX introduction and dashboard sections available', () => {
    window.history.replaceState({}, '', '/aigentx')
    const { unmount } = render(<App />)
    expect(screen.getByText('AIGENTX introduction')).toBeTruthy()
    unmount()

    window.history.replaceState({}, '', '/dashboard/recommendations')
    render(<App />)
    expect(screen.getByText('Dashboard: recommendations')).toBeTruthy()
  })
})

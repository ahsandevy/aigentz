import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, CalendarDays,
  ChevronRight, FileText, LogOut, Sparkles,
  TrendingUp, WandSparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'
import RecommendationsPage from './RecommendationsPage'
import ExplorerPage from './ExplorerPage'
import HomeDashboard from './HomeDashboard'
import ReportsPage from './ReportsPage'
import './Dashboard.css'

function Shell({ view, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const name = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Zeeshan'
  const initials = name.split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase()
  return <div className="asc-app">
    <aside className="asc-sidebar">
      <Link to="/dashboard" className="asc-brand" aria-label="AIGENTZ Dashboard"><BrandLogo className="asc-logo" /></Link>
      <div className="asc-sidebar-label">WORKSPACE</div>
      <nav className="asc-side-nav" aria-label="Main navigation">
        <Link to="/dashboard" aria-current={view === 'home' ? 'page' : undefined}><BarChart3 size={16} />Home</Link>
        <Link to="/dashboard/recommendations" aria-current={view === 'recommendations' ? 'page' : undefined}><Sparkles size={16} />Recommendations <small>AI</small></Link>
        <Link to="/dashboard/explorer" aria-current={view === 'explorer' ? 'page' : undefined}><TrendingUp size={16} />Performance</Link>
        <Link to="/dashboard/executive-brief" aria-current={view === 'brief' ? 'page' : undefined}><FileText size={16} />Reports</Link>
        <Link to="/aigentz"><WandSparkles size={16} />AI Assistant</Link>
      </nav>
    </aside>
    <div className="asc-main">
      <header className="asc-topbar">
        <div className="asc-breadcrumb"><span>Analytics</span><ChevronRight size={13} /><strong>{view === 'home' ? 'Overview' : view === 'explorer' ? 'Performance Explorer' : view === 'recommendations' ? 'Recommendations' : 'Reports'}</strong></div>
        <div className="asc-topbar-tools"><span className="asc-date"><CalendarDays size={15} />Sample data · Sep 15 – Oct 14, 2025</span><div className="asc-avatar" title={name}><span>{initials}</span><strong>{name}</strong></div><button className="asc-icon-button" aria-label="Log out" title="Log out" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={17} /></button></div>
      </header>
      <main className="asc-content">{children}</main>
    </div>
  </div>
}

export default function Dashboard({ view = 'home' }) {
  const location = useLocation()
  useEffect(() => {
    if (!['home', 'explorer'].includes(view) || !location.hash) return
    const id = window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 0)
    return () => window.clearTimeout(id)
  }, [location.hash, view])
  return <Shell view={view}>
    {view === 'home' ? <HomeDashboard /> : view === 'explorer' ? <ExplorerPage /> : view === 'recommendations' ? <RecommendationsPage /> : <ReportsPage />}
  </Shell>
}

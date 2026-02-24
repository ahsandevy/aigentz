import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricsGrid from './MetricsGrid'
import { analyticsAPI } from '../services/api'

function formatDateLabel(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

function Header() {
  const navigate = useNavigate()
  const [days, setDays] = useState(1)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isFullRefresh, setIsFullRefresh] = useState(false)
  const [dataStatus, setDataStatus] = useState(null)
  const [syncMessage, setSyncMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    const storedSyncRange = sessionStorage.getItem('lastSyncRange')
    if (storedSyncRange) {
      try {
        const { from, to } = JSON.parse(storedSyncRange)
        if (from && to) setSyncMessage(`Synced ${formatDateLabel(from)} to ${formatDateLabel(to)}`)
        sessionStorage.removeItem('lastSyncRange')
      } catch (_) { /* ignore */ }
    }
    analyticsAPI.getDataStatus()
      .then((data) => { if (!cancelled) setDataStatus(data) })
      .catch(() => { if (!cancelled) setDataStatus({}) })
    return () => { cancelled = true }
  }, [])

  const handleSync = async (force = false) => {
    setIsFullRefresh(force)
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const result = await analyticsAPI.refreshData(force)
      if (result?.sync_from_date != null && result?.sync_until_date != null) {
        sessionStorage.setItem('lastSyncRange', JSON.stringify({ from: result.sync_from_date, to: result.sync_until_date }))
      }
      if (result?.last_synced_date != null) {
        setDataStatus((prev) => ({ ...prev, last_synced_date: result.last_synced_date }))
      }
      window.location.reload()
    } catch (error) {
      console.error("Sync failed", error)
    } finally {
      setIsSyncing(false)
      setIsFullRefresh(false)
    }
  }

  const handleDateChange = (e) => {
    const value = e.target.value
    // Parse "Last X days" to integer
    const daysMap = {
      "Today": 1,
      "Last 7 days": 7,
      "Last 30 days": 30,
      "Last 90 days": 90
    }
    setDays(daysMap[value] || 1)
  }

  return (
    <header className="bg-[#f4f8fe] pb-6">
      <div className="w-full md:w-[85%] mx-auto px-4 md:px-8 pt-6">
        {/* Top Navigation Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/Final logo-01 1.png" alt="Ascend Analytics" className="h-10 w-auto" />
            <div className="flex flex-col leading-none">

            </div>
          </div>

          {/* Client Status + Last synced */}
          <div className="flex flex-col items-end gap-0.5 text-sm text-[#4b5563]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1e4a79]">Servis Shoes</span>
              <span>·</span>
              <span>Live Analysis</span>
              <span className="w-2 h-2 bg-[#84cc16] rounded-full"></span>
            </div>
            <div className="text-xs text-[#64748b]">
              {dataStatus?.last_synced_date
                ? `Last synced: ${formatDateLabel(dataStatus.last_synced_date)}`
                : 'No sync yet — Sync to load data'}
            </div>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 md:gap-0">
          {/* Title Section - Top on mobile, centered */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-center md:text-left">
            <div className="p-2 hidden md:block">
              <svg className="w-12 h-12 text-[#6b7280] opacity-50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h4v8H3v-8zm6-5h4v13H9V8zm6-5h4v18h-4V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-[#1e4a79] mb-1">
                Marketing Opportunity Detection Engine
              </h1>
              <p className="text-[#64748b] text-xs md:text-base">
                AI-powered insights and optimization recommendations
              </p>
            </div>
          </div>

          {/* Controls - Below on mobile */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select
                onChange={handleDateChange}
                defaultValue="Today"
                className="w-full md:w-auto appearance-none bg-[#EDF0A8] border-none rounded-full px-4 md:px-6 py-2.5 pr-10 text-xs md:text-sm font-medium text-[#374151] shadow-sm focus:outline-none cursor-pointer"
              >
                <option>Today</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e4a79] text-white px-4 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-[#2c6aa8] transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Chat with Agent</span>
            </button>
            <button
              onClick={() => handleSync(false)}
              disabled={isSyncing}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#EDF0A8] text-[#374151] px-4 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? (isFullRefresh ? 'Full refresh...' : 'Syncing...') : 'Sync Meta'}</span>
            </button>
            <button
              onClick={() => handleSync(true)}
              disabled={isSyncing}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-[#64748b] hover:text-[#1e4a79] text-xs font-medium whitespace-nowrap disabled:opacity-50"
              title="Re-fetch last 90 days"
            >
              Full refresh
            </button>
          </div>
        </div>
        {syncMessage && (
          <div className="mb-4 text-sm text-[#16a34a] text-center md:text-left">
            {syncMessage}
          </div>
        )}

        {/* Metric Cards Grid */}
        <MetricsGrid days={days} />
      </div>
    </header >
  )
}

export default Header



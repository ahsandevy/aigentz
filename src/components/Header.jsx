import { useState } from 'react'
import MetricsGrid from './MetricsGrid'
import { analyticsAPI } from '../services/api'

function Header() {
  const [days, setDays] = useState(1)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await analyticsAPI.refreshData(days)
      // Ideally trigger a re-fetch in MetricsGrid, maybe via a context or a refresh trigger prop
      // For now, let's just reload window or use a simple hack if we don't have global state management
      window.location.reload()
    } catch (error) {
      console.error("Sync failed", error)
    } finally {
      setIsSyncing(false)
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

          {/* Client Status */}
          <div className="flex items-center gap-2 text-sm text-[#4b5563]">
            <span className="font-medium text-[#1e4a79]">Servis Shoes</span>
            <span>·</span>
            <span>Live Analysis</span>
            <span className="w-2 h-2 bg-[#84cc16] rounded-full"></span>
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
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#EDF0A8] text-[#374151] px-4 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? 'Syncing...' : 'Sync Meta'}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <MetricsGrid days={days} />
      </div>
    </header >
  )
}

export default Header



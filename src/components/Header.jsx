import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricsGrid from './MetricsGrid'
import CampaignsDropdown from './CampaignsDropdown'
import AccountsDropdown from './AccountsDropdown'
import { analyticsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatDateLabel(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

function extractFirstArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return null
  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) return nested
  }
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object') {
      const found = extractFirstArray(nested)
      if (found) return found
    }
  }
  return null
}

function normalizeCampaigns(payload) {
  return extractFirstArray(payload) || []
}

function normalizeAccounts(payload) {
  return extractFirstArray(payload) || []
}

const SYNC_TOAST_DISMISS_MS = 6000

function Header({ days, onDaysChange }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  // const [isSyncing, setIsSyncing] = useState(false)
  const [dataStatus, setDataStatus] = useState(null)
  const [syncMessage, setSyncMessage] = useState(null)
  const [cooldownMessage, setCooldownMessage] = useState(null)
  const cooldownTimerRef = useRef(null)
  const syncMessageTimerRef = useRef(null)

  const clearDismissTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const scheduleToastDismiss = (timerRef, clearState) => {
    clearDismissTimer(timerRef)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      clearState()
    }, SYNC_TOAST_DISMISS_MS)
  }
  const [selectedCampaign, setSelectedCampaign] = useState('total')
  const [selectedAccount, setSelectedAccount] = useState('total')
  const [campaignOptions, setCampaignOptions] = useState([])
  const [accountOptions, setAccountOptions] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const storedSyncRange = sessionStorage.getItem('lastSyncRange')
    if (storedSyncRange) {
      try {
        const { from, to } = JSON.parse(storedSyncRange)
        if (from && to) {
          setSyncMessage(`Synced ${formatDateLabel(from)} to ${formatDateLabel(to)}`)
          scheduleToastDismiss(syncMessageTimerRef, () => setSyncMessage(null))
        }
        sessionStorage.removeItem('lastSyncRange')
      } catch (_) { /* ignore */ }
    }
    analyticsAPI.getDataStatus(controller.signal)
      .then((data) => { if (!cancelled) setDataStatus(data) })
      .catch(() => { if (!cancelled) setDataStatus({}) })

    const fetchDropdowns = async () => {
      setLoadingCampaigns(true)
      setLoadingAccounts(true)

      // Start both requests immediately (parallel), but resolve/update each dropdown independently.
      const campaignsPromise = analyticsAPI.getMcpCampaigns(controller.signal)
      const accountsPromise = analyticsAPI.getMcpAccounts(controller.signal)

      campaignsPromise
        .then((campaignsData) => {
          if (!cancelled) {
            setCampaignOptions(normalizeCampaigns(campaignsData))
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setCampaignOptions([])
          }
          // Ignore aborts during unmount/remount in development strict mode.
          if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
            console.error('Failed to load campaign options:', error)
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoadingCampaigns(false)
          }
        })

      accountsPromise
        .then((accountsData) => {
          if (!cancelled) {
            setAccountOptions(normalizeAccounts(accountsData))
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setAccountOptions([])
          }
          // Ignore aborts during unmount/remount in development strict mode.
          if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
            console.error('Failed to load account options:', error)
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoadingAccounts(false)
          }
        })
    }

    fetchDropdowns()
    return () => {
      cancelled = true
      controller.abort()
      clearDismissTimer(cooldownTimerRef)
      clearDismissTimer(syncMessageTimerRef)
    }
  }, [])

  // const handleSync = async (force = false) => {
  //   setIsSyncing(true)
  //   clearDismissTimer(syncMessageTimerRef)
  //   clearDismissTimer(cooldownTimerRef)
  //   setSyncMessage(null)
  //   setCooldownMessage(null)
  //   try {
  //     const result = await analyticsAPI.refreshData(force)
  // 
  //     // Cooldown guard: backend returned cached data without hitting Meta API
  //     if (result?.from_saved === true && result?.records_updated === 0 && !force) {
  //       if (result?.last_synced_date != null) {
  //         setDataStatus((prev) => ({ ...prev, last_synced_date: result.last_synced_date }))
  //       }
  //       const rawMessage = result?.message || 'Data is already up to date.'
  //       const cleaned = rawMessage.replace(/\s*Use force=true to override\.?/gi, '').trim()
  //       setCooldownMessage(cleaned)
  //       scheduleToastDismiss(cooldownTimerRef, () => setCooldownMessage(null))
  //       return
  //     }
  // 
  //     if (result?.sync_from_date != null && result?.sync_until_date != null) {
  //       sessionStorage.setItem('lastSyncRange', JSON.stringify({ from: result.sync_from_date, to: result.sync_until_date }))
  //     }
  //     if (result?.last_synced_date != null) {
  //       setDataStatus((prev) => ({ ...prev, last_synced_date: result.last_synced_date }))
  //     }
  //     window.location.reload()
  //   } catch (error) {
  //     console.error("Sync failed", error)
  //   } finally {
  //     setIsSyncing(false)
  //   }
  // }

  const handleDateChange = (e) => {
    const value = e.target.value
    // Parse "Last X days" to integer
    const daysMap = {
      "Today": 1,
      "Last 7 days": 7,
      "Last 30 days": 30,
      "Last 90 days": 90
    }
    const mappedDays = daysMap[value] ?? 1
    onDaysChange?.(mappedDays)
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
          <div className="flex items-center gap-4">
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
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#dc2626] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
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
                value={
                  days === 1
                    ? 'Today'
                    : days === 7
                    ? 'Last 7 days'
                    : days === 30
                    ? 'Last 30 days'
                    : days === 90
                    ? 'Last 90 days'
                    : 'Today'
                }
                className="w-full md:w-auto appearance-none bg-[#EDF0A8] border-none rounded-full pl-5 pr-14 py-2.5 text-xs md:text-sm font-medium text-[#374151] shadow-sm focus:outline-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
              </select>
              <svg className="absolute right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* <button
              onClick={() => handleSync(false)}
              disabled={isSyncing}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#EDF0A8] text-[#374151] px-4 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? 'Syncing...' : 'Sync Meta'}</span>
            </button> */}
          </div>
        </div>
        {syncMessage && (
          <div className="mb-4 text-sm text-[#16a34a] text-center md:text-left">
            {syncMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CampaignsDropdown
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            campaigns={campaignOptions}
            loading={loadingCampaigns}
          />
          <AccountsDropdown
            value={selectedAccount}
            onChange={setSelectedAccount}
            accounts={accountOptions}
            loading={loadingAccounts}
          />
        </div>

        {/* Metric Cards Grid */}
        <MetricsGrid
          days={days}
          selectedCampaign={selectedCampaign}
          selectedAccount={selectedAccount}
        />
      </div>
      {/* Cooldown toast */}
      {cooldownMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-white border border-amber-200 shadow-lg rounded-xl px-4 py-3 max-w-sm animate-fade-in">
          <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1e4a79] mb-0.5">Data is fresh</p>
            <p className="text-xs text-[#6b7280] leading-snug">{cooldownMessage}</p>
          </div>
          <button
            onClick={() => { clearDismissTimer(cooldownTimerRef); setCooldownMessage(null) }}
            className="shrink-0 text-[#9ca3af] hover:text-[#374151] transition-colors mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </header >
  )
}

export default Header



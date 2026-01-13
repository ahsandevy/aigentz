import { useState, useEffect, useMemo } from 'react'
import { analyticsAPI } from '../services/api'

function PerformanceExplorer() {
  const [activeTab, setActiveTab] = useState('Campaigns')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedAI, setSelectedAI] = useState(null)
  const [selectedAssessment, setSelectedAssessment] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getPerformanceExplorer(7)
      setCampaigns(response.data)
    } catch (error) {
      console.error('Error fetching explorer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIRequest = async (campaignId) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAIRecommendation(campaignId, 7)
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching AI recommendation:', error)
    } finally {
      setAiLoading(false)
    }
  }




  // Fetch AdSets when tab changes
  useEffect(() => {
    if (activeTab === 'Ad Sets') {
      fetchAdSets()
    }
  }, [activeTab])

  const [adSets, setAdSets] = useState([])

  const fetchAdSets = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getPerformanceAdSets(7)
      setAdSets(response.data)
    } catch (error) {
      console.error('Error fetching adsets:', error)
    } finally {
      setLoading(false)
    }
  }

  const [ads, setAds] = useState([])

  // Fetch Ads when tab changes
  useEffect(() => {
    if (activeTab === 'Ads') {
      fetchAds()
    }
  }, [activeTab])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getPerformanceAds(7)
      console.log('Ads response:', response.data) // Debug: Check if image_url is present
      if (response.data && response.data.length > 0) {
        console.log('First ad sample:', response.data[0]) // Debug: Check first ad structure
      }
      setAds(response.data)
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const [audiences, setAudiences] = useState([])

  // Fetch Audiences when tab changes
  useEffect(() => {
    if (activeTab === 'Audiences') {
      fetchAudiences()
    }
  }, [activeTab])

  const fetchAudiences = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getPerformanceAudiences(7)
      setAudiences(response.data)
    } catch (error) {
      console.error('Error fetching audiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAudienceAIRequest = async (aud) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAudienceAIRecommendation({
        name: aud.name,
        role: aud.role,
        spend: aud.spend,
        roas: aud.roas,
        frequency: aud.frequency,
        size: aud.size,
        cpa: aud.cpa
      })
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching audience AI:', error)
    } finally {
      setAiLoading(false)
    }
  }

  // Filter AdSets
  const filteredAdSets = useMemo(() => {
    return adSets.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.funnel_stage.toLowerCase().includes(search.toLowerCase())
    )
  }, [adSets, search])

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.funnel_stage.toLowerCase().includes(search.toLowerCase())
    )
  }, [campaigns, search])

  const filteredAds = useMemo(() => {
    return ads.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.format && a.format.toLowerCase().includes(search.toLowerCase()))
    )
  }, [ads, search])

  const filteredAudiences = useMemo(() => {
    const filtered = audiences.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
    )
    // Sort by audience_size (highest first), with null/undefined values at the bottom
    return filtered.sort((a, b) => {
      const sizeA = a.audience_size ?? a.assessment?.audience_characteristics?.size ?? null
      const sizeB = b.audience_size ?? b.assessment?.audience_characteristics?.size ?? null
      
      // Handle null/undefined values - put them at the bottom
      if (sizeA === null && sizeB === null) return 0
      if (sizeA === null) return 1
      if (sizeB === null) return -1
      
      // Sort descending (highest first)
      return sizeB - sizeA
    })
  }, [audiences, search])

  // Helper function to get assessment data with backward compatibility
  const getAssessment = (item) => {
    if (item.assessment) {
      return {
        summary: item.assessment.summary || item.assessment_summary || '',
        action: item.assessment.action || item.action || '',
        status: item.assessment.status || item.status_color || 'gray'
      }
    }
    // Fallback to old structure
    return {
      summary: item.assessment_summary || item.assessment || '',
      action: item.action || '',
      status: item.status_color || 'gray'
    }
  }

  // Helper function to truncate text for preview
  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  // Helper function to get ad assessment data
  const getAdAssessment = (ad) => {
    if (ad.assessment) {
      return {
        summary: ad.assessment.summary || '',
        // Status now based on creative_performance (new) or top-level status (fallback)
        status: ad.assessment.performance?.creative_performance?.status || ad.assessment.status || 'fair', // "excellent" | "good" | "fair" | "poor"
        fatigue: ad.assessment.creative?.fatigue_score || ad.fatigue || 0,
        fatigueLevel: ad.assessment.creative?.fatigue_level || 'normal'
      }
    }
    // Fallback to old structure
    return {
      summary: '',
      status: 'fair',
      fatigue: ad.fatigue || 0,
      fatigueLevel: ad.fatigue > 70 ? 'critical' : ad.fatigue > 40 ? 'high' : 'normal'
    }
  }

  // Helper function to get ad status color classes
  const getAdStatusClasses = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'good':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'fair':
        return 'bg-[#ffd89b] text-[#b45309]'
      case 'poor':
        return 'bg-[#ffa7a7] text-[#aa2929]'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  // Helper function to get readiness level color classes
  const getReadinessLevelClasses = (readinessLevel) => {
    switch (readinessLevel) {
      case 'ready_to_scale':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'optimizing':
        return 'bg-[#fee97e] text-[#a26f05]'
      case 'needs_refresh':
        return 'bg-[#ffd89b] text-[#b45309]'
      case 'needs_different_approach':
        return 'bg-[#ffa7a7] text-[#aa2929]'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  // Helper function to format audience size
  const formatAudienceSize = (size) => {
    if (size === null || size === undefined) return 'N/A'
    if (typeof size === 'string') return size // Already formatted
    if (typeof size === 'number') {
      if (size >= 1000000) {
        return `${(size / 1000000).toFixed(1)}M`
      } else if (size >= 1000) {
        return `${(size / 1000).toFixed(1)}K`
      }
      return size.toLocaleString()
    }
    return 'N/A'
  }

  // Helper function to get audience size (prioritizes audience_size from backend)
  const getAudienceSize = (audience) => {
    // Priority: audience_size > assessment.audience_characteristics.size > size (formatted string)
    if (audience.audience_size !== null && audience.audience_size !== undefined) {
      return formatAudienceSize(audience.audience_size)
    }
    if (audience.assessment?.audience_characteristics?.size !== null && 
        audience.assessment?.audience_characteristics?.size !== undefined) {
      return formatAudienceSize(audience.assessment.audience_characteristics.size)
    }
    // Fallback to formatted string if available
    return audience.size || 'N/A'
  }

  // Helper function to get audience assessment data
  const getAudienceAssessment = (audience) => {
    if (audience.assessment) {
      return {
        summary: audience.assessment.summary || '',
        readinessLevel: audience.assessment.readiness_level || 'optimizing', // "ready_to_scale" | "needs_refresh" | "needs_different_approach" | "optimizing"
        readinessReason: audience.assessment.readiness_reason || '',
        // Backward compatibility: map old status to readiness_level if needed
        status: audience.assessment.readiness_level || audience.assessment.status || 'optimizing'
      }
    }
    // Fallback to old structure
    return {
      summary: '',
      readinessLevel: 'optimizing',
      readinessReason: '',
      status: 'optimizing'
    }
  }

  // Helper function to get status text and background color classes
  const getStatusHoverColors = (status, action) => {
    // Check status first
    if (status === 'green') {
      return 'group-hover:!text-[#15803d] group-hover:!bg-[#c8f687]'
    }
    if (status === 'yellow') {
      return 'group-hover:!text-[#a26f05] group-hover:!bg-[#fee97e]'
    }
    if (status === 'red') {
      return 'group-hover:!text-[#aa2929] group-hover:!bg-[#ffa7a7]'
    }
    // Fallback to action-based colors for backward compatibility
    if (action === 'Scale Aggressively') {
      return 'group-hover:!text-[#15803d] group-hover:!bg-[#c8f687]'
    }
    if (action === 'Scale with Guard') {
      return 'group-hover:!text-[#a26f05] group-hover:!bg-[#fee97e]'
    }
    if (action === 'Fix Before Scaling') {
      return 'group-hover:!text-[#aa2929] group-hover:!bg-[#ffa7a7]'
    }
    // Default to blue if status is unknown
    return 'group-hover:!text-[#1e4a79] group-hover:!bg-blue-50'
  }

  const getStatusClasses = (actionOrStatus) => {
    // Handle new status-based system
    if (actionOrStatus === 'green') {
      return 'bg-[#c8f687] text-[#15803d]'
    }
    if (actionOrStatus === 'yellow') {
      return 'bg-[#fee97e] text-[#a26f05]'
    }
    if (actionOrStatus === 'red') {
      return 'bg-[#ffa7a7] text-[#aa2929]'
    }
    // Handle old action-based system (backward compatibility)
    switch (actionOrStatus) {
      case 'Scale Aggressively':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'Scale with Guard':
        return 'bg-[#fee97e] text-[#a26f05]'
      case 'Fix Before Scaling':
        return 'bg-[#ffa7a7] text-[#aa2929]'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  const [isExpanded, setIsExpanded] = useState(false)

  // Reset expansion when tab changes
  useEffect(() => {
    setIsExpanded(false)
  }, [activeTab])

  // Helper to slice data
  const getDisplayData = (data) => {
    if (isExpanded) return data;
    return data.slice(0, 5);
  }

  return (
    <section className="mb-8 min-h-screen bg-[#f0f4f8] p-8">
      {/* ... Header and Search ... */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1e4a79]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e4a79]">Performance Explorer</h2>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-[#c8c8a1] rounded-[30px] text-sm text-[#374151] shadow-sm focus:outline-none w-full md:w-64 focus:ring-1 focus:ring-[#1e4a79] focus:border-[#1e4a79] transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs - Floating Pill Style */}
      <div className="flex justify-center mb-10">
        <div className="bg-white border border-[#e2e8f0] rounded-full p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] inline-flex gap-2 overflow-x-auto max-w-full">
          {['Campaigns', 'Ad Sets', 'Ads', 'Audiences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap text-[14px] ${activeTab === tab
                ? 'bg-[#f0f2b6] text-[#374151] shadow-sm'
                : 'text-[#64748b] hover:text-[#1e4a79] hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table Area */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-2xl shadow-sm border border-[#e2e8f0]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
          </div>
        ) : activeTab === 'Ad Sets' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight">
                    <th className="px-6 py-6 text-left">Ad Set</th>
                    <th className="px-6 py-6 text-left">Audience Strategy</th>
                    <th className="px-6 py-6 text-center">Funnel Role</th>
                    <th className="px-6 py-6 text-center hidden lg:table-cell">Bid Strategy</th>
                    <th className="px-6 py-6 text-center">Budget</th>
                    <th className="px-6 py-6 text-center hidden md:table-cell">Status</th>
                    <th className="px-6 py-6 text-center hidden sm:table-cell">Ads</th>
                    <th className="px-6 py-6 text-center">AI Detection Signal</th>
                    <th className="px-6 py-6 text-center whitespace-nowrap">Assessment</th>
                    <th className="px-6 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAdSets).map((as) => {
                    const assessment = getAssessment(as)
                    return (
                      <tr key={as.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-8 text-[12px] text-[#334155] font-medium max-w-[220px] break-words">
                          {as.name}
                        </td>
                        <td className="px-6 py-8 text-[12px] text-[#64748b] font-medium">
                          {as.audience_type}
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="px-5 py-1 bg-white border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold rounded-full shadow-sm uppercase">
                              {as.funnel_stage}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center hidden lg:table-cell">
                          <div className="text-[11px] text-[#64748b] font-medium">
                            {as.bid_strategy ? (
                              <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                                {as.bid_strategy.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-bold tracking-tight">
                          {as.budget_readable}
                        </td>
                        <td className="px-6 py-8 text-center hidden md:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            {as.effective_status && (
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                as.effective_status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : as.effective_status === 'PAUSED'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {as.effective_status}
                              </span>
                            )}
                            {as.delivery_issues && as.delivery_issues.length > 0 && (
                              <span className="text-[9px] text-red-600 font-medium">
                                {as.delivery_issues.length} issue{as.delivery_issues.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center hidden sm:table-cell">
                          <div className="text-[12px] text-[#334155] font-medium">
                            {as.ad_count !== null && as.ad_count !== undefined ? (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold">
                                {as.ad_count}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center text-[12px] text-[#334155] leading-tight font-medium">
                            <div><span className="font-extrabold text-[#1e293b]">ROAS:</span> {as.roas}x</div>
                            <div><span className="font-extrabold text-[#1e293b]">CPA:</span> {as.cpa !== null && as.cpa !== undefined ? as.cpa.toLocaleString() : 'N/A'}</div>
                          </div>
                        </td>
                      <td className="px-6 py-8 text-center hidden md:table-cell">
                        <button
                          onClick={() => setSelectedAssessment(as)}
                          className={`text-[11px] text-gray-600 ${getStatusHoverColors(assessment.status, assessment.action)} hover:!text-[#1e4a79] hover:!bg-blue-50 transition-colors cursor-pointer text-left max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded`}
                          title={assessment.summary || 'Click to view full assessment'}
                        >
                          {assessment.summary ? truncateText(assessment.summary, 40) : 'No assessment available'}
                        </button>
                      </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap ${getStatusClasses(assessment.status || assessment.action)}`}>
                              {assessment.action}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAdSets.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAdSets.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Ads' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-left">Ad</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden sm:table-cell">Format</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Fatigue</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Spend</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden md:table-cell">CTR</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Assessment</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAds).map((ad) => {
                    const adAssessment = getAdAssessment(ad)
                    const fatigueScore = ad.assessment?.creative?.fatigue_score || ad.fatigue || 0
                    return (
                      <tr key={ad.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Ad Image */}
                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                              {ad.image_url ? (
                                <>
                                  <img 
                                    src={ad.image_url} 
                                    alt={ad.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.target
                                      const fallback = img.parentElement?.querySelector('.image-fallback')
                                      if (img) img.style.display = 'none'
                                      if (fallback) fallback.style.display = 'flex'
                                    }}
                                    onLoad={(e) => {
                                      const fallback = e.target.parentElement?.querySelector('.image-fallback')
                                      if (fallback) fallback.style.display = 'none'
                                    }}
                                  />
                                  <div className="image-fallback w-full h-full hidden items-center justify-center bg-gray-100 absolute inset-0">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {/* Ad Name and Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] sm:text-[12px] text-[#334155] font-medium break-words line-clamp-2">
                                  {ad.name}
                                </span>
                                <span className="sm:hidden">
                                  <span className={`px-2 py-0.5 bg-gray-100 rounded-full text-[9px] font-bold ${ad.format === 'Video' ? 'text-blue-600 bg-blue-50' : ad.format === 'Carousel' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}>
                                    {ad.format}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden sm:table-cell">
                          <span className={`px-2 sm:px-3 py-1 bg-gray-100 rounded-full font-bold text-[10px] sm:text-[11px] ${ad.format === 'Video' ? 'text-blue-600 bg-blue-50' : ad.format === 'Carousel' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}>
                            {ad.format}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold ${fatigueScore > 70 ? 'bg-red-100 text-red-700' : fatigueScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {fatigueScore}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-bold tracking-tight hidden lg:table-cell">
                          {ad.spend ? ad.spend.toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden md:table-cell">
                          {ad.ctr ? `${ad.ctr}%` : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">
                          {adAssessment.summary ? (
                            <button
                              onClick={() => setSelectedAssessment(ad)}
                              className="text-[10px] sm:text-[11px] text-gray-600 group-hover:!text-[#1e4a79] hover:!text-[#1e4a79] transition-colors cursor-pointer text-left max-w-[180px] sm:max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded"
                              title={adAssessment.summary || 'Click to view full assessment'}
                            >
                              {truncateText(adAssessment.summary, 35)}
                            </button>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] text-gray-400">No assessment</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => setSelectedAssessment(ad)}
                              className="lg:hidden text-[9px] text-[#1e4a79] font-bold underline hover:text-blue-600 transition-colors"
                            >
                              View
                            </button>
                            <span className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm whitespace-nowrap ${getAdStatusClasses(adAssessment.status)}`}>
                              {adAssessment.status?.toUpperCase() || 'FAIR'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAds.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAds.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Audiences' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-left">Audience</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Funnel Role</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden sm:table-cell">AVG Size</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden md:table-cell">Spend Share</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Assessment</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAudiences).map((aud) => {
                    const audienceAssessment = getAudienceAssessment(aud)
                    return (
                      <tr key={aud.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-[11px] sm:text-[12px] text-[#334155] font-medium max-w-[150px] sm:max-w-[220px] break-words">
                          <div className="flex flex-col gap-1">
                            <span className="truncate">{aud.name}</span>
                            <div className="sm:hidden flex flex-col gap-1">
                              <span className="text-[10px] text-gray-500">AVG Size: {getAudienceSize(aud)}</span>
                              <span className="text-[10px] text-gray-500">Share: {aud.share}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <span className="px-3 sm:px-5 py-1 bg-white border border-[#e2e8f0] text-[#64748b] text-[10px] sm:text-[11px] font-bold rounded-full shadow-sm">
                              {aud.role}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-[#94a3b8] font-medium">
                              {aud.roleSub}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden sm:table-cell">
                          {getAudienceSize(aud)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden md:table-cell">
                          {aud.share}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">
                          {audienceAssessment.summary ? (
                            <button
                              onClick={() => setSelectedAssessment(aud)}
                              className="text-[10px] sm:text-[11px] text-gray-600 group-hover:!text-[#1e4a79] hover:!text-[#1e4a79] transition-colors cursor-pointer text-left max-w-[180px] sm:max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded"
                              title={audienceAssessment.summary || 'Click to view full assessment'}
                            >
                              {truncateText(audienceAssessment.summary, 35)}
                            </button>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] text-gray-400">No assessment</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => setSelectedAssessment(aud)}
                              className="lg:hidden text-[9px] text-[#1e4a79] font-bold underline hover:text-blue-600 transition-colors"
                            >
                              View
                            </button>
                            <span className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm whitespace-nowrap ${getReadinessLevelClasses(audienceAssessment.readinessLevel)}`}>
                              {audienceAssessment.readinessLevel?.replace(/_/g, ' ').toUpperCase() || 'OPTIMIZING'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAudiences.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAudiences.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Funnel</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Spend (PKR)</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Metics</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Assessment</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getDisplayData(filteredCampaigns).map((cp) => {
                    const assessment = getAssessment(cp)
                    return (
                      <tr key={cp.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {cp.name}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] rounded-full shadow-sm font-bold uppercase tracking-tight">{cp.funnel_stage}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 text-center hidden sm:table-cell font-bold">
                          {cp.spend.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-xs text-gray-600">
                          <div className="flex flex-col items-center">
                            <div><span className="font-bold text-gray-800">ROAS:</span> {cp.roas}x</div>
                            <div><span className="font-bold text-gray-800">CPA:</span> {cp.cpa !== null && cp.cpa !== undefined ? cp.cpa.toLocaleString() : 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center hidden md:table-cell">
                          <button
                            onClick={() => setSelectedAssessment(cp)}
                            className={`text-[11px] text-gray-600 ${getStatusHoverColors(assessment.status, assessment.action)} hover:!text-[#1e4a79] hover:!bg-blue-50 transition-colors cursor-pointer text-left max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded`}
                            title={assessment.summary || 'Click to view full assessment'}
                          >
                            {assessment.summary ? truncateText(assessment.summary, 40) : 'No assessment available'}
                          </button>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="flex flex-col gap-2 items-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap ${getStatusClasses(assessment.status || assessment.action)}`}>
                              {assessment.action}
                            </span>
                            <button
                              onClick={() => handleAIRequest(cp.id)}
                              className="text-[10px] text-[#1e4a79] font-bold underline hover:text-blue-600 transition-colors"
                            >
                              Show AI Insight
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredCampaigns.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredCampaigns.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Modal */}
      {(aiLoading || selectedAI) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[30px] border-2 border-[#1e4a79] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#1e4a79] opacity-20"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-[#1e4a79] flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                {selectedAI?.name || 'Generating AI Insight...'}
              </h3>
              <button
                onClick={() => { setSelectedAI(null); setAiLoading(false); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-[150px]">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
                  <p className="text-gray-500 font-medium">OpenAI is critically analyzing the 4 factors...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0]">
                  <p className="whitespace-pre-line text-sm">
                    {selectedAI?.ai_recommendation}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedAI(null)}
                className="px-8 py-2 bg-[#1e4a79] text-white rounded-full font-bold shadow-lg hover:bg-[#2c6aa8] transition-all transform hover:scale-105"
              >
                Close Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-[30px] border-2 border-[#1e4a79] p-4 sm:p-6 md:p-8 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-4xl w-full shadow-2xl relative overflow-hidden my-2 sm:my-4 md:my-8 max-h-[95vh] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-[#1e4a79] opacity-20"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Ad Image (only for ads) */}
                  {selectedAssessment.format && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 shadow-sm relative">
                      {selectedAssessment.image_url ? (
                        <>
                          <img 
                            src={selectedAssessment.image_url} 
                            alt={selectedAssessment.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.target
                              const fallback = img.parentElement?.querySelector('.image-fallback')
                              if (img) img.style.display = 'none'
                              if (fallback) fallback.style.display = 'flex'
                            }}
                            onLoad={(e) => {
                              const fallback = e.target.parentElement?.querySelector('.image-fallback')
                              if (fallback) fallback.style.display = 'none'
                            }}
                          />
                          <div className="image-fallback w-full h-full hidden items-center justify-center bg-gray-100 absolute inset-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1e4a79] flex items-center gap-2 mb-1 sm:mb-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
                      </svg>
                      <span className="truncate">Assessment Details</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold truncate">{selectedAssessment.name}</p>
                    {selectedAssessment.format && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Format: <span className="font-semibold">{selectedAssessment.format}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 flex-shrink-0 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
              {selectedAssessment.assessment ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Check if it's an Ad (has format field) */}
                  {selectedAssessment.format ? (
                    // AD ASSESSMENT STRUCTURE
                    <>
                      {/* Creative Performance Metrics Section */}
                      {selectedAssessment.assessment.performance?.creative_performance && (
                        <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Creative Performance</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.ctr ? `${selectedAssessment.assessment.performance.creative_performance.ctr}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPC</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.cpc ? selectedAssessment.assessment.performance.creative_performance.cpc.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPM</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.cpm ? selectedAssessment.assessment.performance.creative_performance.cpm.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.spend ? selectedAssessment.assessment.performance.creative_performance.spend.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Impressions</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.impressions ? selectedAssessment.assessment.performance.creative_performance.impressions.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Clicks</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.creative_performance.clicks ? selectedAssessment.assessment.performance.creative_performance.clicks.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            {(selectedAssessment.unique_clicks !== null && selectedAssessment.unique_clicks !== undefined) && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unique Clicks</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.unique_clicks ? selectedAssessment.unique_clicks.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                          {selectedAssessment.assessment.performance.creative_performance.summary && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs sm:text-sm text-gray-700 italic">
                                {selectedAssessment.assessment.performance.creative_performance.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informational KPIs (ROAS/CPA) */}
                      {selectedAssessment.assessment.performance?.kpis && (
                        <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-600 mb-2 sm:mb-3 uppercase tracking-wide">Conversion Metrics (Informational)</h4>
                          {selectedAssessment.assessment.performance.kpis.note && (
                            <p className="text-[10px] sm:text-xs text-gray-500 italic mb-3">{selectedAssessment.assessment.performance.kpis.note}</p>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {selectedAssessment.assessment.performance.kpis.roas !== null && selectedAssessment.assessment.performance.kpis.roas !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                                <span className="text-sm sm:text-base font-bold text-gray-600">
                                  {selectedAssessment.assessment.performance.kpis.roas}x
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.kpis.cpa !== null && selectedAssessment.assessment.performance.kpis.cpa !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                                <span className="text-sm sm:text-base font-bold text-gray-600">
                                  {selectedAssessment.assessment.performance.kpis.cpa.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.kpis.revenue !== null && selectedAssessment.assessment.performance.kpis.revenue !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                                <span className="text-sm sm:text-base font-bold text-gray-600">
                                  {selectedAssessment.assessment.performance.kpis.revenue.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.kpis.purchases !== null && selectedAssessment.assessment.performance.kpis.purchases !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Purchases</span>
                                <span className="text-sm sm:text-base font-bold text-gray-600">
                                  {selectedAssessment.assessment.performance.kpis.purchases.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Summary Section */}
                      <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                          {selectedAssessment.assessment.summary || 'No summary available'}
                        </p>
                      </div>

                      {/* Status - Based on Creative Performance */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 flex flex-col">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</span>
                          <div className="mt-1">
                            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getAdStatusClasses(selectedAssessment.assessment.performance?.creative_performance?.status || selectedAssessment.assessment.status)}`}>
                              {(selectedAssessment.assessment.performance?.creative_performance?.status || selectedAssessment.assessment.status)?.toUpperCase() || 'FAIR'}
                            </span>
                          </div>
                          {selectedAssessment.assessment.performance?.creative_performance?.status && (
                            <p className="text-[10px] text-gray-500 italic mt-1">Based on creative performance metrics</p>
                          )}
                        </div>
                      </div>

                      {/* Creative Health Section */}
                      {selectedAssessment.assessment.creative && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Creative Health</h4>
                          
                          {/* Format & Frequency */}
                          <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Format:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.creative.format || selectedAssessment.format || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Frequency:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.creative.frequency ? `${selectedAssessment.assessment.creative.frequency}x` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Fatigue Score:</span>
                                <span className={`font-bold ${selectedAssessment.assessment.creative.fatigue_score > 70 ? 'text-red-600' : selectedAssessment.assessment.creative.fatigue_score > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {selectedAssessment.assessment.creative.fatigue_score || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Fatigue Level:</span>
                                <span className={`font-bold uppercase ${selectedAssessment.assessment.creative.fatigue_level === 'critical' ? 'text-red-600' : selectedAssessment.assessment.creative.fatigue_level === 'high' ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {selectedAssessment.assessment.creative.fatigue_level || 'NORMAL'}
                                </span>
                              </div>
                            </div>
                            {selectedAssessment.assessment.creative.frequency_status && (
                              <div className="mt-2 text-xs text-gray-600 italic">
                                {selectedAssessment.assessment.creative.frequency_status}
                              </div>
                            )}
                          </div>

                          {/* CTR Trend */}
                          {selectedAssessment.assessment.creative_health?.ctr_trend && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR Trend</h5>
                              <div className="text-xs sm:text-sm space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CTR Decline:</span>
                                  <span className={`font-bold ${selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent > 30 ? 'text-red-600' : selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-600 italic">
                                  {selectedAssessment.assessment.creative_health.ctr_trend.status}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quality Rankings */}
                          {selectedAssessment.assessment.creative_health?.quality_rankings && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Quality Rankings</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                                <div>
                                  <span className="text-gray-600">Quality:</span>
                                  <span className="ml-2 font-bold text-gray-800">
                                    {selectedAssessment.assessment.creative_health.quality_rankings.quality?.replace('_', ' ') || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Engagement:</span>
                                  <span className="ml-2 font-bold text-gray-800">
                                    {selectedAssessment.assessment.creative_health.quality_rankings.engagement?.replace('_', ' ') || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Conversion:</span>
                                  <span className="ml-2 font-bold text-gray-800">
                                    {selectedAssessment.assessment.creative_health.quality_rankings.conversion?.replace('_', ' ') || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Engagement Quality (including Video metrics) */}
                          {selectedAssessment.assessment.creative_health?.engagement_quality && (
                            <div>
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Engagement Quality</h5>
                              <div className="space-y-2 text-xs sm:text-sm">
                                {selectedAssessment.assessment.creative_health.engagement_quality.link_clicks && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Link Clicks: </span>
                                    {selectedAssessment.assessment.creative_health.engagement_quality.link_clicks}
                                  </div>
                                )}
                                {selectedAssessment.assessment.creative_health.engagement_quality.engagement_rate && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Engagement Rate: </span>
                                    {selectedAssessment.assessment.creative_health.engagement_quality.engagement_rate}
                                  </div>
                                )}
                                {selectedAssessment.assessment.creative_health.engagement_quality.social && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Social Engagement: </span>
                                    {selectedAssessment.assessment.creative_health.engagement_quality.social}
                                  </div>
                                )}
                                {/* Video Metrics (only for Video format) */}
                                {selectedAssessment.format === 'Video' && selectedAssessment.assessment.creative_health.engagement_quality.video && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <span className="text-[10px] font-bold text-blue-600 mb-2 block">Video Performance</span>
                                    <div className="space-y-1.5">
                                      {selectedAssessment.assessment.creative_health.engagement_quality.video.play_rate && (
                                        <div className="text-gray-700">
                                          <span className="font-semibold">Play Rate: </span>
                                          {selectedAssessment.assessment.creative_health.engagement_quality.video.play_rate}
                                        </div>
                                      )}
                                      {selectedAssessment.assessment.creative_health.engagement_quality.video.completion && (
                                        <div className="text-gray-700">
                                          <span className="font-semibold">Completion Rate: </span>
                                          {selectedAssessment.assessment.creative_health.engagement_quality.video.completion}
                                        </div>
                                      )}
                                      {selectedAssessment.assessment.creative_health.engagement_quality.video['30_sec_rate'] && (
                                        <div className="text-gray-700">
                                          <span className="font-semibold">30+ Sec Watch Rate: </span>
                                          {selectedAssessment.assessment.creative_health.engagement_quality.video['30_sec_rate']}
                                        </div>
                                      )}
                                      {selectedAssessment.assessment.creative_health.engagement_quality.video.avg_watch_time && (
                                        <div className="text-gray-700">
                                          <span className="font-semibold">Avg Watch Time: </span>
                                          {selectedAssessment.assessment.creative_health.engagement_quality.video.avg_watch_time}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Performance Section - Creative Performance, CTR Assessment, Relative Performance, Cost Efficiency, Conversion Funnel, Click Quality, Ad Recall */}
                      {selectedAssessment.assessment.performance && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Performance Analysis</h4>
                          
                          {/* Creative Performance Summary */}
                          {selectedAssessment.assessment.performance.creative_performance && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Creative Performance</h5>
                              <div className="text-xs sm:text-sm space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getAdStatusClasses(selectedAssessment.assessment.performance.creative_performance.status)}`}>
                                    {selectedAssessment.assessment.performance.creative_performance.status?.toUpperCase() || 'FAIR'}
                                  </span>
                                </div>
                                {selectedAssessment.assessment.performance.creative_performance.summary && (
                                  <div className="text-gray-700 italic">
                                    {selectedAssessment.assessment.performance.creative_performance.summary}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
                                  <div>
                                    <span className="text-gray-600 text-[10px]">CTR:</span>
                                    <span className="ml-1 font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.creative_performance.ctr}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 text-[10px]">CPC:</span>
                                    <span className="ml-1 font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.creative_performance.cpc.toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 text-[10px]">CPM:</span>
                                    <span className="ml-1 font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.creative_performance.cpm.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CTR Assessment */}
                          {selectedAssessment.assessment.performance.ctr_assessment && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR Assessment</h5>
                              <div className="text-xs sm:text-sm space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-gray-600">CTR:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.performance.ctr_assessment.ctr}%
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-gray-600">Format Benchmark:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.performance.ctr_assessment.format_benchmark}%
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-gray-600">vs Benchmark:</span>
                                  <span className={`font-bold ${selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct.toFixed(1)}%
                                  </span>
                                </div>
                                {selectedAssessment.assessment.performance.ctr_assessment.status && (
                                  <div className="text-[10px] text-gray-600 italic">
                                    {selectedAssessment.assessment.performance.ctr_assessment.status}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Relative Performance */}
                          {selectedAssessment.assessment.performance.relative_performance && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Relative to AdSet</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-gray-600">ROAS vs AdSet:</span>
                                  <span className={`font-bold ${selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-gray-600">CTR vs AdSet:</span>
                                  <span className={`font-bold ${selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct.toFixed(1)}%
                                  </span>
                                </div>
                                {selectedAssessment.assessment.performance.relative_performance.underdelivery_detected && (
                                  <div className="col-span-full mt-2 pt-2 border-t border-yellow-200 bg-yellow-50 px-2 py-1 rounded text-[10px] text-yellow-800 font-semibold">
                                    ⚠️ Underdelivery detected
                                  </div>
                                )}
                              </div>
                              {selectedAssessment.assessment.performance.relative_insights && (
                                <div className="mt-2 text-[10px] text-gray-600 italic">
                                  {selectedAssessment.assessment.performance.relative_insights}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Cost Efficiency */}
                          {selectedAssessment.assessment.performance.cost_efficiency && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Efficiency</h5>
                              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                {selectedAssessment.assessment.performance.cost_efficiency.cpc && (
                                  <div>
                                    <span className="font-semibold">CPC: </span>
                                    {selectedAssessment.assessment.performance.cost_efficiency.cpc}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.cost_efficiency.cpm && (
                                  <div>
                                    <span className="font-semibold">CPM: </span>
                                    {selectedAssessment.assessment.performance.cost_efficiency.cpm}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Conversion Funnel */}
                          {selectedAssessment.assessment.performance.conversion_funnel && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Conversion Funnel</h5>
                              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                {selectedAssessment.assessment.performance.conversion_funnel.click_to_purchase && (
                                  <div>
                                    <span className="font-semibold">Click to Purchase: </span>
                                    {selectedAssessment.assessment.performance.conversion_funnel.click_to_purchase}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.conversion_funnel.add_to_cart && (
                                  <div>
                                    <span className="font-semibold">Add to Cart: </span>
                                    {selectedAssessment.assessment.performance.conversion_funnel.add_to_cart}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.conversion_funnel.cost_per_link_click !== null && (
                                  <div>
                                    <span className="font-semibold">Cost per Link Click: </span>
                                    {selectedAssessment.assessment.performance.conversion_funnel.cost_per_link_click.toFixed(2)}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.conversion_funnel.cost_per_add_to_cart !== null && (
                                  <div>
                                    <span className="font-semibold">Cost per Add to Cart: </span>
                                    {selectedAssessment.assessment.performance.conversion_funnel.cost_per_add_to_cart.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Click Quality */}
                          {selectedAssessment.assessment.performance.click_quality && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Click Quality</h5>
                              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                {selectedAssessment.assessment.performance.click_quality.quality_score && (
                                  <div>
                                    <span className="font-semibold">Quality Score: </span>
                                    {selectedAssessment.assessment.performance.click_quality.quality_score}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.click_quality.unique_ctr !== null && selectedAssessment.assessment.performance.click_quality.unique_ctr !== undefined && (
                                  <div>
                                    <span className="font-semibold">Unique CTR: </span>
                                    {selectedAssessment.assessment.performance.click_quality.unique_ctr.toFixed(2)}%
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.click_quality.website_ctr && (
                                  <div>
                                    <span className="font-semibold">Website CTR: </span>
                                    {selectedAssessment.assessment.performance.click_quality.website_ctr}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Ad Recall */}
                          {selectedAssessment.assessment.performance.ad_recall && (
                            <div>
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Ad Recall</h5>
                              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                {selectedAssessment.assessment.performance.ad_recall.recall_rate && (
                                  <div>
                                    <span className="font-semibold">Recall Rate: </span>
                                    {selectedAssessment.assessment.performance.ad_recall.recall_rate}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.ad_recall.cost_per_recall && (
                                  <div>
                                    <span className="font-semibold">Cost per Recall: </span>
                                    {selectedAssessment.assessment.performance.ad_recall.cost_per_recall}
                                  </div>
                                )}
                                {selectedAssessment.assessment.performance.ad_recall.estimated_recallers !== null && selectedAssessment.assessment.performance.ad_recall.estimated_recallers !== undefined && (
                                  <div>
                                    <span className="font-semibold">Estimated Recallers: </span>
                                    {selectedAssessment.assessment.performance.ad_recall.estimated_recallers.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delivery Section */}
                      {selectedAssessment.assessment.delivery && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Delivery Status</h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600">Effective Status:</span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                selectedAssessment.assessment.delivery.effective_status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : selectedAssessment.assessment.delivery.effective_status === 'PAUSED'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedAssessment.assessment.delivery.effective_status}
                              </span>
                            </div>
                            {selectedAssessment.assessment.delivery.configured_status && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Configured Status:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.delivery.configured_status}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.delivery.issues && selectedAssessment.assessment.delivery.issues.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-red-200">
                                <span className="text-[10px] font-bold text-red-600 mb-1 block">Delivery Issues:</span>
                                <ul className="list-disc list-inside space-y-1 text-[10px] text-red-700">
                                  {selectedAssessment.assessment.delivery.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {selectedAssessment.assessment.recommendations && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Recommendations</h4>
                          <div className="space-y-3">
                            {selectedAssessment.assessment.recommendations.primary && (
                              <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 font-semibold mb-1 sm:mb-0 sm:mr-2">Primary:</span>
                                <span className="font-bold text-[#1e4a79] break-words">
                                  {selectedAssessment.assessment.recommendations.primary}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.recommendations.all && selectedAssessment.assessment.recommendations.all.length > 0 && (
                              <div>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">All Recommendations</span>
                                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 pl-2">
                                  {selectedAssessment.assessment.recommendations.all.map((action, idx) => (
                                    <li key={idx} className="break-words">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : selectedAssessment.role ? (
                    // AUDIENCE ASSESSMENT STRUCTURE
                    <>
                      {/* Metrics Section */}
                      <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Key Metrics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.performance?.roas ? `${selectedAssessment.assessment.performance.roas}x` : selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.performance?.cpa !== null && selectedAssessment.assessment.performance?.cpa !== undefined 
                                ? selectedAssessment.assessment.performance.cpa.toLocaleString() 
                                : selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined 
                                  ? selectedAssessment.cpa.toLocaleString() 
                                  : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.performance?.ctr ? `${selectedAssessment.assessment.performance.ctr}%` : selectedAssessment.ctr ? `${selectedAssessment.ctr}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.performance?.spend ? selectedAssessment.assessment.performance.spend.toLocaleString() : selectedAssessment.spend ? selectedAssessment.spend.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.performance?.revenue ? selectedAssessment.assessment.performance.revenue.toLocaleString() : selectedAssessment.revenue ? selectedAssessment.revenue.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          {(selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) && (
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Reaction Quality</span>
                              <span className={`text-sm sm:text-base font-bold px-2 py-1 rounded ${
                                (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'passive' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality)?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                              </span>
                            </div>
                          )}
                          {(selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) && (
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sway Level</span>
                              <span className={`text-sm sm:text-base font-bold px-2 py-1 rounded ${
                                (selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) === 'strong' ? 'bg-green-100 text-green-800' :
                                (selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level)?.toUpperCase() || 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary Section */}
                      <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                          {selectedAssessment.assessment.summary || 'No summary available'}
                        </p>
                      </div>

                      {/* Readiness Level */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 flex flex-col">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Readiness Level</span>
                          <div className="mt-1">
                            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getReadinessLevelClasses(selectedAssessment.assessment.readiness_level)}`}>
                              {selectedAssessment.assessment.readiness_level?.replace(/_/g, ' ').toUpperCase() || 'OPTIMIZING'}
                            </span>
                          </div>
                          {selectedAssessment.assessment.readiness_reason && (
                            <p className="text-[10px] sm:text-xs text-gray-600 italic mt-2">
                              {selectedAssessment.assessment.readiness_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Audience Characteristics */}
                      {selectedAssessment.assessment.audience_characteristics && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Audience Characteristics</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Type:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.audience_characteristics.type || 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Expected Stage:</span>
                              <span className="font-bold text-gray-800 uppercase">
                                {selectedAssessment.assessment.audience_characteristics.expected_stage || 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">AVG Size:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.audience_size !== null && selectedAssessment.audience_size !== undefined
                                  ? formatAudienceSize(selectedAssessment.audience_size)
                                  : selectedAssessment.assessment?.audience_characteristics?.size !== null && selectedAssessment.assessment?.audience_characteristics?.size !== undefined
                                    ? formatAudienceSize(selectedAssessment.assessment.audience_characteristics.size)
                                    : selectedAssessment.size || 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current Reach:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.audience_characteristics.current_reach ? selectedAssessment.assessment.audience_characteristics.current_reach.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Saturation:</span>
                              <span className={`font-bold ${selectedAssessment.assessment.audience_characteristics.saturation_percent > 80 ? 'text-red-600' : selectedAssessment.assessment.audience_characteristics.saturation_percent > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {selectedAssessment.assessment.audience_characteristics.saturation_percent ? `${selectedAssessment.assessment.audience_characteristics.saturation_percent.toFixed(1)}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Saturation Level:</span>
                              <span className={`font-bold uppercase ${selectedAssessment.assessment.audience_characteristics.saturation_level === 'saturated' ? 'text-red-600' : selectedAssessment.assessment.audience_characteristics.saturation_level === 'moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                                {selectedAssessment.assessment.audience_characteristics.saturation_level || 'N/A'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.audience_characteristics.retention_days && (
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Retention Days:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_characteristics.retention_days} days
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.audience_characteristics.lookalike_ratio && (
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Lookalike Ratio:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_characteristics.lookalike_ratio}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Health Section */}
                      {selectedAssessment.assessment.health && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Health Metrics</h4>
                          
                          {/* Frequency */}
                          {selectedAssessment.assessment.health.frequency && (
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Frequency</h5>
                              <div className="text-xs sm:text-sm">
                                <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Value:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.health.frequency.value}x
                                  </span>
                                </div>
                                <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Status:</span>
                                  <span className={`font-bold uppercase ${selectedAssessment.assessment.health.frequency.status === 'high' ? 'text-red-600' : selectedAssessment.assessment.health.frequency.status === 'moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {selectedAssessment.assessment.health.frequency.status || 'NORMAL'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CTR */}
                          {selectedAssessment.assessment.health.ctr !== undefined && (
                            <div>
                              <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR</h5>
                              <div className="text-xs sm:text-sm">
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.ctr}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Targets */}
                      {selectedAssessment.assessment.targets && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Targets</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Stage:</span>
                              <span className="font-bold text-gray-800 uppercase">
                                {selectedAssessment.assessment.targets.stage || 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">ROAS Target:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.targets.roas_target}x
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current ROAS:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.targets.current_roas}x
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CPA Cap:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.targets.cpa_cap}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CPA:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.targets.current_cpa !== null && selectedAssessment.assessment.targets.current_cpa !== undefined 
                                  ? selectedAssessment.assessment.targets.current_cpa.toLocaleString() 
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scaling */}
                      {selectedAssessment.assessment.scaling && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Scaling Potential</h4>
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600 text-xs sm:text-sm">Potential:</span>
                              <span className={`font-bold uppercase ${selectedAssessment.assessment.scaling.potential === 'high' ? 'text-green-600' : selectedAssessment.assessment.scaling.potential === 'moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {selectedAssessment.assessment.scaling.potential || 'N/A'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.scaling.reason && (
                              <div className="text-xs sm:text-sm text-gray-600 italic">
                                {selectedAssessment.assessment.scaling.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Audience Reaction */}
                      {selectedAssessment.assessment.audience_reaction && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Audience Reaction</h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Engagement Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_reaction.engagement_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Reaction Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_reaction.reaction_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Comment Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_reaction.comment_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Share Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_reaction.share_rate}%
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600">Reaction Quality:</span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                selectedAssessment.assessment.audience_reaction.reaction_quality === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                selectedAssessment.assessment.audience_reaction.reaction_quality === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                selectedAssessment.assessment.audience_reaction.reaction_quality === 'passive' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {selectedAssessment.assessment.audience_reaction.reaction_quality?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.audience_reaction.insights && selectedAssessment.assessment.audience_reaction.insights.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="text-[10px] font-bold text-gray-600 mb-2 block">Insights:</span>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                  {selectedAssessment.assessment.audience_reaction.insights.map((insight, idx) => (
                                    <li key={idx}>{insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedAssessment.assessment.audience_reaction.social_signals && selectedAssessment.assessment.audience_reaction.social_signals.length > 0 && (
                              <div className="mt-2">
                                <span className="text-[10px] font-bold text-gray-600 mb-2 block">Social Signals:</span>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                  {selectedAssessment.assessment.audience_reaction.social_signals.map((signal, idx) => (
                                    <li key={idx}>{signal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Video Behavior */}
                      {selectedAssessment.assessment.video_behavior && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Video Behavior</h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Play Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.video_behavior.play_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Completion Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.video_behavior.completion_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">30+ Sec Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.video_behavior['30_sec_rate']}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Avg Watch Time:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.video_behavior.avg_watch_time}s
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600">Behavior:</span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                selectedAssessment.assessment.video_behavior.behavior === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                selectedAssessment.assessment.video_behavior.behavior === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                selectedAssessment.assessment.video_behavior.behavior === 'disengaged' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedAssessment.assessment.video_behavior.behavior?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Intent Signals */}
                      {selectedAssessment.assessment.intent_signals && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Intent Signals</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Link Click Rate:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.intent_signals.link_click_rate}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Add to Cart Rate:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.intent_signals.add_to_cart_rate}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Purchase Intent Score:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.intent_signals.purchase_intent_score}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Click Quality Ratio:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.intent_signals.click_quality_ratio.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sway Analysis */}
                      {selectedAssessment.assessment.sway_analysis && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Sway Analysis</h4>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600">Sway Score:</span>
                              <span className="text-lg sm:text-xl font-bold text-gray-800">
                                {selectedAssessment.assessment.sway_analysis.sway_score}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600">Sway Level:</span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                selectedAssessment.assessment.sway_analysis.sway_level === 'strong' ? 'bg-green-100 text-green-800' :
                                selectedAssessment.assessment.sway_analysis.sway_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {selectedAssessment.assessment.sway_analysis.sway_level?.toUpperCase() || 'N/A'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.sway_analysis.factors && selectedAssessment.assessment.sway_analysis.factors.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="text-[10px] font-bold text-gray-600 mb-2 block">Factors:</span>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                  {selectedAssessment.assessment.sway_analysis.factors.map((factor, idx) => (
                                    <li key={idx}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedAssessment.assessment.sway_analysis.interpretation && (
                              <div className="mt-2 text-xs text-gray-600 italic">
                                {selectedAssessment.assessment.sway_analysis.interpretation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Optimization Strategies */}
                      {selectedAssessment.assessment.optimization_strategies && selectedAssessment.assessment.optimization_strategies.length > 0 && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Optimization Strategies</h4>
                          <div className="space-y-4">
                            {selectedAssessment.assessment.optimization_strategies.map((strategy, idx) => (
                              <div key={idx} className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                    strategy.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    strategy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {strategy.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                                  </span>
                                  <span className="font-bold text-gray-800 text-xs sm:text-sm">
                                    {strategy.action}
                                  </span>
                                </div>
                                {strategy.reason && (
                                  <p className="text-xs text-gray-600 mb-2">{strategy.reason}</p>
                                )}
                                {strategy.suggestions && strategy.suggestions.length > 0 && (
                                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 ml-2">
                                    {strategy.suggestions.map((suggestion, sIdx) => (
                                      <li key={sIdx}>{suggestion}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {selectedAssessment.assessment.recommendations && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Recommendations</h4>
                          <div className="space-y-3">
                            {selectedAssessment.assessment.recommendations.primary && (
                              <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 font-semibold mb-1 sm:mb-0 sm:mr-2">Primary:</span>
                                <span className="font-bold text-[#1e4a79] break-words">
                                  {selectedAssessment.assessment.recommendations.primary}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.recommendations.all && selectedAssessment.assessment.recommendations.all.length > 0 && (
                              <div>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">All Recommendations</span>
                                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 pl-2">
                                  {selectedAssessment.assessment.recommendations.all.map((action, idx) => (
                                    <li key={idx} className="break-words">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // CAMPAIGN/ADSET ASSESSMENT STRUCTURE (existing code)
                    <>
                      {/* Metrics Section */}
                      <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Key Metrics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined ? selectedAssessment.cpa.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.spend ? selectedAssessment.spend.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.revenue ? selectedAssessment.revenue.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Purchases</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.purchases ? selectedAssessment.purchases.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          {(selectedAssessment.ctr !== null && selectedAssessment.ctr !== undefined) && (
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.ctr ? `${selectedAssessment.ctr.toFixed(2)}%` : 'N/A'}
                              </span>
                            </div>
                          )}
                          {(selectedAssessment.impressions !== null && selectedAssessment.impressions !== undefined) && (
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Impressions</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.impressions ? selectedAssessment.impressions.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                  {/* Summary Section */}
                  <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                      {selectedAssessment.assessment.summary || 'No summary available'}
                    </p>
                  </div>

                  {/* Action & Status */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 flex flex-col">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Action</span>
                      <div className="mt-1">
                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getStatusClasses(selectedAssessment.assessment.status || selectedAssessment.assessment.action)}`}>
                          {selectedAssessment.assessment.action}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</span>
                      <div className="mt-1">
                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getStatusClasses(selectedAssessment.assessment.status)}`}>
                          {selectedAssessment.assessment.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Section */}
                  {selectedAssessment.assessment.performance && (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-4 sm:mb-5 uppercase tracking-wide">Performance vs Industry</h4>
                      
                      {/* VS Industry */}
                      {selectedAssessment.assessment.performance.vs_industry && (
                        <div className="space-y-4">
                          {/* ROAS Comparison */}
                          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">ROAS</span>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                {/* Current */}
                                <div className="text-center sm:text-left">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Your Campaign</div>
                                  <div className="text-xl sm:text-2xl font-bold text-[#1e4a79]">
                                    {selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                                  </div>
                                </div>
                                {/* Industry */}
                                <div className="text-center sm:text-left border-l border-gray-200 pl-4">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Industry Avg</div>
                                  <div className="text-xl sm:text-2xl font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.vs_industry.industry_roas_benchmark}x
                                  </div>
                                </div>
                              </div>
                              {/* Difference */}
                              <div className="pt-3 border-t border-gray-100 flex items-center justify-center sm:justify-start gap-2">
                                <span className="text-xs text-gray-600">Difference:</span>
                                <span className={`text-sm font-bold ${selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark !== null 
                                    ? `${selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark >= 0 ? '+' : ''}${selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark.toFixed(1)}%`
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* CPA Comparison */}
                          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">CPA</span>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                {/* Current */}
                                <div className="text-center sm:text-left">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Your Campaign</div>
                                  <div className="text-xl sm:text-2xl font-bold text-[#1e4a79]">
                                    {selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined ? selectedAssessment.cpa.toLocaleString() : 'N/A'}
                                  </div>
                                </div>
                                {/* Industry */}
                                <div className="text-center sm:text-left border-l border-gray-200 pl-4">
                                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Industry Avg</div>
                                  <div className="text-xl sm:text-2xl font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.vs_industry.industry_cpa_benchmark}
                                  </div>
                                </div>
                              </div>
                              {/* Difference */}
                              <div className="pt-3 border-t border-gray-100 flex items-center justify-center sm:justify-start gap-2">
                                <span className="text-xs text-gray-600">Difference:</span>
                                <span className={`text-sm font-bold ${selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark !== null 
                                    ? `${selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark >= 0 ? '+' : ''}${selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark.toFixed(1)}%`
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Profitability */}
                      {selectedAssessment.assessment.performance.profitability && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Profitability</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Profit Margin:</span>
                              <span className="font-bold text-gray-800 break-words">
                                {selectedAssessment.assessment.performance.profitability.profit_margin_percent !== null 
                                  ? `${selectedAssessment.assessment.performance.profitability.profit_margin_percent.toFixed(1)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Net Profit:</span>
                              <span className={`font-bold break-words ${selectedAssessment.assessment.performance.profitability.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedAssessment.assessment.performance.profitability.net_profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Revenue:</span>
                              <span className="font-bold text-gray-800 break-words">
                                {selectedAssessment.assessment.performance.profitability.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Spend:</span>
                              <span className="font-bold text-gray-800 break-words">
                                {selectedAssessment.assessment.performance.profitability.spend.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cost Efficiency */}
                      {selectedAssessment.assessment.performance.cost_efficiency && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Efficiency</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">CTR:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.ctr ? `${selectedAssessment.assessment.performance.cost_efficiency.ctr.toFixed(2)}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">CPC:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.cpc ? selectedAssessment.assessment.performance.cost_efficiency.cpc.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">CPM:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.cpm ? selectedAssessment.assessment.performance.cost_efficiency.cpm.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Unique CTR:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.unique_ctr ? `${selectedAssessment.assessment.performance.cost_efficiency.unique_ctr.toFixed(2)}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Impressions:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.impressions ? selectedAssessment.assessment.performance.cost_efficiency.impressions.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Clicks:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.clicks ? selectedAssessment.assessment.performance.cost_efficiency.clicks.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Reach:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.reach ? selectedAssessment.assessment.performance.cost_efficiency.reach.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Unique Clicks:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.cost_efficiency.unique_clicks ? selectedAssessment.assessment.performance.cost_efficiency.unique_clicks.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Engagement */}
                      {selectedAssessment.assessment.performance.engagement && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Engagement</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Link Clicks:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.link_clicks ? selectedAssessment.assessment.performance.engagement.link_clicks.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Add to Cart:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.add_to_cart ? selectedAssessment.assessment.performance.engagement.add_to_cart.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Leads:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.leads ? selectedAssessment.assessment.performance.engagement.leads.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Video Views:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.video_views ? selectedAssessment.assessment.performance.engagement.video_views.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Post Engagements:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.post_engagements ? selectedAssessment.assessment.performance.engagement.post_engagements.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Post Reactions:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.post_reactions ? selectedAssessment.assessment.performance.engagement.post_reactions.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Post Comments:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.post_comments ? selectedAssessment.assessment.performance.engagement.post_comments.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Post Shares:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.post_shares ? selectedAssessment.assessment.performance.engagement.post_shares.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Page Engagements:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.engagement.page_engagements ? selectedAssessment.assessment.performance.engagement.page_engagements.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cost Per Action */}
                      {selectedAssessment.assessment.performance.cost_per_action && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Per Action</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                            {selectedAssessment.assessment.performance.cost_per_action.cost_per_link_click !== null && (
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Cost per Link Click:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_link_click.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.cost_per_action.cost_per_add_to_cart !== null && (
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Cost per Add to Cart:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_add_to_cart.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.cost_per_action.cost_per_lead !== null && (
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Cost per Lead:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_lead.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.cost_per_action.cost_per_video_view !== null && (
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Cost per Video View:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_video_view.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.performance.cost_per_action.cost_per_engagement !== null && (
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Cost per Engagement:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_engagement.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Conversion Rates */}
                      {selectedAssessment.assessment.performance.conversion_rates && (
                        <div>
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Conversion Rates</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Click to Purchase Rate:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate !== null && selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate !== undefined
                                  ? `${selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate.toFixed(2)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-600 mb-1">Add to Cart Rate:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate !== null && selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate !== undefined
                                  ? `${selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate.toFixed(2)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Health Section */}
                  {selectedAssessment.assessment.health && (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Health Metrics</h4>
                      
                      {/* Frequency */}
                      {selectedAssessment.assessment.health.frequency && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Frequency</h5>
                          <div className="text-xs sm:text-sm">
                            <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Value:</span>
                              <span className="font-bold text-gray-800">
                                {selectedAssessment.assessment.health.frequency.value}x
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-600 italic break-words">
                              {selectedAssessment.assessment.health.frequency.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Creative Fatigue */}
                      {selectedAssessment.assessment.health.creative_fatigue && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Creative Fatigue</h5>
                          <div className="text-xs sm:text-sm space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CTR Decline:</span>
                              <span className={`font-bold break-words ${selectedAssessment.assessment.health.creative_fatigue.ctr_decline_percent > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {selectedAssessment.assessment.health.creative_fatigue.ctr_decline_percent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-600 italic break-words">
                              {selectedAssessment.assessment.health.creative_fatigue.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Learning Phase */}
                      {selectedAssessment.assessment.health.learning_phase && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Learning Phase</h5>
                          <div className="text-xs sm:text-sm">
                            <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">In Learning:</span>
                              <span className={`font-bold ${selectedAssessment.assessment.health.learning_phase.is_in_learning ? 'text-yellow-600' : 'text-green-600'}`}>
                                {selectedAssessment.assessment.health.learning_phase.is_in_learning ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-600 break-words">
                              Status: {selectedAssessment.assessment.health.learning_phase.status_display || selectedAssessment.assessment.health.learning_phase.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Status */}
                      {(selectedAssessment.assessment.health.delivery_status || selectedAssessment.effective_status || selectedAssessment.configured_status || (selectedAssessment.delivery_issues && selectedAssessment.delivery_issues.length > 0)) && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Delivery Status</h5>
                          <div className="text-xs sm:text-sm space-y-2">
                            {(selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Effective Status:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                  (selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : (selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) === 'PAUSED'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status}
                                </span>
                              </div>
                            )}
                            {(selectedAssessment.assessment.health.delivery_status?.configured_status || selectedAssessment.configured_status) && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Configured Status:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.delivery_status?.configured_status || selectedAssessment.configured_status}
                                </span>
                              </div>
                            )}
                            {((selectedAssessment.assessment.health.delivery_status?.has_issues && selectedAssessment.assessment.health.delivery_status.issues && selectedAssessment.assessment.health.delivery_status.issues.length > 0) || 
                              (selectedAssessment.delivery_issues && selectedAssessment.delivery_issues.length > 0)) && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-[10px] font-bold text-red-600 mb-1 block">
                                  Delivery Issues ({selectedAssessment.assessment.health.delivery_status?.issues?.length || selectedAssessment.delivery_issues?.length || 0}):
                                </span>
                                <div className="space-y-1">
                                  {(selectedAssessment.assessment.health.delivery_status?.issues || selectedAssessment.delivery_issues || []).slice(0, 5).map((issue, idx) => (
                                    <div key={idx} className="text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded">
                                      {issue.error_code || issue.error_message || issue.error_title || issue.error_subcode || JSON.stringify(issue)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quality Rankings */}
                      {selectedAssessment.assessment.health.quality_rankings && (
                        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Quality Rankings</h5>
                          <div className="text-xs sm:text-sm space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Quality Status:</span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                selectedAssessment.assessment.health.quality_rankings.quality_status === 'GOOD' 
                                  ? 'bg-green-100 text-green-800' 
                                  : selectedAssessment.assessment.health.quality_rankings.quality_status === 'WARNING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedAssessment.assessment.health.quality_rankings.quality_status}
                              </span>
                            </div>
                            {selectedAssessment.assessment.health.quality_rankings.total_ads !== null && selectedAssessment.assessment.health.quality_rankings.total_ads !== undefined && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Total Ads:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.quality_rankings.total_ads}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.health.quality_rankings.average_quality_score !== null && selectedAssessment.assessment.health.quality_rankings.average_quality_score !== undefined && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Average Quality Score:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.quality_rankings.average_quality_score.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.health.quality_rankings.distribution && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-[10px] font-bold text-gray-600 mb-1 block">Distribution:</span>
                                <div className="grid grid-cols-3 gap-2 text-[10px]">
                                  {selectedAssessment.assessment.health.quality_rankings.distribution.ABOVE_AVERAGE !== undefined && (
                                    <div className="text-center">
                                      <div className="font-bold text-green-700">{selectedAssessment.assessment.health.quality_rankings.distribution.ABOVE_AVERAGE || 0}</div>
                                      <div className="text-gray-600">Above Avg</div>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.health.quality_rankings.distribution.AVERAGE !== undefined && (
                                    <div className="text-center">
                                      <div className="font-bold text-yellow-700">{selectedAssessment.assessment.health.quality_rankings.distribution.AVERAGE || 0}</div>
                                      <div className="text-gray-600">Average</div>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.health.quality_rankings.distribution.BELOW_AVERAGE !== undefined && (
                                    <div className="text-center">
                                      <div className="font-bold text-red-700">{selectedAssessment.assessment.health.quality_rankings.distribution.BELOW_AVERAGE || 0}</div>
                                      <div className="text-gray-600">Below Avg</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Age Fields */}
                      {(selectedAssessment.assessment.health.adset_age_days !== null && selectedAssessment.assessment.health.adset_age_days !== undefined) || 
                       (selectedAssessment.assessment.health.data_age_days !== null && selectedAssessment.assessment.health.data_age_days !== undefined) ? (
                        <div>
                          <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Age Information</h5>
                          <div className="text-xs sm:text-sm space-y-2">
                            {selectedAssessment.assessment.health.adset_age_days !== null && selectedAssessment.assessment.health.adset_age_days !== undefined && (
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">AdSet Age:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.adset_age_days} days
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.health.data_age_days !== null && selectedAssessment.assessment.health.data_age_days !== undefined && (
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Data Age:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.health.data_age_days} days
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Top/Bottom Ads Section */}
                  {(selectedAssessment.top_ads && selectedAssessment.top_ads.length > 0) || (selectedAssessment.bottom_ads && selectedAssessment.bottom_ads.length > 0) ? (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Ad Performance Summary</h4>
                      
                      {/* Top Ads */}
                      {selectedAssessment.top_ads && selectedAssessment.top_ads.length > 0 && (
                        <div className="mb-4 sm:mb-6">
                          <h5 className="text-[10px] sm:text-xs font-bold text-green-700 mb-2 sm:mb-3">Top Performing Ads ({selectedAssessment.top_ads.length})</h5>
                          <div className="space-y-2 sm:space-y-3">
                            {selectedAssessment.top_ads.map((ad, idx) => (
                              <div key={ad.id || idx} className="bg-white border border-green-200 rounded-lg p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="font-bold text-xs sm:text-sm text-gray-800 mb-1">{ad.name || `Ad ${idx + 1}`}</div>
                                    <div className="text-[10px] text-gray-500">ID: {ad.id}</div>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {ad.quality_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.quality_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Quality: {ad.quality_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                    {ad.engagement_rate_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.engagement_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.engagement_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Engagement: {ad.engagement_rate_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                    {ad.conversion_rate_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.conversion_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.conversion_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Conversion: {ad.conversion_rate_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-xs">
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">ROAS</div>
                                    <div className="font-bold text-gray-800">{ad.roas ? `${ad.roas}x` : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Spend</div>
                                    <div className="font-bold text-gray-800">{ad.spend ? ad.spend.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Revenue</div>
                                    <div className="font-bold text-gray-800">{ad.revenue ? ad.revenue.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Purchases</div>
                                    <div className="font-bold text-gray-800">{ad.purchases ? ad.purchases.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">CTR</div>
                                    <div className="font-bold text-gray-800">{ad.ctr ? `${ad.ctr}%` : 'N/A'}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Ads */}
                      {selectedAssessment.bottom_ads && selectedAssessment.bottom_ads.length > 0 && (
                        <div>
                          <h5 className="text-[10px] sm:text-xs font-bold text-red-700 mb-2 sm:mb-3">Underperforming Ads ({selectedAssessment.bottom_ads.length})</h5>
                          <div className="space-y-2 sm:space-y-3">
                            {selectedAssessment.bottom_ads.map((ad, idx) => (
                              <div key={ad.id || idx} className="bg-white border border-red-200 rounded-lg p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="font-bold text-xs sm:text-sm text-gray-800 mb-1">{ad.name || `Ad ${idx + 1}`}</div>
                                    <div className="text-[10px] text-gray-500">ID: {ad.id}</div>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {ad.quality_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.quality_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Quality: {ad.quality_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                    {ad.engagement_rate_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.engagement_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.engagement_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Engagement: {ad.engagement_rate_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                    {ad.conversion_rate_ranking && (
                                      <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                                        ad.conversion_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                        ad.conversion_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        Conversion: {ad.conversion_rate_ranking.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-xs">
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">ROAS</div>
                                    <div className="font-bold text-gray-800">{ad.roas ? `${ad.roas}x` : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Spend</div>
                                    <div className="font-bold text-gray-800">{ad.spend ? ad.spend.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Revenue</div>
                                    <div className="font-bold text-gray-800">{ad.revenue ? ad.revenue.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">Purchases</div>
                                    <div className="font-bold text-gray-800">{ad.purchases ? ad.purchases.toLocaleString() : 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5">CTR</div>
                                    <div className="font-bold text-gray-800">{ad.ctr ? `${ad.ctr}%` : 'N/A'}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Trend Section */}
                  {selectedAssessment.assessment.trend && (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Performance Trend</h4>
                      <div className="space-y-3">
                        {/* Period Comparison Info */}
                        {selectedAssessment.assessment.trend.period_days && (
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-2">
                              Comparing last {selectedAssessment.assessment.trend.period_days} days vs previous {selectedAssessment.assessment.trend.period_days} days
                            </p>
                            {selectedAssessment.assessment.trend.current_period && selectedAssessment.assessment.trend.previous_period && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-xs text-gray-500">
                                <div>
                                  <span className="font-semibold text-gray-600">Current Period: </span>
                                  {(() => {
                                    const start = new Date(selectedAssessment.assessment.trend.current_period.start_date);
                                    const end = new Date(selectedAssessment.assessment.trend.current_period.end_date);
                                    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined });
                                    return `${startFormatted} - ${endFormatted}`;
                                  })()}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">Previous Period: </span>
                                  {(() => {
                                    const start = new Date(selectedAssessment.assessment.trend.previous_period.start_date);
                                    const end = new Date(selectedAssessment.assessment.trend.previous_period.end_date);
                                    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined });
                                    return `${startFormatted} - ${endFormatted}`;
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-gray-600 text-xs sm:text-sm font-semibold">Trend:</span>
                          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${selectedAssessment.assessment.trend.trend === 'improving' ? 'bg-green-100 text-green-800' : selectedAssessment.assessment.trend.trend === 'declining' ? 'bg-red-100 text-red-800' : selectedAssessment.assessment.trend.trend === 'stable' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {selectedAssessment.assessment.trend.trend?.toUpperCase() || 'INSUFFICIENT_DATA'}
                          </span>
                        </div>
                        {selectedAssessment.assessment.trend.change_pct !== null && selectedAssessment.assessment.trend.change_pct !== undefined && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-gray-600 text-xs sm:text-sm">Change:</span>
                            <span className={`text-sm sm:text-base font-bold ${selectedAssessment.assessment.trend.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedAssessment.assessment.trend.change_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.trend.change_pct.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Current ROAS</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              {selectedAssessment.assessment.trend.current_roas ? `${selectedAssessment.assessment.trend.current_roas}x` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Previous ROAS</span>
                            <span className="text-base sm:text-lg font-bold text-gray-600">
                              {selectedAssessment.assessment.trend.previous_roas ? `${selectedAssessment.assessment.trend.previous_roas}x` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Budget Pacing Section */}
                  {selectedAssessment.assessment.budget_pacing && (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Budget Pacing</h4>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-gray-600 text-xs sm:text-sm font-semibold">Utilization:</span>
                          <span className={`text-base sm:text-lg font-bold ${selectedAssessment.assessment.budget_pacing.utilization_percent > 100 ? 'text-red-600' : selectedAssessment.assessment.budget_pacing.utilization_percent > 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {selectedAssessment.assessment.budget_pacing.utilization_percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Daily Budget</span>
                            <span className="text-sm sm:text-base font-bold text-gray-800">
                              {selectedAssessment.assessment.budget_pacing.daily_budget ? selectedAssessment.assessment.budget_pacing.daily_budget.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Expected Spend</span>
                            <span className="text-sm sm:text-base font-bold text-gray-800">
                              {selectedAssessment.assessment.budget_pacing.expected_spend ? selectedAssessment.assessment.budget_pacing.expected_spend.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Actual Spend</span>
                            <span className={`text-sm sm:text-base font-bold ${selectedAssessment.assessment.budget_pacing.actual_spend > selectedAssessment.assessment.budget_pacing.expected_spend ? 'text-red-600' : selectedAssessment.assessment.budget_pacing.actual_spend < selectedAssessment.assessment.budget_pacing.expected_spend * 0.9 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {selectedAssessment.assessment.budget_pacing.actual_spend ? selectedAssessment.assessment.budget_pacing.actual_spend.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Difference</span>
                            <span className={`text-sm sm:text-base font-bold ${(selectedAssessment.assessment.budget_pacing.actual_spend - selectedAssessment.assessment.budget_pacing.expected_spend) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {selectedAssessment.assessment.budget_pacing.expected_spend && selectedAssessment.assessment.budget_pacing.actual_spend !== undefined 
                                ? `${(selectedAssessment.assessment.budget_pacing.actual_spend - selectedAssessment.assessment.budget_pacing.expected_spend) >= 0 ? '+' : ''}${(selectedAssessment.assessment.budget_pacing.actual_spend - selectedAssessment.assessment.budget_pacing.expected_spend).toLocaleString()}`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Targets Section */}
                  {selectedAssessment.assessment.targets && (
                    <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Targets</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Stage:</span>
                          <span className="font-bold text-gray-800 uppercase break-words">
                            {selectedAssessment.assessment.targets.stage}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">ROAS Target:</span>
                          <span className="font-bold text-gray-800 break-words">
                            {selectedAssessment.assessment.targets.roas_target}x
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current ROAS:</span>
                          <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.roas ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAssessment.assessment.targets.current_roas}x
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CPA Cap:</span>
                          <span className="font-bold text-gray-800 break-words">
                            {selectedAssessment.assessment.targets.cpa_cap}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CPA:</span>
                          <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.cpa ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAssessment.assessment.targets.current_cpa !== null && selectedAssessment.assessment.targets.current_cpa !== undefined 
                              ? selectedAssessment.assessment.targets.current_cpa.toLocaleString() 
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Meets Target:</span>
                          <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.overall ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAssessment.assessment.targets.meets_target?.overall ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                      {/* Recommendations Section */}
                      {selectedAssessment.assessment.recommendations && (
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Recommendations</h4>
                          <div className="space-y-3">
                            {selectedAssessment.assessment.recommendations.scaling && (
                              <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 font-semibold mb-1 sm:mb-0 sm:mr-2">Scaling:</span>
                                <span className="font-bold text-[#1e4a79] break-words">
                                  {selectedAssessment.assessment.recommendations.scaling}
                                </span>
                              </div>
                            )}
                            {selectedAssessment.assessment.recommendations.detailed_actions && selectedAssessment.assessment.recommendations.detailed_actions.length > 0 && (
                              <div>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">Detailed Actions</span>
                                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 pl-2">
                                  {selectedAssessment.assessment.recommendations.detailed_actions.map((action, idx) => (
                                    <li key={idx} className="break-words">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <p className="text-xs sm:text-sm">No detailed assessment available for this campaign.</p>
                  {getAssessment(selectedAssessment).summary && (
                    <div className="mt-4 bg-[#f8fafc] p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700 break-words">{getAssessment(selectedAssessment).summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 flex justify-center sm:justify-end flex-shrink-0 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-2 bg-[#1e4a79] text-white rounded-full text-sm sm:text-base font-bold shadow-lg hover:bg-[#2c6aa8] transition-all transform hover:scale-105 touch-manipulation"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
export default PerformanceExplorer


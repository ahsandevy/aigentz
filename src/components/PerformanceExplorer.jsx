import { useState, useEffect, useMemo } from 'react'
import { analyticsAPI } from '../services/api'

function PerformanceExplorer() {
  const [activeTab, setActiveTab] = useState('Campaigns')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedAI, setSelectedAI] = useState(null)

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

  const getStatusClasses = (action) => {
    switch (action) {
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
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight">
                  <th className="px-6 py-6 text-left">Ad Set</th>
                  <th className="px-6 py-6 text-left">Audience Strategy</th>
                  <th className="px-6 py-6 text-center">Funnel Role</th>
                  <th className="px-6 py-6 text-center">Budget</th>
                  <th className="px-6 py-6 text-center">AI Detection Signal</th>
                  <th className="px-6 py-6 text-center whitespace-nowrap">Assessment</th>
                  <th className="px-6 py-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdSets.map((as) => (
                  <tr key={as.id} className="bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-bold tracking-tight">
                      {as.budget_readable}
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center text-[12px] text-[#334155] leading-tight font-medium">
                        <div><span className="font-extrabold text-[#1e293b]">ROAS:</span> {as.roas}x</div>
                        <div><span className="font-extrabold text-[#1e293b]">CPA:</span> {as.cpa}</div>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap ${getStatusClasses(as.action)}`}>
                        {as.assessment}
                      </span>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap`}>
                          {as.action}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'Ads' ? (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                  <th className="px-6 py-6 text-left">Ad Name</th>
                  <th className="px-6 py-6 text-center">Format</th>
                  <th className="px-6 py-6 text-center">Fatigue</th>
                  <th className="px-6 py-6 text-center">Spend</th>
                  <th className="px-6 py-6 text-center">ROAS</th>
                  <th className="px-6 py-6 text-center">CTR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    name: 'Ad_Video_15s_SneakerDrop_UGC_V1',
                    format: 'Video',
                    fatigue: '72',
                    spend: '385K PKR',
                    roas: '2.40x',
                    ctr: '1.82%'
                  },
                  {
                    id: 2,
                    name: 'AD_Carousel_ATR_Reminder_V3',
                    format: 'Carousel',
                    fatigue: '61',
                    spend: '420K PKR',
                    roas: '5.30x',
                    ctr: '4.32%'
                  },
                  {
                    id: 3,
                    name: 'AD_Video_30s_Brand_Story_V1',
                    format: 'Video',
                    fatigue: '56',
                    spend: '300K PKR',
                    roas: '2.40x',
                    ctr: '1.91%'
                  },
                  {
                    id: 4,
                    name: 'AD_Image_Discount_150ff_V1',
                    format: 'Image',
                    fatigue: '49',
                    spend: '420K PKR',
                    roas: '2.40x',
                    ctr: '4.10%'
                  }
                ].map((ad) => (
                  <tr key={ad.id} className="bg-white border-b border-[#cbd5e1]/40 last:border-0">
                    <td className="px-6 py-8 text-[12px] text-[#334155] font-medium">
                      {ad.name}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {ad.format}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {ad.fatigue}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {ad.spend}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {ad.roas}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {ad.ctr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'Audiences' ? (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                  <th className="px-6 py-6 text-left">Audience</th>
                  <th className="px-6 py-6 text-center">Funnel Role</th>
                  <th className="px-6 py-6 text-center">Size</th>
                  <th className="px-6 py-6 text-center">Spend Share</th>
                  <th className="px-6 py-6 text-center">Performance Signal</th>
                  <th className="px-6 py-6 text-left">AI Insight & Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    name: 'Add To Cart 14D',
                    role: 'Lower Funnel',
                    roleSub: 'High Intent',
                    size: '18.7K',
                    share: '34% (↑ high)',
                    signal: 'Elite Converter',
                    signalColor: 'bg-[#bef264]/90 text-[#3f6212]',
                    insight: 'Converting efficiently but nearing saturation',
                    action: 'Cap Frequency, Scale via Lookalikes'
                  },
                  {
                    id: 2,
                    name: 'Website Purchasers 180D',
                    role: 'Lower Funnel',
                    roleSub: 'Loyalty',
                    size: '42.3K',
                    share: '18% (↓ low)',
                    signal: 'Underutilized Asset',
                    signalColor: 'bg-[#fef08a]/90 text-[#854d0e]',
                    insight: 'High ROAS, limited scale',
                    action: 'Increase Retention & Cross-Sell Campaigns'
                  },
                  {
                    id: 3,
                    name: 'Lookalike 1% Purchasers 180D',
                    role: 'Prospecting',
                    roleSub: 'Qualified Scale',
                    size: '2.14M',
                    share: '21% (↓ low)',
                    signal: 'Scale Constrained',
                    signalColor: 'bg-[#fdba74]/90 text-[#9a3412]',
                    insight: 'Strong audience quality but creative fatigue',
                    action: 'Refresh Creatives before Scaling'
                  },
                  {
                    id: 4,
                    name: 'Page Engagers 30D',
                    role: 'Mid Funnel',
                    roleSub: 'Warm',
                    size: '156K',
                    share: '27% (↑ high)',
                    signal: 'Low Purchase Intent',
                    signalColor: 'bg-[#fca5a5]/90 text-[#991b1b]',
                    insight: 'Absorbing budget without conversion',
                    action: 'Reduce Spend, Tighten Window or Exclude'
                  }
                ].map((aud) => (
                  <tr key={aud.id} className="bg-white border-b border-[#cbd5e1]/40 last:border-0">
                    <td className="px-6 py-8 text-[12px] text-[#334155] font-medium">
                      {aud.name}
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="px-5 py-1 bg-white border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold rounded-full shadow-sm">
                          {aud.role}
                        </span>
                        <span className="text-[11px] text-[#94a3b8] font-medium">
                          {aud.roleSub}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {aud.size}
                    </td>
                    <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-medium">
                      {aud.share}
                    </td>
                    <td className="px-6 py-8 text-center">
                      <span className={`px-6 py-1 ${aud.signalColor} text-[11px] font-bold rounded-[30px] shadow-sm inline-block min-w-[150px]`}>
                        {aud.signal}
                      </span>
                    </td>
                    <td className="px-6 py-8 text-left max-w-[300px]">
                      <div className="text-[12px] text-[#64748b] leading-relaxed">
                        {aud.insight} <span className="text-[#334155]">↗</span> <span className="font-bold text-[#334155]">{aud.action}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
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
                {filteredCampaigns.map((cp) => (
                  <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
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
                        <div><span className="font-bold text-gray-800">CPA:</span> {cp.cpa.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[11px] text-gray-500 hidden md:table-cell max-w-xs overflow-hidden text-ellipsis">
                      <div className="text-center italic leading-snug">
                        {cp.assessment}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap ${getStatusClasses(cp.action)}`}>
                          {cp.action}
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
                ))}
              </tbody>
            </table>
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
    </section>
  )

}
export default PerformanceExplorer

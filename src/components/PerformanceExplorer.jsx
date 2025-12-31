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
    <section className="mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1e4a79]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e4a79]">Performance Explorer</h2>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[rgba(250,250,250,0.55)] border border-[#c8c8a1] rounded-[30px] text-sm text-[#374151] shadow-[2px_2px_4px_0px_#cfcfcf] focus:outline-none w-full md:w-64 focus:ring-1 focus:ring-[#1e4a79] focus:border-[#1e4a79] transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#fafafa] border border-[#c8c8a1] rounded-t-[30px] border-b-0 p-4 shadow-[2px_2px_4px_0px_#cfcfcf] overflow-x-auto">
        <div className="flex justify-start md:justify-center gap-4 md:gap-16 min-w-max">
          {['Campaigns', 'Ad Sets', 'Ads', 'Audiences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-2 rounded-[30px] font-bold transition-all duration-200 whitespace-nowrap ${activeTab === tab
                ? 'bg-[#EDF0A8] text-[#374151] shadow-md transform scale-105'
                : 'text-[#374151] hover:text-[#1e4a79] hover:bg-[#ebf1f8]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#ebf1f8] rounded-b-lg border border-[#c8c8a1] border-t-0 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#ebf1f8]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#374151] uppercase tracking-wider">Campaign Name</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden lg:table-cell">Funnel</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden sm:table-cell">Spend (PKR)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider">Metics</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider hidden md:table-cell">Assessment</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#374151] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-[#ebf1f8]">
                {filteredCampaigns.map((cp) => (
                  <tr key={cp.id} className="border-b border-[#c8c8a1] hover:bg-[#f0f4f8] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#374151]">
                      {cp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-0.5 bg-white border border-gray-300 text-gray-600 text-[10px] rounded-full shadow-sm font-bold uppercase tracking-tight">{cp.funnel_stage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] text-center hidden sm:table-cell font-bold">
                      {cp.spend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                      <div className="flex flex-col items-center text-xs">
                        <div><span className="font-bold">ROAS:</span> {cp.roas}x</div>
                        <div><span className="font-bold">CPA:</span> {cp.cpa.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[11px] text-[#374151] hidden md:table-cell max-w-xs overflow-hidden text-ellipsis">
                      <div className="text-center italic text-gray-600">
                        {cp.assessment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap ${getStatusClasses(cp.action)}`}>
                          {cp.action}
                        </span>
                        <button
                          onClick={() => handleAIRequest(cp.id)}
                          className="text-[10px] text-[#1e4a79] underline hover:text-[#3b82f6] transition-colors"
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


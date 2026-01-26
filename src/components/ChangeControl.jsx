import { useAppliedRecommendations } from '../hooks/useAppliedRecommendations'

function ChangeControl() {
  const { data: appliedRecommendations, isLoading } = useAppliedRecommendations(50)

  // Helper to format log details based on recommendation type
  const getLogDetails = (rec) => {
    const typeMap = {
      'budget_reallocation': 'Budget Optimization',
      'creative_analysis': 'Creative Analysis',
      'placement_optimization': 'Placement Optimization',
      'audience_optimization': 'Audience Optimization',
      'bidding_strategy_optimization': 'Bidding Strategy',
      'dayparting': 'Dayparting Optimization'
    }

    const title = typeMap[rec.recommendation_type] || rec.recommendation_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    let desc = 'Applied optimization changes.'

    // Color mapping logic
    let color = 'bg-[#84cc16]' // Default Green

    if (rec.recommendation_type === 'creative_analysis') {
      color = 'bg-[#f97316]' // Orange
    } else if (rec.recommendation_type.includes('optimization') || rec.recommendation_type === 'dayparting') {
      color = 'bg-[#eab308]' // Yellow
    }

    // Description generation logic
    if (rec.changes && rec.changes.length > 0) {
      // Look for the most significant change or summarize
      const change = rec.changes[0] // Take the first change for now
      const entityName = change.entity_name || 'Unknown Entity'

      switch (rec.recommendation_type) {
        case 'budget_reallocation':
          const pct = change.change_percentage ? `${Math.abs(change.change_percentage)}%` : ''
          const action = change.change_percentage > 0 ? 'Increased' : 'Decreased'
          desc = `${action} budget for ${entityName} ${pct ? `by ${pct}` : ''}`
          break
        case 'dayparting':
          desc = `Updated ad schedule for ${entityName}`
          break
        case 'creative_analysis':
          desc = `Creative updates applied to ${entityName}`
          break
        default:
          // Generic fallback
          desc = `${change.change_type.replace(/_/g, ' ')} applied to ${entityName}`
      }
    } else if (rec.recommendation && rec.recommendation.recommendation) {
      // Fallback to the recommendation title if specific changes aren't clear
      // We truncate it if it's too long
      desc = rec.recommendation.recommendation.length > 70
        ? rec.recommendation.recommendation.substring(0, 70) + '...'
        : rec.recommendation.recommendation
    }

    return { title, desc, color }
  }

  // Transform data or use empty array
  const auditLogs = appliedRecommendations?.map(getLogDetails) || []

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-8 h-8 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-3xl font-bold text-[#1e4a79]">Change Control</h2>
      </div>

      <div className="bg-[#EDF0A8] rounded-[20px] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm border border-[#e5e7eb]">
        {/* Audit Log */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-[#1e4a79] mb-4">Audit Log</h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                Loading logs...
              </div>
            ) : auditLogs.length > 0 ? (
              auditLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-1 ${log.color} rounded-full shrink-0`}></div>
                  <div>
                    <p className="font-bold text-[#374151] text-sm">{log.title}</p>
                    <p className="text-sm text-[#6b7280] leading-snug mt-0.5">{log.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                No active changes recorded.
              </div>
            )}
          </div>
        </div>

        {/* CMO Decision Notes */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-[#1e4a79] mb-4">CMO Decision Notes</h3>
          <div className="bg-[#f8fafc] rounded-lg p-4 flex-1 mb-4">
            <textarea
              placeholder="Add notes about decision, observations or strategic direction..."
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm text-[#374151] placeholder-gray-400"
            />
          </div>
          <div className="flex justify-center">
            <button className="flex items-center gap-2 bg-[#EDF0A8] text-[#1e4a79] px-8 py-2.5 rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
              </svg>
              Export Notes
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </section>
  )
}

export default ChangeControl



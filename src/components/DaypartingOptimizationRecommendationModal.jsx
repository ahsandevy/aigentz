function DaypartingOptimizationRecommendationModal({ isOpen, onClose, recommendation, rawData }) {
  if (!isOpen) {
    return null
  }

  // Use rawData if available, otherwise show loading or error
  if (!rawData?.recommendation) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose} style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Background overlay */}
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true"></div>
          {/* Modal content */}
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full shadow-xl z-[10000]">
            <p className="text-gray-600">Loading recommendation details...</p>
          </div>
        </div>
      </div>
    )
  }

  const rec = rawData.recommendation
  const scope = rec.scope
  const campaign = scope?.campaign
  const adset = scope?.adset
  const recommendedDayparting = scope?.recommended_dayparting

  // Helper function to format hour for display
  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  // Create 24-hour timeline visualization
  const render24HourTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const peakHours = recommendedDayparting?.peak_hours || []
    const lowHours = recommendedDayparting?.low_hours || []

    return (
      <div className="grid grid-cols-12 gap-1 mb-4">
        {hours.map((hour) => {
          const isPeak = peakHours.includes(hour)
          const isLow = lowHours.includes(hour)
          let bgColor = 'bg-gray-100'
          let textColor = 'text-gray-600'

          if (isPeak) {
            bgColor = 'bg-green-500'
            textColor = 'text-white'
          } else if (isLow) {
            bgColor = 'bg-red-500'
            textColor = 'text-white'
          }

          return (
            <div
              key={hour}
              className={`${bgColor} ${textColor} p-2 rounded text-xs text-center font-semibold`}
              title={formatHour(hour)}
            >
              {hour}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ zIndex: 9999 }}
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal container - separate from overlay */}
      <div
        className="fixed inset-0 overflow-y-auto"
        onClick={onClose}
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Modal panel */}
          <div
            className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e4a79] to-[#2c5f8d] px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 id="modal-title" className="text-xl font-bold text-white">Dayparting Optimization Details</h3>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Recommendation Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#1e4a79] mb-2">{rec.recommendation}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {rec.priority?.toUpperCase() || 'HIGH'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {rec.confidence}% Confidence
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                      rec.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {rec.risk_level?.toUpperCase() || 'LOW'} Risk
                  </span>
                </div>
              </div>

              {/* Campaign/Ad Set Details */}
              {(campaign || adset) && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                  <h5 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                    {scope?.type === 'campaign' ? 'Campaign' : 'Ad Set'} Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign && campaign.name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Campaign</p>
                        <p className="font-semibold text-gray-800">{campaign.name}</p>
                      </div>
                    )}
                    {adset && adset.name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ad Set</p>
                        <p className="font-semibold text-gray-800">{adset.name}</p>
                      </div>
                    )}
                    {adset && adset.campaign_name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Campaign</p>
                        <p className="font-semibold text-gray-800">{adset.campaign_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Distribution */}
              {scope?.current_distribution && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Current Distribution</h5>
                  <p className="text-sm text-gray-700">{scope.current_distribution}</p>
                </div>
              )}

              {/* Recommended Dayparting Schedule */}
              {recommendedDayparting && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-6">
                  <h5 className="font-bold text-[#1e4a79] mb-4 text-sm uppercase tracking-wide">Recommended Dayparting Schedule</h5>

                  {/* 24-Hour Timeline Visualization */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">24-Hour Timeline</p>
                    {render24HourTimeline()}
                    <div className="flex gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Peak Hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Low Hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 rounded"></div>
                        <span>Standard Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours Details */}
                  {recommendedDayparting.peak_hours && recommendedDayparting.peak_hours.length > 0 && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
                      <h6 className="font-bold text-green-800 mb-2 text-xs uppercase">Peak Hours</h6>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{recommendedDayparting.peak_hours_description}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        Hours: {recommendedDayparting.peak_hours.map(h => formatHour(h)).join(', ')}
                      </p>
                      <p className="text-sm text-green-700 font-semibold">
                        Budget Increase: +{recommendedDayparting.peak_budget_increase_pct}%
                      </p>
                    </div>
                  )}

                  {/* Low Hours Details */}
                  {recommendedDayparting.low_hours && recommendedDayparting.low_hours.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                      <h6 className="font-bold text-red-800 mb-2 text-xs uppercase">Low Hours</h6>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{recommendedDayparting.low_hours_description}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        Hours: {recommendedDayparting.low_hours.map(h => formatHour(h)).join(', ')}
                      </p>
                      <p className="text-sm text-red-700 font-semibold">
                        Budget Decrease: {recommendedDayparting.low_budget_decrease_pct}%
                      </p>
                    </div>
                  )}

                  {/* Action Description */}
                  {recommendedDayparting.action_description && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Action Summary</p>
                      <p className="text-sm text-gray-700">{recommendedDayparting.action_description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Insights */}
              {rec.insights && rec.insights.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
                  <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Key Insights</h5>
                  <ul className="space-y-2">
                    {rec.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span className="text-sm text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Reasoning */}
              {rec.reasoning && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-5 mb-6">
                  <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Detailed Reasoning</h5>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {rec.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* Projected Impact */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                <h5 className="font-bold text-[#1e4a79] mb-4 text-sm uppercase tracking-wide">Projected Impact</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenue Lift</p>
                    <p className="text-lg font-bold text-green-600">
                      +{rec.revenue_lift.value.toLocaleString()} AED
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Range: +{rec.revenue_lift.range_low.toLocaleString()} to +{rec.revenue_lift.range_high.toLocaleString()} AED
                    </p>
                  </div>
                  {rec.metrics?.cpa_change && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">CPA Change</p>
                      <p className="text-lg font-bold text-gray-800">{rec.metrics.cpa_change}</p>
                    </div>
                  )}
                  {rec.metrics?.roas_change && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ROAS Change</p>
                      <p className="text-lg font-bold text-gray-800">{rec.metrics.roas_change}</p>
                    </div>
                  )}
                  {rec.metrics?.efficiency_improvement && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Efficiency Improvement</p>
                      <p className="text-lg font-bold text-gray-800">{rec.metrics.efficiency_improvement}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Metrics Context */}
              {rec.account_metrics && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Account Context</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {rec.account_metrics.total_spend !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Spend</p>
                        <p className="font-semibold text-gray-800">{rec.account_metrics.total_spend.toLocaleString()} AED</p>
                      </div>
                    )}
                    {rec.account_metrics.account_roas !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Account ROAS</p>
                        <p className="font-semibold text-gray-800">{rec.account_metrics.account_roas.toFixed(2)}x</p>
                      </div>
                    )}
                    {rec.account_metrics.account_cpa !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Account CPA</p>
                        <p className="font-semibold text-gray-800">{rec.account_metrics.account_cpa.toLocaleString()} AED</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DaypartingOptimizationRecommendationModal

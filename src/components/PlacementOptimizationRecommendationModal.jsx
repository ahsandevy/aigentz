function PlacementOptimizationRecommendationModal({ isOpen, onClose, recommendation, rawData }) {
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
  const source = rec.scope?.source
  const destination = rec.scope?.destination

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
                <h3 id="modal-title" className="text-xl font-bold text-white">Placement Optimization Details</h3>
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

              {/* Source and Destination Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Source Metrics */}
                {source && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <h5 className="font-bold text-red-800 mb-3 text-sm uppercase tracking-wide">
                      Source: {source.type === 'platform' ? 'Platform' : 'Placement'}
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Name</p>
                        <p className="font-semibold text-gray-800">{source.name}</p>
                      </div>
                      {source.platform && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Platform</p>
                          <p className="font-semibold text-gray-800 capitalize">{source.platform}</p>
                        </div>
                      )}
                      {source.position && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Position</p>
                          <p className="font-semibold text-gray-800 capitalize">{source.position}</p>
                        </div>
                      )}
                      {source.current_spend !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current Spend</p>
                          <p className="font-semibold text-gray-800">{source.current_spend.toLocaleString()} AED</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommended Change</p>
                        <p className={`font-semibold ${source.recommended_change_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {source.recommended_change_pct > 0 ? '+' : ''}{source.recommended_change_pct}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Destination Metrics */}
                {destination && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <h5 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">
                      Destination: {destination.type === 'platform' ? 'Platform' : 'Placement'}
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Name</p>
                        <p className="font-semibold text-gray-800">{destination.name}</p>
                      </div>
                      {destination.platform && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Platform</p>
                          <p className="font-semibold text-gray-800 capitalize">{destination.platform}</p>
                        </div>
                      )}
                      {destination.position && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Position</p>
                          <p className="font-semibold text-gray-800 capitalize">{destination.position}</p>
                        </div>
                      )}
                      {destination.current_spend !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current Spend</p>
                          <p className="font-semibold text-gray-800">{destination.current_spend.toLocaleString()} AED</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommended Change</p>
                        <p className={`font-semibold ${destination.recommended_change_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {destination.recommended_change_pct > 0 ? '+' : ''}{destination.recommended_change_pct}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-[#1e4a79] mb-4 text-sm uppercase tracking-wide">Projected Impact</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                </div>
              </div>
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

export default PlacementOptimizationRecommendationModal

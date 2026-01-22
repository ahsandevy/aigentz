function BiddingStrategyOptimizationRecommendationModal({ isOpen, onClose, recommendation, rawData }) {
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
  const currentPerformance = scope?.current_performance
  const recommendedChanges = scope?.recommended_changes
  const campaign = scope?.type === 'campaign' ? scope.campaign : null
  const adset = scope?.type === 'adset' ? scope.adset : null
  const recommendationType = rec.recommendation_type // "config_adjustment" or "strategy_change"

  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      style={{ zIndex: 9999 }}
    >
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
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
                <h3 id="modal-title" className="text-xl font-bold text-white">Bidding Strategy Optimization Details</h3>
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
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {rec.priority?.toUpperCase() || 'HIGH'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {rec.confidence}% Confidence
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rec.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                  rec.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {rec.risk_level?.toUpperCase() || 'LOW'} Risk
                </span>
                {recommendationType && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    recommendationType === 'strategy_change' ? 'bg-purple-100 text-purple-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {recommendationType === 'strategy_change' ? 'Strategy Change' : 'Config Adjustment'}
                  </span>
                )}
              </div>
            </div>

            {/* Campaign/Ad Set Details */}
            {(campaign || adset) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                <h5 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                  {scope?.type === 'campaign' ? 'Campaign' : 'Ad Set'} Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Campaign</p>
                      <p className="font-semibold text-gray-800">{campaign.name || campaign.id}</p>
                    </div>
                  )}
                  {adset && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ad Set</p>
                      <p className="font-semibold text-gray-800">{adset.name || adset.id}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Performance and Recommended Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Current Performance */}
              {currentPerformance && (
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <h5 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                    Current Performance
                  </h5>
                  <div className="space-y-2">
                    {currentPerformance.cpm !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">CPM</p>
                        <p className="font-semibold text-gray-800">{currentPerformance.cpm.toFixed(2)} AED</p>
                      </div>
                    )}
                    {currentPerformance.cpc !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">CPC</p>
                        <p className="font-semibold text-gray-800">{currentPerformance.cpc.toFixed(2)} AED</p>
                      </div>
                    )}
                    {currentPerformance.budget_utilization !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Budget Utilization</p>
                        <p className={`font-semibold ${
                          currentPerformance.budget_utilization < 80 ? 'text-red-600' :
                          currentPerformance.budget_utilization < 95 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {currentPerformance.budget_utilization.toFixed(1)}%
                          {currentPerformance.budget_utilization < 80 && ' (Low)'}
                        </p>
                      </div>
                    )}
                    {currentPerformance.is_in_learning !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Learning Phase</p>
                        <p className={`font-semibold ${currentPerformance.is_in_learning ? 'text-yellow-600' : 'text-green-600'}`}>
                          {currentPerformance.is_in_learning ? 'In Learning' : 'Completed'}
                        </p>
                      </div>
                    )}
                    {currentPerformance.learning_phase_status && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Learning Status</p>
                        <p className={`font-semibold capitalize ${
                          currentPerformance.learning_phase_status === 'SUCCESS' ? 'text-green-600' :
                          currentPerformance.learning_phase_status === 'FAILED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {currentPerformance.learning_phase_status}
                        </p>
                      </div>
                    )}
                    {scope?.current_bid_strategy && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Current Bid Strategy</p>
                        <p className="font-semibold text-gray-800">{scope.current_bid_strategy.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    {scope?.current_config?.type && scope?.current_config?.value !== null && scope?.current_config?.value !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Current {scope.current_config.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="font-semibold text-gray-800">${scope.current_config.value.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Changes */}
              {recommendedChanges && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <h5 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">
                    Recommended Changes
                  </h5>
                  <div className="space-y-2">
                    {recommendationType && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommendation Type</p>
                        <p className="font-semibold text-green-600 capitalize">
                          {recommendationType === 'strategy_change' ? 'Strategy Change' : 'Config Adjustment'}
                        </p>
                      </div>
                    )}
                    {scope?.recommended_bid_strategy && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommended Bid Strategy</p>
                        <p className="font-semibold text-green-600">{scope.recommended_bid_strategy.replace(/_/g, ' ')}</p>
                        {scope?.current_bid_strategy && scope.current_bid_strategy !== scope.recommended_bid_strategy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Change from {scope.current_bid_strategy.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    )}
                    {scope?.recommended_config?.type && scope?.recommended_config?.value !== null && scope?.recommended_config?.value !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommended {scope.recommended_config.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="font-semibold text-green-600">${scope.recommended_config.value.toLocaleString()}</p>
                        {scope?.current_config?.type === scope?.recommended_config?.type && scope?.current_config?.value !== null && scope?.current_config?.value !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            Change from ${scope.current_config.value.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    {recommendedChanges.config_adjustment && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Config Adjustment</p>
                        <p className="text-sm text-gray-700">{recommendedChanges.config_adjustment}</p>
                      </div>
                    )}
                    {recommendedChanges.strategy_change && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Strategy Change</p>
                        <p className="text-sm text-gray-700">{recommendedChanges.strategy_change}</p>
                      </div>
                    )}
                    {recommendedChanges.action_description && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Action Description</p>
                        <p className="text-sm text-gray-700">{recommendedChanges.action_description}</p>
                      </div>
                    )}
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
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
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
                {rec.metrics?.cpm_improvement && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">CPM Improvement</p>
                    <p className="text-lg font-bold text-gray-800">{rec.metrics.cpm_improvement}</p>
                  </div>
                )}
                {rec.metrics?.budget_utilization_improvement && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Budget Utilization Improvement</p>
                    <p className="text-lg font-bold text-gray-800">{rec.metrics.budget_utilization_improvement}</p>
                  </div>
                )}
                {rec.metrics?.cost_efficiency_gain && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cost Efficiency Gain</p>
                    <p className="text-lg font-bold text-gray-800">{rec.metrics.cost_efficiency_gain}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Metrics Context */}
            {rec.account_metrics && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Account Context</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {rec.account_metrics.total_spend !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Spend</p>
                      <p className="font-semibold text-gray-800">{rec.account_metrics.total_spend.toLocaleString()} AED</p>
                    </div>
                  )}
                  {rec.account_metrics.account_cpm !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Account CPM</p>
                      <p className="font-semibold text-gray-800">{rec.account_metrics.account_cpm.toFixed(2)} AED</p>
                    </div>
                  )}
                  {rec.account_metrics.account_cpc !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Account CPC</p>
                      <p className="font-semibold text-gray-800">{rec.account_metrics.account_cpc.toFixed(2)} AED</p>
                    </div>
                  )}
                  {rec.account_metrics.account_roas !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Account ROAS</p>
                      <p className="font-semibold text-gray-500 text-xs">(Context only)</p>
                      <p className="font-semibold text-gray-800">{rec.account_metrics.account_roas.toFixed(2)}x</p>
                    </div>
                  )}
                  {rec.account_metrics.account_cpa !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Account CPA</p>
                      <p className="font-semibold text-gray-500 text-xs">(Context only)</p>
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

export default BiddingStrategyOptimizationRecommendationModal

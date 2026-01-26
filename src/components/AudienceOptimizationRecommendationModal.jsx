function AudienceOptimizationRecommendationModal({ isOpen, onClose, recommendation, rawData }) {
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
  const audience = rec.scope?.audience
  const currentConfig = audience?.current_configuration
  const operationalIssues = audience?.operational_issues
  const recommendedChanges = audience?.recommended_changes

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
                <h3 id="modal-title" className="text-xl font-bold text-white">Audience Optimization Details</h3>
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

              {/* Audience Details */}
              {audience && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                  <h5 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                    Audience Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {audience.name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Audience Name</p>
                        <p className="font-semibold text-gray-800">{audience.name}</p>
                      </div>
                    )}
                    {audience.subtype && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Subtype</p>
                        <p className="font-semibold text-gray-800">{audience.subtype}</p>
                      </div>
                    )}
                    {audience.id && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Audience ID</p>
                        <p className="font-semibold text-gray-800 text-xs">{audience.id}</p>
                      </div>
                    )}
                    {audience.recommended_action && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommended Action</p>
                        <p className="font-semibold text-gray-800 capitalize">{audience.recommended_action.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Configuration and Recommended Changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Current Configuration */}
                {currentConfig && (
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                    <h5 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                      Current Configuration
                    </h5>
                    <div className="space-y-2">
                      {currentConfig.lookalike_percentage !== null && currentConfig.lookalike_percentage !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Lookalike Percentage</p>
                          <p className="font-semibold text-gray-800">{currentConfig.lookalike_percentage}%</p>
                        </div>
                      )}
                      {currentConfig.retention_days !== null && currentConfig.retention_days !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Retention Days</p>
                          <p className="font-semibold text-gray-800">{currentConfig.retention_days} days</p>
                        </div>
                      )}
                      {currentConfig.lookalike_percentage === null && currentConfig.retention_days === null && (
                        <p className="text-sm text-gray-600 italic">No specific configuration</p>
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
                      {recommendedChanges.lookalike_percentage !== null && recommendedChanges.lookalike_percentage !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">New Lookalike Percentage</p>
                          <p className="font-semibold text-green-600">{recommendedChanges.lookalike_percentage}%</p>
                          {currentConfig?.lookalike_percentage !== null && currentConfig?.lookalike_percentage !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {recommendedChanges.lookalike_percentage > currentConfig.lookalike_percentage ? '↑ Increase' :
                                recommendedChanges.lookalike_percentage < currentConfig.lookalike_percentage ? '↓ Decrease' : 'No change'}
                              {' '}from {currentConfig.lookalike_percentage}%
                            </p>
                          )}
                        </div>
                      )}
                      {recommendedChanges.retention_days !== null && recommendedChanges.retention_days !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">New Retention Days</p>
                          <p className="font-semibold text-green-600">{recommendedChanges.retention_days} days</p>
                          {currentConfig?.retention_days !== null && currentConfig?.retention_days !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {recommendedChanges.retention_days > currentConfig.retention_days ? '↑ Increase' :
                                recommendedChanges.retention_days < currentConfig.retention_days ? '↓ Decrease' : 'No change'}
                              {' '}from {currentConfig.retention_days} days
                            </p>
                          )}
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

              {/* Operational Issues */}
              {operationalIssues && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
                  <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Operational Issues</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {operationalIssues.saturation_percent !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Saturation</p>
                        <p className={`font-semibold ${operationalIssues.saturation_percent > 80 ? 'text-red-600' :
                            operationalIssues.saturation_percent > 60 ? 'text-yellow-600' :
                              'text-green-600'
                          }`}>
                          {operationalIssues.saturation_percent}%
                          {operationalIssues.saturation_percent > 80 && ' (Exhausted)'}
                        </p>
                      </div>
                    )}
                    {operationalIssues.frequency !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Frequency</p>
                        <p className={`font-semibold ${operationalIssues.frequency > 3 ? 'text-red-600' :
                            operationalIssues.frequency > 2 ? 'text-yellow-600' :
                              'text-green-600'
                          }`}>
                          {operationalIssues.frequency.toFixed(1)}x
                          {operationalIssues.frequency > 3 && ' (Fatigued)'}
                        </p>
                      </div>
                    )}
                    {operationalIssues.reaction_quality && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Reaction Quality</p>
                        <p className={`font-semibold capitalize ${operationalIssues.reaction_quality === 'passive' || operationalIssues.reaction_quality === 'weak' ? 'text-red-600' :
                            operationalIssues.reaction_quality === 'moderate' ? 'text-yellow-600' :
                              'text-green-600'
                          }`}>
                          {operationalIssues.reaction_quality.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {operationalIssues.engagement_rate !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Engagement Rate</p>
                        <p className="font-semibold text-gray-800">{operationalIssues.engagement_rate}%</p>
                      </div>
                    )}
                  </div>
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

              {/* Projected Impact - Revenue Lift and Operational Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                <h5 className="font-bold text-[#1e4a79] mb-4 text-sm uppercase tracking-wide">Projected Impact</h5>
                <div className={`grid grid-cols-1 ${rec.revenue_lift || rec.metrics?.revenue_lift ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                  {/* Revenue Lift - show first if available */}
                  {(rec.revenue_lift || rec.metrics?.revenue_lift) && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Revenue Lift</p>
                      {rec.metrics?.revenue_lift ? (
                        <p className="text-lg font-bold text-green-600">{rec.metrics.revenue_lift}</p>
                      ) : rec.revenue_lift ? (
                        <>
                          <p className="text-lg font-bold text-green-600">
                            +{typeof rec.revenue_lift === 'object' ? rec.revenue_lift.value.toLocaleString() : rec.revenue_lift.toLocaleString()} AED
                          </p>
                          {typeof rec.revenue_lift === 'object' && rec.revenue_lift.range_low !== undefined && rec.revenue_lift.range_high !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Range: +{rec.revenue_lift.range_low.toLocaleString()} to +{rec.revenue_lift.range_high.toLocaleString()} AED
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                  {rec.metrics?.saturation_change && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Saturation Change</p>
                      <p className="text-lg font-bold text-green-600">{rec.metrics.saturation_change}</p>
                    </div>
                  )}
                  {rec.metrics?.frequency_change && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Frequency Change</p>
                      <p className="text-lg font-bold text-gray-800">{rec.metrics.frequency_change}</p>
                    </div>
                  )}
                  {rec.metrics?.engagement_improvement && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Engagement Improvement</p>
                      <p className="text-lg font-bold text-gray-800">{rec.metrics.engagement_improvement}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Metrics Context */}
              {rec.account_metrics && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h5 className="font-bold text-[#1e4a79] mb-3 text-sm uppercase tracking-wide">Account Context</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rec.account_metrics.total_spend !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Spend</p>
                        <p className="font-semibold text-gray-800">{rec.account_metrics.total_spend.toLocaleString()} AED</p>
                      </div>
                    )}
                    {rec.account_metrics.account_ctr !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Account CTR</p>
                        <p className="font-semibold text-gray-800">{rec.account_metrics.account_ctr}%</p>
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

export default AudienceOptimizationRecommendationModal

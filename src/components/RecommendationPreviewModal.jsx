function RecommendationPreviewModal({ isOpen, onClose, preview, recommendation }) {
  if (!isOpen || !preview) return null

  const formatCurrency = (value) => {
    if (!value) return 'N/A'
    return value.toString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#1e4a79] mb-2">Simulation Preview</h2>
          <p className="text-sm text-gray-600">Preview of changes before approval</p>
        </div>

        {/* Recommendation Summary */}
        {recommendation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">{recommendation}</p>
          </div>
        )}

        {/* Changes */}
        {preview.changes && preview.changes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Proposed Changes</h3>
            <div className="space-y-4">
              {preview.changes.map((change, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{change.entity_name}</h4>
                      <p className="text-sm text-gray-600">
                        {change.entity_type === 'campaign' ? 'Campaign' : 'Ad Set'} • ID: {change.entity_id}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      change.change_type.includes('increase') ? 'bg-green-100 text-green-800' :
                      change.change_type.includes('reduction') ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {change.change_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Before</p>
                      {Object.entries(change.before).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-700">
                          <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">After</p>
                      {Object.entries(change.after).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-700">
                          <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                  </div>

                  {(change.change_percentage || change.change_amount) && (
                    <div className="mt-3 flex gap-4 text-sm">
                      {change.change_percentage && (
                        <span className={`font-semibold ${
                          change.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.change_percentage > 0 ? '+' : ''}{change.change_percentage}%
                        </span>
                      )}
                      {change.change_amount && (
                        <span className={`font-semibold ${
                          change.change_amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.change_amount > 0 ? '+' : ''}{change.change_amount} AED
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projected Impact */}
        {preview.projected_impact && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Projected Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preview.projected_impact.revenue_lift && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Revenue Lift</div>
                  <div className="text-xl font-bold text-green-700">{formatCurrency(preview.projected_impact.revenue_lift)}</div>
                </div>
              )}
              {preview.projected_impact.cpa_change && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">CPA Change</div>
                  <div className="text-xl font-bold text-blue-700">{formatCurrency(preview.projected_impact.cpa_change)}</div>
                </div>
              )}
              {preview.projected_impact.roas_change && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">ROAS Change</div>
                  <div className="text-xl font-bold text-purple-700">{formatCurrency(preview.projected_impact.roas_change)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecommendationPreviewModal

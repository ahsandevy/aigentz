import { useState, useMemo } from 'react'
import { analyticsAPI } from '../services/api'
import { useExecutiveBrief } from '../hooks/useExecutiveBrief'

function AIExecutiveBrief({ days = 7 }) {
  const { data, isLoading, isError, error: queryError, refetch, isFetching } = useExecutiveBrief()

  const [boardSummary, setBoardSummary] = useState(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState(null)
  const [showBoardSummary, setShowBoardSummary] = useState(false)

  const { brief, error } = useMemo(() => {
    const raw = data
    if (raw?.error) {
      return {
        brief: null,
        error:
          raw.message ||
          raw.error ||
          'No data available. Please sync performance data and try again.',
      }
    }
    if (raw) {
      return { brief: raw, error: null }
    }
    return { brief: null, error: null }
  }, [data])

  const fetchError =
    error ||
    (isError
      ? queryError?.message || 'Failed to generate executive brief. Please try again.'
      : null)

  const loading = isLoading && !brief
  const showRefreshOverlay = !!brief && isFetching && !isLoading

  const handleGenerateBoardSummary = async (forceRefresh = false) => {
    try {
      setGeneratingSummary(true)
      setSummaryError(null)
      const data = await analyticsAPI.getBoardReadySummary(days, forceRefresh)
      if (data) {
        setBoardSummary(data)
        setShowBoardSummary(true)
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error generating board-ready summary:', err)
      setSummaryError('Failed to generate board-ready summary. Please try again.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  // Helper function to format currency
  const formatCurrency = (value, currency = 'AED') => {
    if (!value && value !== 0) return 'N/A'
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K ${currency}`
    }
    return `${value.toLocaleString()} ${currency}`
  }

  // Helper function to format percentage change
  const formatChangePct = (changePct) => {
    if (changePct === null || changePct === undefined) return ''
    const sign = changePct >= 0 ? '+' : ''
    return `${sign}${changePct.toFixed(1)}%`
  }

  // Helper function to get border color based on type
  const getBorderColor = (type) => {
    switch (type) {
      case 'improvement':
      case 'increase':
        return 'border-[#16a34a]'
      case 'decline':
      case 'decrease':
        return 'border-[#dc2626]'
      default:
        return 'border-[#2563eb]'
    }
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-[#1e4a79]">AI Executive Brief</h2>
        </div>
        <div className="bg-[#fafafa] rounded-lg border border-[#bfdbfe] p-8 shadow-[0px_0.871px_1.742px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">Generating executive brief... This may take 5-15 seconds.</p>
        </div>
      </section>
    )
  }

  if (fetchError) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-[#1e4a79]">AI Executive Brief</h2>
        </div>
        <div className="bg-[#fafafa] rounded-lg border border-[#bfdbfe] p-8 shadow-[0px_0.871px_1.742px_0px_rgba(0,0,0,0.05)]">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{fetchError}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-[#1e4a79] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a69] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!brief) {
    return null
  }

  return (
    <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-[#1e4a79]">AI Executive Brief</h2>
        </div>
        <div className="flex items-center gap-4">
          {brief.days_analyzed != null && (
            <span className="text-xs text-gray-500">
              Window: Last {brief.days_analyzed} {brief.days_analyzed === 1 ? 'day' : 'days'}
            </span>
          )}
          {brief.generated_at && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">
                Generated: {formatDate(brief.generated_at)}
              </span>
              {brief.saved !== undefined && (
                <span className={`text-xs ${brief.saved ? 'text-blue-600' : 'text-green-600'}`}>
                  {brief.saved ? 'From saved' : 'Newly generated'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#fafafa] rounded-lg border border-[#bfdbfe] p-8 shadow-[0px_0.871px_1.742px_0px_rgba(0,0,0,0.05)] relative">
        {showRefreshOverlay && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
              <p className="text-sm text-gray-600">Refreshing executive brief... This may take 5-15 seconds.</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* What Changed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">What Changed</h3>
            </div>
            {brief.what_changed && brief.what_changed.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#374151]">
                {brief.what_changed.map((item, index) => (
                  <li key={index} className={`flex items-start gap-2 pl-4 border-l-[1.742px] ${getBorderColor(item.type)}`}>
                    <span>
                      {item.change_pct !== null && item.change_pct !== undefined && (
                        <span className={`font-semibold ${item.type === 'improvement' || item.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatChangePct(item.change_pct)} {item.metric}:{' '}
                        </span>
                      )}
                      {item.description || `${item.metric} ${item.type} ${formatChangePct(item.change_pct)} driven by ${item.driver}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No significant changes detected</p>
            )}
          </div>

          {/* What to Fix */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">What to Fix</h3>
            </div>
            {brief.what_to_fix && brief.what_to_fix.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#374151]">
                {brief.what_to_fix.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#ea580c]">
                    <span>
                      {item.entity_name && (
                        <span className="font-semibold">{item.entity_name}: </span>
                      )}
                      {item.action || item.description}
                      {item.frequency && ` (Frequency: ${item.frequency})`}
                      {item.wasted_spend && ` - Wasting ${formatCurrency(item.wasted_spend, item.currency)}/${item.period || 'period'}`}
                      {item.audiences && item.audiences.length > 0 && ` - Overlap: ${item.audiences.join(', ')}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No issues detected</p>
            )}
          </div>

          {/* Where to Scale */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">Where to Scale</h3>
            </div>
            {brief.where_to_scale && brief.where_to_scale.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#374151]">
                {brief.where_to_scale.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#2563eb]">
                    <span>
                      <span className="font-semibold">{item.entity_name}:</span>{' '}
                      {item.metric} {item.value}
                      {item.metric === 'ROAS' && item.budget_utilization && ` at ${item.budget_utilization.toFixed(0)}% budget utilization`}
                      {item.metric === 'CPA' && item.target && ` (${((item.value / item.target - 1) * 100).toFixed(0)}% below target)`}
                      {item.recommendation && ` - ${item.recommendation}`}
                      {item.revenue_lift_estimate && ` (Est. revenue lift: ${formatCurrency(item.revenue_lift_estimate)})`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No scaling opportunities detected</p>
            )}
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e4a79]">Risks</h3>
            </div>
            {brief.risks && brief.risks.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#374151]">
                {brief.risks.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#dc2626]">
                    <span>
                      {item.type === 'spend_limit' && item.current_spend && item.limit && (
                        <span className="font-semibold">
                          {formatCurrency(item.current_spend)} / {formatCurrency(item.limit)} ({item.utilization_pct?.toFixed(0)}% utilized):{' '}
                        </span>
                      )}
                      {item.type === 'attribution_gap' && item.gap_pct && (
                        <span className="font-semibold">
                          {item.gap_pct}% attribution gap:{' '}
                        </span>
                      )}
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No risks detected</p>
            )}
          </div>
        </div>

        {/* Growth Opportunity Summary */}
        <div className="border-t border-[#bfdbfe] pt-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-semibold text-[#1e4a79]">Growth Opportunity Summary</h3>
          </div>
          {brief.growth_opportunities && brief.growth_opportunities.length > 0 ? (
            <ul className="space-y-2 text-sm text-[#374151]">
              {brief.growth_opportunities.map((item, index) => (
                <li key={index} className="flex items-start gap-2 pl-4 border-l-[1.742px] border-[#eecc20]">
                  <span>
                    {item.entity_name && (
                      <span className="font-semibold">{item.entity_name}: </span>
                    )}
                    {item.type === 'campaign_performance' && item.roas && (
                      <span className="font-semibold">ROAS {item.roas}x</span>
                    )}
                    {item.type === 'dayparting' && item.window && (
                      <span className="font-semibold">Peak window {item.window}</span>
                    )}
                    {item.description && ` - ${item.description}`}
                    {item.recommendation && (
                      <span className="block mt-1 text-gray-600">{item.recommendation}</span>
                    )}
                    {item.expected_impact && (
                      <span className="block mt-1 text-gray-500 italic">{item.expected_impact}</span>
                    )}
                    {item.opportunity_value && (
                      <span className="block mt-1 font-semibold text-green-600">
                        Opportunity value: {formatCurrency(item.opportunity_value, item.currency)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No growth opportunities detected</p>
          )}
        </div>

        <button
          onClick={() => handleGenerateBoardSummary(false)}
          disabled={generatingSummary}
          className="bg-[#fafafa] border border-[#EDF0A8] text-[#1e4a79] px-6 py-3 rounded-[30px] font-semibold shadow-[2px_2px_4px_0px_#cfcfcf] hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingSummary ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Board-Ready Summary</span>
            </>
          )}
        </button>
        {summaryError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{summaryError}</p>
            <button
              onClick={() => handleGenerateBoardSummary(false)}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Board-Ready Summary Modal */}
      {showBoardSummary && boardSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowBoardSummary(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-[#1e4a79] mb-2">Board-Ready Summary</h2>
              {boardSummary.generated_at && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Generated: {formatDate(boardSummary.generated_at)}</span>
                  {boardSummary.saved !== undefined && (
                    <span className={boardSummary.saved ? 'text-blue-600' : 'text-green-600'}>
                      {boardSummary.saved ? 'From saved' : 'Newly generated'}
                    </span>
                  )}
                  {boardSummary.days_analyzed && (
                    <span>Analyzing {boardSummary.days_analyzed} days</span>
                  )}
                </div>
              )}
            </div>

            {/* Executive Summary */}
            {boardSummary.executive_summary && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Executive Summary</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {boardSummary.executive_summary}
                </div>
              </div>
            )}

            {/* Key Highlights */}
            {boardSummary.key_highlights && boardSummary.key_highlights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Key Highlights</h3>
                <ul className="space-y-3">
                  {boardSummary.key_highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strategic Recommendations */}
            {boardSummary.strategic_recommendations && boardSummary.strategic_recommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Strategic Recommendations</h3>
                <div className="space-y-4">
                  {boardSummary.strategic_recommendations
                    .sort((a, b) => a.priority - b.priority)
                    .map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                        <div className="flex items-start gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.priority === 1 ? 'bg-red-100 text-red-800' :
                            rec.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            Priority {rec.priority}
                          </span>
                          <h4 className="text-lg font-semibold text-[#1e4a79] flex-1">{rec.title}</h4>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.description}</p>
                        {rec.expected_impact && (
                          <p className="text-sm text-green-700 font-medium mb-1">
                            Expected Impact: {rec.expected_impact}
                          </p>
                        )}
                        {rec.timeline && (
                          <p className="text-sm text-gray-600">
                            Timeline: {rec.timeline}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Financial Impact */}
            {boardSummary.financial_impact && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Financial Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {boardSummary.financial_impact.revenue_lift_estimate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Revenue Lift Estimate</div>
                      <div className="text-xl font-bold text-green-700">{boardSummary.financial_impact.revenue_lift_estimate}</div>
                    </div>
                  )}
                  {boardSummary.financial_impact.cost_savings && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Cost Savings</div>
                      <div className="text-xl font-bold text-blue-700">{boardSummary.financial_impact.cost_savings}</div>
                    </div>
                  )}
                  {boardSummary.financial_impact.roi_estimate && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">ROI Estimate</div>
                      <div className="text-xl font-bold text-purple-700">{boardSummary.financial_impact.roi_estimate}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Alerts */}
            {boardSummary.risk_alerts && boardSummary.risk_alerts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1e4a79] mb-4">Risk Alerts</h3>
                <div className="space-y-3">
                  {boardSummary.risk_alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-gray-700">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleGenerateBoardSummary(true)}
                disabled={generatingSummary}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e4a79] text-white rounded-lg hover:bg-[#1e3a69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingSummary ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Summary</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBoardSummary(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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

export default AIExecutiveBrief



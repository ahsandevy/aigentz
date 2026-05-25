/** Renders campaign `ai_recommendation` from GET /campaign/:id/ai-recommendation (multiple API shapes). */

function formatLabel(value) {
  if (value == null || value === '') return ''
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function Section({ title, children }) {
  if (!children) return null
  return (
    <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
      <div className="bg-[#f4f8fe] px-4 py-2 border-b border-[#e2e8f0]">
        <h4 className="text-xs font-bold text-[#1e4a79] uppercase tracking-wide">{title}</h4>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  )
}

function priorityVariant(priority) {
  const p = String(priority || '').toLowerCase()
  if (p === 'high' || p === '1') return 'bg-red-100 text-red-700'
  if (p === 'medium' || p === '2') return 'bg-yellow-100 text-yellow-800'
  if (p === 'low' || p === '3') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function statusVariant(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'good' || s === 'excellent') return 'bg-green-100 text-green-800'
  if (s === 'fair' || s === 'medium') return 'bg-yellow-100 text-yellow-800'
  if (s === 'poor' || s === 'bad') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

/** Detect campaign AI payload (metrics object summary OR narrative + growth_score shape). */
export function isCampaignAiRecommendationShape(rec) {
  if (!rec || typeof rec !== 'object') return false

  const es = rec.executive_summary
  if (
    es &&
    typeof es === 'object' &&
    !Array.isArray(es) &&
    (es.campaign_id != null || es.roas != null || es.name != null)
  ) {
    return true
  }

  if (rec.growth_score != null || rec.factor_scores != null) return true
  if (rec.quick_win != null || rec.strategic_bet != null || rec.revenue_opportunity != null) {
    return true
  }

  const budget = rec.budget_analysis
  if (
    budget &&
    (budget.current_daily_spend != null ||
      budget.recommended_shift ||
      budget.reallocate_from?.length ||
      budget.reallocate_to?.length ||
      budget.spend != null ||
      budget.suggested_action)
  ) {
    return true
  }

  if (typeof es === 'string' && es.length > 0) {
    return true
  }

  return false
}

function BudgetAnalysisContent({ budget }) {
  if (!budget || typeof budget !== 'object') return null

  const metricRows = [
    ['Daily Budget', budget.daily_budget],
    ['Lifetime Budget', budget.lifetime_budget],
    ['Current Daily Spend', budget.current_daily_spend],
    ['Spend', budget.spend ?? budget.current_spend],
    ['Revenue', budget.revenue],
    ['ROAS', budget.roas != null ? `${Number(budget.roas).toFixed(2)}x` : null],
    ['CPA', budget.cpa != null ? Number(budget.cpa).toFixed(2) : null],
  ].filter(([, v]) => v != null && v !== '')

  const hasRealloc =
    budget.recommended_shift ||
    (Array.isArray(budget.reallocate_from) && budget.reallocate_from.length > 0) ||
    (Array.isArray(budget.reallocate_to) && budget.reallocate_to.length > 0)

  const hasLegacy =
    budget.suggested_action || budget.verdict || budget.observation

  if (!metricRows.length && !hasRealloc && !hasLegacy) {
    return <p className="text-sm text-gray-500">No budget details in response.</p>
  }

  return (
    <div className="space-y-4">
      {metricRows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {metricRows.map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{label}</p>
              <p className="font-medium text-gray-800">
                {label === 'ROAS' || label === 'CPA'
                  ? value
                  : `${Number(value).toLocaleString()} AED`}
              </p>
            </div>
          ))}
        </div>
      )}

      {budget.recommended_shift && (
        <p className="text-sm text-[#1e4a79] font-medium leading-relaxed bg-blue-50 border border-blue-100 rounded-lg p-3">
          {budget.recommended_shift}
        </p>
      )}

      {Array.isArray(budget.reallocate_from) && budget.reallocate_from.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Reallocate from</p>
          <div className="space-y-2">
            {budget.reallocate_from.map((item, idx) => (
              <div key={idx} className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900">{item.adset_name || item.name || 'Ad set'}</p>
                {item.amount != null && (
                  <p className="text-xs text-gray-600 mt-1">Amount: {Number(item.amount).toLocaleString()} AED</p>
                )}
                {item.reason && <p className="text-xs text-gray-600 mt-1">{item.reason}</p>}
                {item.adset_id && (
                  <p className="text-[10px] text-gray-400 mt-1">ID: {item.adset_id}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(budget.reallocate_to) && budget.reallocate_to.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-green-700 uppercase mb-2">Reallocate to</p>
          <div className="space-y-2">
            {budget.reallocate_to.map((item, idx) => (
              <div key={idx} className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900">{item.adset_name || item.name || 'Ad set'}</p>
                {item.amount != null && (
                  <p className="text-xs text-gray-600 mt-1">Amount: {Number(item.amount).toLocaleString()} AED</p>
                )}
                {item.reason && <p className="text-xs text-gray-600 mt-1">{item.reason}</p>}
                {item.adset_id && (
                  <p className="text-[10px] text-gray-400 mt-1">ID: {item.adset_id}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {budget.suggested_action && (
        <p className="text-sm text-gray-800">
          <span className="font-bold">Suggested action:</span> {budget.suggested_action}
        </p>
      )}
      {budget.verdict && typeof budget.verdict === 'string' && (
        <p className="text-sm text-gray-700">
          <span className="font-bold">Verdict:</span> {budget.verdict}
        </p>
      )}
      {budget.observation && typeof budget.observation === 'string' && (
        <p className="text-xs text-gray-600">{budget.observation}</p>
      )}
    </div>
  )
}

function CampaignAiRecommendationPanel({ recommendation }) {
  if (!recommendation) return null

  const summary = recommendation.executive_summary
  const growth = recommendation.growth_score
  const audit = recommendation.structural_audit
  const factors = recommendation.factor_scores
  const budget = recommendation.budget_analysis
  const recs = recommendation.recommendations
  const quickWin = recommendation.quick_win
  const strategicBet = recommendation.strategic_bet
  const revenueOpp = recommendation.revenue_opportunity
  const watchMetrics = recommendation.watch_metrics

  const metricEntries =
    summary && typeof summary === 'object' && !Array.isArray(summary)
      ? [
          ['Campaign', summary.name],
          ['Status', summary.status],
          ['Spend', summary.total_spend != null ? `${Number(summary.total_spend).toLocaleString()} AED` : null],
          ['Revenue', summary.total_revenue != null ? `${Number(summary.total_revenue).toLocaleString()} AED` : null],
          ['Purchases', summary.total_purchases != null ? Number(summary.total_purchases).toLocaleString() : null],
          ['ROAS', summary.roas != null ? `${Number(summary.roas).toFixed(2)}x` : null],
          ['CPA', summary.cpa != null ? Number(summary.cpa).toFixed(2) : null],
          ['CTR', summary.ctr != null ? `${Number(summary.ctr).toFixed(2)}%` : null],
          ['Impressions', summary.impressions != null ? Number(summary.impressions).toLocaleString() : null],
          ['Clicks', summary.clicks != null ? Number(summary.clicks).toLocaleString() : null],
          ['Reach', summary.reach != null ? Number(summary.reach).toLocaleString() : null],
        ].filter(([, v]) => v != null && v !== '')
      : []

  return (
    <div className="space-y-4 sm:space-y-5 border-t border-[#e2e8f0] pt-4 sm:pt-5">
      <h3 className="text-sm font-bold text-[#1e4a79] uppercase tracking-wide">AI Campaign Recommendations</h3>

      {typeof summary === 'string' && summary && (
        <Section title="Executive Summary">
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </Section>
      )}

      {summary && typeof summary === 'object' && metricEntries.length > 0 && (
        <Section title="Campaign Performance Summary">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metricEntries.map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{label}</p>
                <p className="text-sm text-gray-800 font-semibold break-words">{value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {growth && (
        <Section title="Growth Score">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {growth.score != null && (
              <span className="text-2xl font-bold text-[#1e4a79]">{growth.score}</span>
            )}
            {growth.label && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusVariant(growth.label)}`}>
                {formatLabel(growth.label)}
              </span>
            )}
          </div>
          {growth.rationale && (
            <p className="text-sm text-gray-700 leading-relaxed">{growth.rationale}</p>
          )}
        </Section>
      )}

      {audit && (
        <Section title="Structural Audit">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                audit.is_aligned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {audit.is_aligned ? 'Aligned' : 'Issues Detected'}
            </span>
          </div>
          {audit.funnel_stage_fit && (
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{audit.funnel_stage_fit}</p>
          )}
          {Array.isArray(audit.strengths) && audit.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Strengths</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {audit.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(audit.issues) && audit.issues.length > 0 && (
            <ul className="space-y-1 text-sm text-gray-700">
              {audit.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{typeof issue === 'string' ? issue : JSON.stringify(issue)}</span>
                </li>
              ))}
            </ul>
          )}
          {audit.issue && typeof audit.issue === 'string' && (
            <p className="text-sm text-red-700 mt-2">{audit.issue}</p>
          )}
        </Section>
      )}

      {factors && typeof factors === 'object' && Object.keys(factors).length > 0 && (
        <Section title="Factor Scores">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(factors).map(([key, factor]) => (
              <div key={key} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-[#1e4a79] uppercase">{formatLabel(key)}</p>
                  {factor?.score != null && (
                    <span className="text-lg font-bold text-[#1e4a79]">{factor.score}</span>
                  )}
                </div>
                {factor?.status && (
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${statusVariant(factor.status)}`}>
                    {formatLabel(factor.status)}
                  </span>
                )}
                {factor?.headline && (
                  <p className="text-xs text-gray-600 leading-relaxed">{factor.headline}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {budget && (
        <Section title="Budget Analysis">
          <BudgetAnalysisContent budget={budget} />
        </Section>
      )}

      {quickWin && (
        <Section title="Quick Win">
          {quickWin.action && <p className="text-sm font-bold text-gray-900 mb-2">{quickWin.action}</p>}
          {quickWin.expected_impact && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-bold">Expected impact:</span> {quickWin.expected_impact}
            </p>
          )}
          {quickWin.effort && (
            <p className="text-xs text-gray-500">
              <span className="font-bold">Effort:</span> {formatLabel(quickWin.effort)}
            </p>
          )}
        </Section>
      )}

      {strategicBet && (
        <Section title="Strategic Bet">
          {strategicBet.action && <p className="text-sm font-bold text-gray-900 mb-2">{strategicBet.action}</p>}
          {strategicBet.hypothesis && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-bold">Hypothesis:</span> {strategicBet.hypothesis}
            </p>
          )}
          {strategicBet.success_metric && (
            <p className="text-xs text-gray-600">
              <span className="font-bold">Success metric:</span> {strategicBet.success_metric}
            </p>
          )}
        </Section>
      )}

      {revenueOpp && (
        <Section title="Revenue Opportunity">
          {revenueOpp.value != null && (
            <p className="text-2xl font-bold text-green-700 mb-2">
              +{Number(revenueOpp.value).toLocaleString()} {revenueOpp.currency || 'AED'}
            </p>
          )}
          {(revenueOpp.range_low != null || revenueOpp.range_high != null) && (
            <p className="text-sm text-gray-600 mb-2">
              Range: +{Number(revenueOpp.range_low ?? 0).toLocaleString()} to +{Number(revenueOpp.range_high ?? 0).toLocaleString()}{' '}
              {revenueOpp.currency || 'AED'}
            </p>
          )}
          {revenueOpp.assumptions && (
            <p className="text-xs text-gray-500 italic leading-relaxed">{revenueOpp.assumptions}</p>
          )}
        </Section>
      )}

      {Array.isArray(recs) && recs.length > 0 && (
        <Section title="Recommended Actions">
          <div className="space-y-3">
            {recs.map((rec, i) => (
              <div key={i} className="border border-[#e2e8f0] rounded-lg p-3 bg-[#f8faff]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1e4a79] text-white text-xs font-bold flex items-center justify-center">
                    {rec.priority != null ? rec.priority : i + 1}
                  </span>
                  {rec.factor && (
                    <span className="px-2 py-0.5 bg-[#1e4a79]/10 text-[#1e4a79] rounded text-[10px] font-bold uppercase">
                      {formatLabel(rec.factor)}
                    </span>
                  )}
                  {rec.priority != null && typeof rec.priority === 'string' && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityVariant(rec.priority)}`}>
                      {formatLabel(rec.priority)}
                    </span>
                  )}
                  {rec.risk_level && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                      {formatLabel(rec.risk_level)} risk
                    </span>
                  )}
                  {rec.confidence != null && (
                    <span className="text-[10px] text-gray-500">{rec.confidence}% confidence</span>
                  )}
                </div>
                {rec.action && <p className="text-sm font-bold text-gray-900 mb-1">{rec.action}</p>}
                {rec.target_entity && (
                  <p className="text-xs text-gray-500 mb-1">
                    {rec.target_entity.type ? `${formatLabel(rec.target_entity.type)}: ` : ''}
                    {rec.target_entity.name || rec.target_entity.id}
                  </p>
                )}
                {rec.rationale && <p className="text-xs text-gray-600 leading-relaxed">{rec.rationale}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {Array.isArray(watchMetrics) && watchMetrics.length > 0 && (
        <Section title="Watch Metrics">
          <div className="flex flex-wrap gap-2">
            {watchMetrics.map((m, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
              >
                {m}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

export default CampaignAiRecommendationPanel

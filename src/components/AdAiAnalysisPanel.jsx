/** Renders `ai_analysis` from GET /performance-explorer/ads/:id/ai-analysis */

function formatLabel(value) {
  if (value == null || value === '') return ''
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function Section({ title, children, className = '' }) {
  if (!children) return null
  return (
    <div className={`border border-[#e2e8f0] rounded-lg overflow-hidden ${className}`}>
      <div className="bg-[#f4f8fe] px-4 py-2 border-b border-[#e2e8f0]">
        <h4 className="text-xs font-bold text-[#1e4a79] uppercase tracking-wide">{title}</h4>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  )
}

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-800',
  }
  const key = variant?.toLowerCase?.() || 'default'
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${styles[key] || styles.default}`}>
      {children}
    </span>
  )
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="w-[3px] h-3.5 bg-[#1e4a79] shrink-0 mt-1.5 rounded-full" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function KeyValueGrid({ entries }) {
  const visible = entries.filter(([, v]) => v != null && v !== '')
  if (!visible.length) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {visible.map(([label, value]) => (
        <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{label}</p>
          <p className="text-gray-800 font-medium break-words">{String(value)}</p>
        </div>
      ))}
    </div>
  )
}

function AdAiAnalysisPanel({ analysis }) {
  if (!analysis || typeof analysis !== 'object') return null

  const priority = analysis.priority?.toLowerCase?.()
  const risk = analysis.risk_level?.toLowerCase?.()
  const changes = analysis.recommended_changes
  const fatigue = analysis.fatigue_diagnosis
  const relative = analysis.relative_to_adset
  const revenue = analysis.revenue_lift
  const metrics = analysis.metrics
  const scopeAd = analysis.scope?.ad

  return (
    <div className="space-y-4 sm:space-y-5 border-t border-[#e2e8f0] pt-4 sm:pt-5">
      <h3 className="text-sm font-bold text-[#1e4a79] uppercase tracking-wide">AI Recommendations</h3>

      {/* Headline + badges */}
      <div className="bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] border border-[#c8d6e8] rounded-xl p-4 space-y-3">
        {analysis.recommendation && (
          <p className="text-base sm:text-lg font-bold text-[#1e4a79] leading-snug">
            {analysis.recommendation}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {analysis.priority && <Badge variant={priority}>{formatLabel(analysis.priority)} Priority</Badge>}
          {analysis.confidence != null && (
            <Badge>{analysis.confidence}% Confidence</Badge>
          )}
          {analysis.risk_level && <Badge variant={risk}>{formatLabel(analysis.risk_level)} Risk</Badge>}
          {analysis.primary_action && (
            <Badge variant="low">{formatLabel(analysis.primary_action)}</Badge>
          )}
        </div>
      </div>

      {analysis.executive_summary && (
        <Section title="Executive Summary">
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.executive_summary}</p>
        </Section>
      )}

      {analysis.insights?.length > 0 && (
        <Section title="Insights">
          <BulletList items={analysis.insights} />
        </Section>
      )}

      {analysis.reasoning && (
        <Section title="Reasoning">
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.reasoning}</p>
        </Section>
      )}

      {changes && (
        <Section title="Recommended Changes">
          <div className="space-y-4">
            {changes.format_change && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Format</p>
                <p className="text-sm text-gray-800">{changes.format_change}</p>
              </div>
            )}
            {changes.messaging_focus && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Messaging Focus</p>
                <p className="text-sm text-gray-700 leading-relaxed">{changes.messaging_focus}</p>
              </div>
            )}
            {changes.visual_elements && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Visual Elements</p>
                <p className="text-sm text-gray-700 leading-relaxed">{changes.visual_elements}</p>
              </div>
            )}
            {changes.creative_elements?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Creative Elements</p>
                <BulletList items={changes.creative_elements} />
              </div>
            )}
          </div>
        </Section>
      )}

      {fatigue && (
        <Section title="Fatigue Diagnosis">
          <KeyValueGrid
            entries={[
              ['Fatigue Score', fatigue.fatigue_score != null ? `${fatigue.fatigue_score}%` : null],
              ['Frequency', fatigue.frequency != null ? `${fatigue.frequency}x` : null],
              ['CTR Trend', fatigue.ctr_trend ? formatLabel(fatigue.ctr_trend) : null],
              ['Action', fatigue.action ? formatLabel(fatigue.action) : null],
            ]}
          />
        </Section>
      )}

      {relative && (
        <Section title="Relative to Ad Set">
          {relative.summary && (
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{relative.summary}</p>
          )}
          {relative.underdelivery != null && (
            <Badge variant={relative.underdelivery ? 'medium' : 'success'}>
              {relative.underdelivery ? 'Underdelivery' : 'On Track'}
            </Badge>
          )}
        </Section>
      )}

      {revenue && (
        <Section title="Revenue Lift">
          <div className="space-y-3">
            {revenue.value != null && (
              <p className="text-2xl font-bold text-green-700">
                +{Number(revenue.value).toLocaleString()} AED
              </p>
            )}
            {(revenue.range_low != null || revenue.range_high != null) && (
              <p className="text-sm text-gray-600">
                Range: +{Number(revenue.range_low ?? 0).toLocaleString()} to +{Number(revenue.range_high ?? 0).toLocaleString()} AED
              </p>
            )}
            {revenue.assumptions && (
              <p className="text-xs text-gray-500 italic leading-relaxed">{revenue.assumptions}</p>
            )}
          </div>
        </Section>
      )}

      {metrics && (
        <Section title="Expected Impact Metrics">
          <KeyValueGrid
            entries={[
              ['CTR Improvement', metrics.ctr_improvement],
              ['Engagement Lift', metrics.engagement_lift],
              ['Revenue Lift', metrics.revenue_lift_display],
            ]}
          />
        </Section>
      )}

      {scopeAd && (
        <Section title="Scope">
          <KeyValueGrid
            entries={[
              ['Ad', scopeAd.name],
              ['Ad ID', scopeAd.id],
              ['Campaign', scopeAd.campaign_name],
              ['Campaign ID', scopeAd.campaign_id],
              ['Ad Set', scopeAd.adset_name],
              ['Ad Set ID', scopeAd.adset_id],
            ]}
          />
        </Section>
      )}
    </div>
  )
}

export default AdAiAnalysisPanel

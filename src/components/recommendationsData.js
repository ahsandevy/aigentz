export const RECOMMENDATION_SOURCES = [
  { key: 'budget-reallocation', name: 'Budget', label: 'Budget reallocation' },
  { key: 'creative-analysis', name: 'Creative', label: 'Creative analysis' },
  { key: 'placement-optimization', name: 'Placement', label: 'Placement optimization' },
  { key: 'audience-optimization', name: 'Audience', label: 'Audience optimization' },
  { key: 'bidding-strategy-optimization', name: 'Bidding Strategy', label: 'Bidding strategy' },
  { key: 'dayparting-optimization', name: 'Dayparting', label: 'Dayparting optimization' },
]

export const numericImpact = (value) => {
  const raw = typeof value === 'object' && value !== null ? value.value : value
  const number = Number(raw)
  return raw !== null && raw !== undefined && raw !== '' && Number.isFinite(number) ? number : null
}

const scopeNames = (scope) => {
  if (!scope || typeof scope !== 'object') return []
  const entities = [scope.source, scope.destination, scope.ad, scope.audience, scope.campaign, scope.adset]
  return [...new Set(entities.flatMap((entity) => {
    if (!entity || typeof entity !== 'object') return []
    return [entity.name, entity.campaign_name].filter(Boolean)
  }))]
}

export function normalizeRecommendation(payload, source, priorities = {}) {
  if (!payload?.success || !payload.recommendation || typeof payload.recommendation !== 'object') return null
  const raw = payload.recommendation
  const id = raw.id ?? payload.recommendation_id
  const confidence = raw.confidence == null ? null : Number(raw.confidence)
  const insights = Array.isArray(raw.insights) ? raw.insights.filter((value) => typeof value === 'string' && value.trim()) : []
  const priority = priorities[source.name] || raw.priority || 'medium'
  return {
    id: id == null ? null : String(id),
    category: source.label,
    sourceKey: source.key,
    priority: String(priority).toLowerCase(),
    status: ['approved', 'applied', 'executed'].includes(String(raw.status).toLowerCase()) ? 'applied' : 'pending',
    title: raw.recommendation || source.label,
    affected: scopeNames(raw.scope).join(' · '),
    insights,
    impact: numericImpact(raw.revenue_lift),
    impactRange: raw.revenue_lift && typeof raw.revenue_lift === 'object' ? raw.revenue_lift : null,
    confidence: confidence !== null && Number.isFinite(confidence) ? confidence : null,
    risk: raw.risk_level || null,
    metrics: raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : {},
    scope: raw.scope && typeof raw.scope === 'object' ? raw.scope : {},
    owner: raw.owner || null,
    nextCheckDays: raw.next_check_days || null,
    computedAt: raw.computed_at || raw.created_at || payload.computed_at || null,
  }
}

export function normalizeAppliedRecommendation(entry) {
  const raw = entry?.recommendation
  if (!raw || typeof raw !== 'object') return null
  const type = String(entry.recommendation_type || 'recommendation').replaceAll('_', ' ')
  const confidence = raw.confidence == null ? null : Number(raw.confidence)
  return {
    id: `applied-${entry.id}`,
    category: type.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    priority: String(raw.priority || 'medium').toLowerCase(),
    status: 'applied',
    title: raw.recommendation || 'Applied recommendation',
    affected: scopeNames(raw.scope).join(' · '),
    insights: Array.isArray(raw.insights) ? raw.insights.filter((value) => typeof value === 'string') : [],
    impact: numericImpact(raw.revenue_lift),
    impactRange: raw.revenue_lift && typeof raw.revenue_lift === 'object' ? raw.revenue_lift : null,
    confidence: confidence !== null && Number.isFinite(confidence) ? confidence : null,
    risk: raw.risk_level || null,
    metrics: raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : {},
    scope: raw.scope && typeof raw.scope === 'object' ? raw.scope : {},
    computedAt: entry.approved_at || null,
    executionStatus: entry.execution_status || null,
  }
}

export const formatAed = (value) => value === null || value === undefined
  ? '—'
  : `AED ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`

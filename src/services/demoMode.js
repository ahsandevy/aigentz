// A standalone preview is the default. Set VITE_API_BASE_URL to use the real API.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
  (!import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_DEMO_MODE !== 'false')

const USER_KEY = 'aigentz:demo:user:v1'
const approvalsKey = (email) => `aigentz:demo:approvals:v1:${email.toLowerCase()}`

export function getDemoUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function loginDemo(email) {
  const user = { id: email.toLowerCase(), email, name: email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function logoutDemo() { localStorage.removeItem(USER_KEY) }

const recommendations = [
  { id: 'budget-1', type: 'budget_reallocation', title: 'Shift budget toward the catalog feed', priority: 'high', lift: 48000, confidence: 94, risk: 'Low', insight: 'The catalog feed is above the 6.0× ROAS target and still has delivery capacity.', scope: { source: { name: 'Summer Hero retargeting' }, destination: { name: 'Omnichannel Dynamic Catalog', recommended_change_pct: 15 } }, metrics: { projected_roas: '8.2×', budget_shift: 'AED 14,200' } },
  { id: 'creative-1', type: 'creative_analysis', title: 'Refresh the Summer Hero video', priority: 'high', lift: 18500, confidence: 91, risk: 'Low', insight: 'Frequency reached 3.4× while click-through rate fell over the sample period.', scope: { ad: { name: 'Summer Hero 9:16 Video' } }, metrics: { frequency: '3.4×', ctr_change: '−22%' } },
  { id: 'placement-1', type: 'placement_optimization', title: 'Reduce low-return placements', priority: 'high', lift: 14200, confidence: 88, risk: 'Medium', insight: 'Secondary placements are below the 6.0× account ROAS benchmark.', scope: { campaign: { name: 'Brand Awareness & Reach' } }, metrics: { current_roas: '2.2×', target_roas: '6.0×' } },
  { id: 'audience-1', type: 'audience_optimization', title: 'Expand the VIP loyalty audience', priority: 'medium', lift: 26500, confidence: 87, risk: 'Low', insight: 'The loyalty cohort has strong conversion efficiency and limited saturation.', scope: { audience: { name: 'VIP Loyalty Tier 1 & 2' } }, metrics: { current_roas: '13.13×', proposed_expansion: '2% lookalike' } },
  { id: 'bidding-1', type: 'bidding_strategy_optimization', title: 'Raise high-intent search coverage', priority: 'medium', lift: 18200, confidence: 82, risk: 'Medium', insight: 'Exact-match search terms have room to capture more qualified demand.', scope: { campaign: { name: 'Search Core Intent' } }, metrics: { impression_share: '72%', target_share: '90%' } },
  { id: 'dayparting-1', type: 'dayparting_optimization', title: 'Concentrate spend in peak hours', priority: 'low', lift: 7600, confidence: 76, risk: 'Low', insight: 'Purchases are strongest during the evening shopping window.', scope: { adset: { name: 'GCC Evening Shoppers' } }, metrics: { peak_window: '6 pm–10 pm', projected_cpa: 'AED 12.80' } },
]

const toRaw = (item) => ({ id: item.id, recommendation: item.title, priority: item.priority, revenue_lift: { value: item.lift, range_low: Math.round(item.lift * .8), range_high: Math.round(item.lift * 1.2) }, confidence: item.confidence, risk_level: item.risk, insights: [item.insight], scope: item.scope, metrics: item.metrics, owner: 'Marketing team', next_check_days: 7 })

function approvedIds() {
  const email = getDemoUser()?.email || 'guest'
  try { return JSON.parse(localStorage.getItem(approvalsKey(email))) || [] } catch { return [] }
}

export function getDemoRecommendation(type) {
  const item = recommendations.find((entry) => entry.type === type)
  return item ? { success: true, recommendation: { ...toRaw(item), status: approvedIds().includes(item.id) ? 'applied' : 'pending' } } : { success: false }
}

export function getDemoPriorities() {
  const names = { budget_reallocation: 'Budget', creative_analysis: 'Creative', placement_optimization: 'Placement', audience_optimization: 'Audience', bidding_strategy_optimization: 'Bidding Strategy', dayparting_optimization: 'Dayparting' }
  return { recommendations: recommendations.map((item) => ({ card_name: names[item.type], priority: item.priority })) }
}

export function getDemoApplied() {
  return { success: true, data: approvedIds().map((id) => { const item = recommendations.find((entry) => entry.id === id); return item && { id, recommendation_type: item.type, recommendation: toRaw(item), approved_at: new Date().toISOString(), execution_status: 'simulated', reverted_at: null } }).filter(Boolean) }
}

export function simulateDemoRecommendation(id) {
  const item = recommendations.find((entry) => entry.id === id)
  if (!item) return { success: false, message: 'Recommendation not found.' }
  return { success: true, preview: { changes: [{ entity_name: Object.values(item.scope)[0]?.name || item.title, change_type: 'proposed_adjustment' }], projected_impact: { revenue_lift: `AED ${item.lift.toLocaleString()}`, confidence: `${item.confidence}%` } } }
}

export function approveDemoRecommendation(id) {
  if (!recommendations.some((item) => item.id === id)) return { success: false, message: 'Recommendation not found.' }
  const email = getDemoUser()?.email || 'guest'
  localStorage.setItem(approvalsKey(email), JSON.stringify([...new Set([...approvedIds(), id])]))
  return { success: true, message: 'Saved as approved in this browser. No live campaign was changed.' }
}

export function getDemoSpendTrend() {
  return { data: Array.from({ length: 30 }, (_, index) => ({ date: new Date(Date.UTC(2025, 8, 15 + index)).toISOString().slice(0, 10), spend: Math.round(4700 + index * 65 + Math.sin(index * 1.1) * 650) })) }
}

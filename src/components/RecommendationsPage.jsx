import { createElement, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, ArrowRight, BarChart3, Check, CheckCircle2, ChevronDown, CircleAlert, Gauge, LoaderCircle, Play, RefreshCw, Search, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import { analyticsAPI } from '../services/api'
import { useBudgetRecommendation } from '../hooks/useBudgetRecommendation'
import { useCreativeAnalysisRecommendation } from '../hooks/useCreativeAnalysisRecommendation'
import { usePlacementOptimizationRecommendation } from '../hooks/usePlacementOptimizationRecommendation'
import { useAudienceOptimizationRecommendation } from '../hooks/useAudienceOptimizationRecommendation'
import { useBiddingStrategyOptimizationRecommendation } from '../hooks/useBiddingStrategyOptimizationRecommendation'
import { useDaypartingOptimizationRecommendation } from '../hooks/useDaypartingOptimizationRecommendation'
import { useAllRecommendationsPriorities } from '../hooks/useAllRecommendationsPriorities'
import { useAppliedRecommendations } from '../hooks/useAppliedRecommendations'
import { AI_RECOMMENDATIONS_APPLIED_LIMIT } from '../hooks/aiRecommendationsQueryUtils'
import { formatAed, normalizeAppliedRecommendation, normalizeRecommendation, RECOMMENDATION_SOURCES } from './recommendationsData'
import './RecommendationsPage.css'

const PERIOD_DAYS = 30
const priorityRank = { high: 3, medium: 2, low: 1 }
const prettyDate = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

function SummaryCard({ title, value, detail, Icon }) {
  return <article className="rec-summary-card"><div className="rec-summary-top"><span>{title}</span>{createElement(Icon, { size: 19 })}</div><strong>{value}</strong><small>{detail}</small></article>
}

function ImpactChart({ items }) {
  const values = items.filter((item) => item.impact !== null && item.impact > 0).sort((a, b) => b.impact - a.impact)
  const max = Math.max(1, ...values.map((item) => item.impact))
  return <section className="rec-chart-card" aria-labelledby="rec-impact-title"><div className="rec-chart-heading"><h2 id="rec-impact-title">Projected revenue lift</h2><BarChart3 size={18} /></div>
    {values.length ? <div className="rec-impact-chart" role="img" aria-label="Projected revenue lift by recommendation">{values.map((item) => <div className="rec-impact-row" key={item.id || item.sourceKey}><span title={item.title}>{item.category.split(' ')[0]}</span><div className="rec-impact-track"><i style={{ width: `${Math.max(3, item.impact / max * 100)}%` }} /></div><strong>{formatAed(item.impact)}</strong></div>)}</div> : <p className="rec-chart-empty">No lift estimates yet.</p>}
    <p className="rec-chart-note">Estimates are shown separately.</p></section>
}

function PriorityChart({ items }) {
  const groups = ['high', 'medium', 'low'].map((name) => ({ name, count: items.filter((item) => item.priority === name).length }))
  return <section className="rec-chart-card" aria-labelledby="rec-priority-title"><div className="rec-chart-heading"><h2 id="rec-priority-title">Priority mix</h2><Gauge size={18} /></div>
    {items.length ? <><div className="rec-priority-stack" role="img" aria-label={groups.map((group) => `${group.count} ${group.name} priority`).join(', ')}>{groups.filter((group) => group.count).map((group) => <span key={group.name} className={group.name} style={{ width: `${group.count / items.length * 100}%` }} />)}</div><div className="rec-priority-legend">{groups.map((group) => <div key={group.name}><i className={group.name} /><span>{group.name}</span><strong>{group.count}</strong></div>)}</div></> : <p className="rec-chart-empty">Nothing waiting for review.</p>}
  </section>
}

function SpendChart({ trend, loading, error }) {
  const rows = Array.isArray(trend?.data) ? trend.data.filter((row) => Number.isFinite(Number(row.spend)) && row.date) : []
  const max = Math.max(1, ...rows.map((row) => Number(row.spend)))
  const points = rows.map((row, index) => `${index / Math.max(1, rows.length - 1) * 100},${92 - Number(row.spend) / max * 78}`).join(' ')
  return <section className="rec-chart-card" aria-labelledby="rec-spend-title"><div className="rec-chart-heading"><h2 id="rec-spend-title">Daily media spend</h2><Activity size={18} /></div>
    {loading ? <p className="rec-chart-empty">Loading spend…</p> : error ? <p className="rec-chart-empty">Spend history unavailable.</p> : rows.length > 1 ? <><div className="rec-spend-plot" role="img" aria-label={`Daily spend from ${prettyDate(rows[0].date)} to ${prettyDate(rows.at(-1).date)}`}><div className="rec-spend-grid" /><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={`0,100 ${points} 100,100`} fill="rgba(52,125,191,.10)" /><polyline points={points} fill="none" stroke="var(--brand-blue-mid)" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div><div className="rec-spend-axis"><span>{prettyDate(rows[0].date)}</span><span>{prettyDate(rows.at(-1).date)}</span></div></> : <p className="rec-chart-empty">No spend history for this period.</p>}
  </section>
}

function RecommendationCard({ item, selected, onSelect }) {
  return <article className={`rec-item ${selected ? 'is-selected' : ''}`}>
    <button className="rec-item-select" onClick={() => onSelect(item.id)} aria-pressed={selected}>
      <span className="rec-item-meta"><span className="rec-category">{item.category}</span><span className={`rec-priority ${item.priority}`}>{item.priority} priority</span>{item.status === 'applied' && <span className="rec-status applied">Applied</span>}</span>
      <strong className="rec-item-title">{item.title}</strong>
      <span className="rec-item-bottom"><span>Projected lift <strong>{formatAed(item.impact)}</strong></span><span>Confidence <strong>{item.confidence === null ? '—' : `${item.confidence}%`}</strong></span><ArrowRight size={16} /></span>
    </button>
  </article>
}

function Inspector({ item, busy, onSimulate, onApprove }) {
  if (!item) return <aside className="rec-inspector"><p>Select a recommendation to inspect it.</p></aside>
  const metrics = Object.entries(item.metrics).filter(([, value]) => value !== null && value !== undefined && value !== '').slice(0, 6)
  const scope = [['Source', item.scope.source], ['Destination', item.scope.destination], ['Ad', item.scope.ad], ['Audience', item.scope.audience], ['Campaign', item.scope.campaign], ['Ad set', item.scope.adset]].filter(([, value]) => value && typeof value === 'object')
  return <aside className="rec-inspector" aria-label="Recommendation inspector"><div className="rec-inspector-id"><span>{item.id ? `#${item.id}` : item.category}</span><small>{item.status === 'applied' ? 'Applied' : 'Ready for review'}</small></div><h2>{item.title}</h2><p className="rec-inspector-intro">{item.affected || item.category}</p><div className="rec-inspector-highlights"><div><span>Projected revenue lift</span><strong>{formatAed(item.impact)}</strong></div><div><span>Confidence</span><strong>{item.confidence === null ? '—' : `${item.confidence}%`}</strong></div></div>
    {item.impactRange?.range_low != null && item.impactRange?.range_high != null && <p className="rec-range">Estimated range: {formatAed(item.impactRange.range_low)}–{formatAed(item.impactRange.range_high)}</p>}
    {scope.length > 0 && <section className="rec-inspector-section"><h3>Affected</h3><div className="rec-scope-list">{scope.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value.name || value.campaign_name || value.id || 'Unnamed entity'}</strong>{value.recommended_change_pct != null && <em>{Number(value.recommended_change_pct) > 0 ? '+' : ''}{value.recommended_change_pct}% proposed</em>}</div>)}</div></section>}
    {item.insights.length > 0 && <section className="rec-inspector-section"><h3>Reason</h3><ul className="rec-insights">{item.insights.map((insight, index) => <li key={index}>{insight}</li>)}</ul></section>}
    {metrics.length > 0 && <section className="rec-inspector-section"><h3>Expected metrics</h3><div className="rec-metrics-list">{metrics.map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div></section>}
    {(item.risk || item.owner || item.nextCheckDays) && <div className="rec-safeguards"><ShieldCheck size={17} /><span>{[item.risk && `${item.risk} risk`, item.owner && `Owner: ${item.owner}`, item.nextCheckDays && `Next check: ${item.nextCheckDays} days`].filter(Boolean).join(' · ')}</span></div>}
    {item.status === 'pending' && <div className="rec-inspector-actions"><button onClick={() => onSimulate(item)} disabled={!item.id || busy}><Play size={16} />{busy === `simulate-${item.id}` ? 'Simulating…' : 'Simulate changes'}</button><button className="primary" onClick={() => onApprove(item)} disabled={!item.id || busy}><Check size={16} />Approve recommendation</button></div>}{item.status === 'applied' && <div className="rec-applied-note"><CheckCircle2 size={17} />{item.executionStatus === 'executed' ? 'Changes executed' : 'Applied recommendation'}</div>}{!item.id && item.status === 'pending' && <p className="rec-missing-id">This recommendation has no execution ID, so it cannot be simulated or approved.</p>}</aside>
}

export default function RecommendationsPage() {
  const queryClient = useQueryClient()
  const budget = useBudgetRecommendation()
  const creative = useCreativeAnalysisRecommendation()
  const placement = usePlacementOptimizationRecommendation()
  const audience = useAudienceOptimizationRecommendation()
  const bidding = useBiddingStrategyOptimizationRecommendation()
  const dayparting = useDaypartingOptimizationRecommendation()
  const prioritiesQuery = useAllRecommendationsPriorities(PERIOD_DAYS)
  const appliedQuery = useAppliedRecommendations(AI_RECOMMENDATIONS_APPLIED_LIMIT)
  const spendQuery = useQuery({ queryKey: ['daily-trend', PERIOD_DAYS], queryFn: ({ signal }) => analyticsAPI.getDailyTrend(PERIOD_DAYS, signal), staleTime: 5 * 60 * 1000 })
  const sourceQueries = [budget, creative, placement, audience, bidding, dayparting]
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [sort, setSort] = useState('Priority')
  const [busy, setBusy] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null)
  const [preview, setPreview] = useState(null)
  const [notice, setNotice] = useState(null)
  const pending = RECOMMENDATION_SOURCES.flatMap((source, index) => { const item = normalizeRecommendation(sourceQueries[index].data, source, prioritiesQuery.data); return item && item.status === 'pending' ? [item] : [] })
  const applied = (appliedQuery.data || []).map(normalizeAppliedRecommendation).filter(Boolean)
  const items = [...pending, ...applied]
  const search = query.trim().toLowerCase()
  const filtered = items.filter((item) => (tab === 'All' || item.status === tab.toLowerCase()) && (category === 'All categories' || item.category === category) && (!search || `${item.title} ${item.category} ${item.affected} ${item.insights.join(' ')}`.toLowerCase().includes(search))).sort((a, b) => sort === 'Projected lift' ? (b.impact ?? -1) - (a.impact ?? -1) : (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0))
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null
  const loading = sourceQueries.some((result) => result.isLoading) || appliedQuery.isLoading
  const failed = sourceQueries.filter((result) => result.error).length + Number(Boolean(appliedQuery.error))
  const highPriority = pending.filter((item) => item.priority === 'high').length
  const quantified = pending.filter((item) => item.impact !== null).length
  const confidenceItems = pending.filter((item) => item.confidence !== null)
  const confidenceValue = confidenceItems.length ? `${Math.round(confidenceItems.reduce((sum, item) => sum + item.confidence, 0) / confidenceItems.length)}%` : '—'
  const retry = async () => { await Promise.all([...sourceQueries, prioritiesQuery, appliedQuery, spendQuery].filter((result) => result.error).map((result) => result.refetch())) }
  const simulate = async (item) => { setBusy(`simulate-${item.id}`); setNotice(null); try { const result = await analyticsAPI.simulateRecommendation(item.id); if (!result?.success || !result.preview) throw new Error(result?.message || 'Simulation could not be created.'); setPreview({ title: item.title, data: result.preview }) } catch (error) { setNotice({ error: true, text: error.response?.data?.detail || error.message || 'Simulation failed.' }) } finally { setBusy(null) } }
  const approve = async () => { if (!confirmItem?.id) return; const id = confirmItem.id; setConfirmItem(null); setBusy(`approve-${id}`); setNotice(null); try { const result = await analyticsAPI.approveRecommendation(id); if (!result?.success) throw new Error(result?.message || 'Approval failed.'); await Promise.all([...RECOMMENDATION_SOURCES.map((source) => queryClient.invalidateQueries({ queryKey: [source.key] })), queryClient.invalidateQueries({ queryKey: ['applied-recommendations', AI_RECOMMENDATIONS_APPLIED_LIMIT] }), queryClient.invalidateQueries({ queryKey: ['all-recommendations-priorities', PERIOD_DAYS] })]); setNotice({ error: false, text: result.message || 'Recommendation approved.' }) } catch (error) { setNotice({ error: true, text: error.response?.data?.detail || error.message || 'Approval failed.' }) } finally { setBusy(null) } }
  return <div className="rec-page"><header className="rec-heading"><div><span className="rec-overline"><Sparkles size={14} /> AI insights · Last 30 days</span><h1>Recommendations</h1><p>Review opportunities and decide what to apply.</p></div><button className="rec-refresh" onClick={() => Promise.all([...sourceQueries, prioritiesQuery, appliedQuery, spendQuery].map((result) => result.refetch()))} disabled={busy}><RefreshCw size={16} /> Refresh</button></header>
    <div className="rec-summary-grid" aria-label="Recommendation summary"><SummaryCard title="Ready to review" value={pending.length} detail={`${highPriority} high priority`} Icon={Sparkles} /><SummaryCard title="Quantified opportunities" value={quantified} detail="With numeric lift estimates" Icon={BarChart3} /><SummaryCard title="Applied actions" value={applied.length} detail="Latest 50 records" Icon={CheckCircle2} /><SummaryCard title="Average confidence" value={confidenceValue} detail="Across available estimates" Icon={Target} /></div>
    <div className="rec-charts"><ImpactChart items={pending} /><PriorityChart items={pending} /><SpendChart trend={spendQuery.data} loading={spendQuery.isLoading} error={spendQuery.error} /></div>
    {failed > 0 && <div className="rec-notice error" role="alert"><CircleAlert size={18} /><span>{failed} recommendation source{failed === 1 ? '' : 's'} could not be loaded. Available results are still shown.</span><button onClick={retry}>Retry</button></div>}{notice && <div className={`rec-notice ${notice.error ? 'error' : ''}`} role="status"><span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={16} /></button></div>}
    <section className="rec-controls" aria-label="Recommendation filters"><div className="rec-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recommendations" aria-label="Search recommendations" /></div><label>Category <select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{[...new Set(items.map((item) => item.category))].map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} /></label><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Priority</option><option>Projected lift</option></select><ChevronDown size={14} /></label><div className="rec-tabs" role="tablist" aria-label="Recommendation status">{['All', 'Pending', 'Applied'].map((value) => <button role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} key={value} onClick={() => setTab(value)}>{value} <span>{value === 'All' ? items.length : value === 'Pending' ? pending.length : applied.length}</span></button>)}</div></section>
    {loading && !items.length ? <div className="rec-empty"><LoaderCircle className="rec-spinner" size={26} /><h2>Loading recommendations</h2></div> : <div className="rec-workspace"><div className="rec-list">{filtered.length ? filtered.map((item) => <RecommendationCard key={item.id || item.sourceKey} item={item} selected={selected === item} onSelect={setSelectedId} />) : <div className="rec-empty"><CircleAlert size={26} /><h2>{items.length ? 'No recommendations match these filters' : failed ? 'Recommendations are unavailable' : 'No recommendations available yet'}</h2><p>{items.length ? 'Try a different status, category, or search term.' : 'Recommendations will appear after the scheduled analysis produces results.'}</p></div>}</div><Inspector item={selected} busy={busy} onSimulate={simulate} onApprove={setConfirmItem} /></div>}
    {confirmItem && <div className="rec-modal-backdrop" onClick={() => setConfirmItem(null)}><div className="rec-modal" role="dialog" aria-modal="true" aria-labelledby="rec-confirm-title" onClick={(event) => event.stopPropagation()}><button className="rec-modal-close" onClick={() => setConfirmItem(null)} aria-label="Close"><X size={18} /></button><div className="rec-modal-icon"><Check size={21} /></div><h2 id="rec-confirm-title">Approve this recommendation?</h2><p>Changes will be applied immediately to your connected Meta account. Review the recommendation details before continuing.</p><strong>{confirmItem.title}</strong><div className="rec-modal-actions"><button onClick={() => setConfirmItem(null)}>Cancel</button><button onClick={approve}>Approve and apply</button></div></div></div>}
    {preview && <div className="rec-modal-backdrop" onClick={() => setPreview(null)}><div className="rec-modal rec-preview-modal" role="dialog" aria-modal="true" aria-labelledby="rec-preview-title" onClick={(event) => event.stopPropagation()}><button className="rec-modal-close" onClick={() => setPreview(null)} aria-label="Close"><X size={18} /></button><div className="rec-modal-icon"><Play size={21} /></div><h2 id="rec-preview-title">Simulation preview</h2><p>{preview.title}</p>{preview.data.changes?.length > 0 && <section><h3>Proposed changes</h3>{preview.data.changes.map((change, index) => <div className="rec-preview-change" key={index}><strong>{change.entity_name || change.entity_type || 'Change'}</strong><span>{change.change_type?.replaceAll('_', ' ')}</span><small>{change.change_percentage != null ? `${change.change_percentage}%` : ''} {change.change_amount != null ? formatAed(change.change_amount) : ''}</small></div>)}</section>}{preview.data.projected_impact && <section><h3>Projected impact</h3><div className="rec-metrics-list">{Object.entries(preview.data.projected_impact).map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div></section>}<div className="rec-modal-actions"><button onClick={() => setPreview(null)}>Close</button></div></div></div>}
  </div>
}

import { createElement, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, ArrowUp, BarChart3, Check, CreditCard, MousePointerClick, Palette, ShoppingCart, Sparkles, Target, TrendingUp, Users, WandSparkles, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './HomeDashboard.css'

const metrics = [
  { label: 'Total spend', value: 'AED 163,431', change: '↑ 12%', detail: 'vs. prev 30d', Icon: CreditCard },
  { label: 'Attributed revenue', value: 'AED 1,206,822', change: '↑ 24%', detail: 'vs. prev 30d', Icon: BarChart3 },
  { label: 'Blended ROAS', value: '7.38x', suffix: 'tgt 6.0x', change: '↑ 23%', detail: 'benchmark', Icon: Target },
  { label: 'Avg CPA', value: 'AED 6', suffix: '/ lead', change: '↓ 22%', detail: 'cost reduced', Icon: Users },
  { label: 'Click-through', value: '2.8%', change: '↑ 6%', detail: 'vs. prev 30d', Icon: MousePointerClick },
  { label: 'Purchases', value: '12,432', change: '↑ 28%', detail: 'vs. prev 30d', Icon: ShoppingCart },
]
const actions = [
  { title: 'Refresh 30-day audience creatives', detail: 'CTR is down in this key segment', evidence: 'CTR down 22%', context: 'vs. previous 30 days', impact: '+12% CTR', confidence: 'High (94%)', kind: 'risk', action: 'Review creatives' },
  { title: 'Reduce spend on low-ROAS networks', detail: 'TikTok and Display are below target threshold', evidence: 'ROAS 2.2x', context: 'vs. 6.0x account target', impact: '+15% ROAS', confidence: 'Medium (78%)', kind: 'warning', action: 'Adjust budget' },
  { title: 'Increase budget on high-performing campaigns', detail: 'Summer Collection is outperforming baseline by 47%', evidence: 'ROAS 9.2x', context: '+47% vs. account avg', impact: '+18% revenue', confidence: 'High (96%)', kind: 'growth', action: 'Increase budget' },
]
const campaigns = [
  { name: 'Summer Collection', objective: 'Sales', spend: 'AED 42,318', revenue: 'AED 312,540', roas: '7.4x', ctr: '6.5%', status: 'Active' },
  { name: 'Brand Awareness', objective: 'Awareness', spend: 'AED 28,540', revenue: 'AED 118,210', roas: '4.2x', ctr: '4.1%', status: 'Active' },
  { name: 'Search – Brand', objective: 'Sales', spend: 'AED 22,731', revenue: 'AED 96,441', roas: '5.4x', ctr: '5.7%', status: 'Active' },
  { name: 'Product Launch', objective: 'Traffic', spend: 'AED 18,662', revenue: 'AED 68,120', roas: '3.7x', ctr: '3.2%', status: 'Paused' },
]
const recentActivity = [
  { title: 'Campaign updated', detail: 'Summer Collection budget +20%', time: '2m ago', Icon: TrendingUp },
  { title: 'Creative approved', detail: 'Lifestyle UGC Style is live', time: '4h ago', Icon: Palette },
  { title: 'Audience synced', detail: 'High-intent lookalike (UAE & KSA)', time: 'Yesterday', Icon: Users },
  { title: 'Report generated', detail: 'Weekly audit dispatched', time: '3h ago', Icon: BarChart3 },
  { title: 'Budget pacing checked', detail: 'Top campaigns reviewed', time: '2d ago', Icon: CreditCard },
  { title: 'Creative review requested', detail: 'Audience variants queued', time: '3d ago', Icon: Palette },
]

function MetricCard({ label, value, suffix, change, detail, Icon }) {
  return <article className="home-metric"><div className="home-metric-head"><span>{label}</span>{createElement(Icon, { size: 17 })}</div><div className="home-metric-value">{value}{suffix && <small>{suffix}</small>}</div><div className="home-metric-foot"><strong>{change}</strong><span>{detail}</span></div></article>
}

function PerformanceChart() {
  const revenue = [18, 19, 22, 28, 32, 33, 32, 32, 34, 36, 37, 38, 40, 43, 49, 53, 54, 52]
  const spend = [6, 7, 8, 9, 11, 14, 16, 17, 16, 14, 14, 15, 17, 19, 20, 22, 24, 23]
  const points = (values) => values.map((value, index) => `${index / (values.length - 1) * 100},${100 - value / 60 * 100}`).join(' ')
  return <div className="home-chart" role="img" aria-label="Revenue rises from 18 thousand to 52 thousand AED, while spend rises from 6 thousand to 23 thousand AED over the sample period">
    <div className="home-chart-axis">{['60K', '45K', '30K', '15K', '0'].map((tick) => <span key={tick}>{tick}</span>)}</div>
    <div className="home-chart-plot"><div className="home-chart-grid" /><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={`0,100 ${points(revenue)} 100,100`} fill="rgba(52,125,191,.16)" /><polyline points={points(revenue)} fill="none" stroke="var(--brand-blue)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /><polyline points={points(spend)} fill="none" stroke="var(--brand-blue-light)" strokeWidth="1.3" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" /></svg><span className="home-chart-callout">Oct 12 · Peak Day<br />AED 52,140 rev / AED 7,200 spend</span></div>
    <div className="home-chart-dates"><span>Sep 15</span><span>Sep 21</span><span>Sep 27</span><span>Oct 03</span><span>Oct 09</span><span>Oct 14</span></div>
  </div>
}

export default function HomeDashboard() {
  const { user } = useAuth()
  const firstName = (user?.name || user?.full_name || 'Zeeshan').split(/\s+/)[0]
  const [channelMetric, setChannelMetric] = useState('Revenue')
  const [showSimulator, setShowSimulator] = useState(false)
  const [showAudience, setShowAudience] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const shares = channelMetric === 'Revenue' ? [42, 26, 15, 9, 8] : [48, 25, 12, 10, 5]
  const colors = ['#1b63b0', '#347dbf', '#66a3db', '#9cc5e9', '#d5e6f6']
  let offset = 0
  const slices = shares.map((share, index) => { const slice = `${colors[index]} ${offset}% ${offset + share}%`; offset += share; return slice }).join(', ')

  return <div className="asc-home">
    <div className="home-greeting"><div><div><h1>Good morning, {firstName}</h1><span className="home-demo-badge">Demo Data Mode</span></div><p>Here’s what’s happening with your cross-channel marketing performance today.</p></div><span className="home-feed-badge">View Mode: <strong>Sample Feed</strong></span></div>

    <section className="home-hero"><div><div className="home-hero-tags"><span><Sparkles size={13} />AIGENTX Marketing Assistant</span><span><span className="home-hero-dot" />Autonomous Optimization Active</span><small>Updated 4m ago · Model NeuroBayes v3.2</small></div><h2>Revenue pacing +24% ahead of target. 3 high-impact rebalancing actions ready for review.</h2><p>Meta summer scaling detected unconstrained headroom; paused TikTok budget can be shifted toward stronger high-intent cohorts.</p></div><div className="home-hero-actions"><button className="home-simulator-button" onClick={() => setShowSimulator(true)}>Impact Simulator</button><Link to="/dashboard/recommendations">Review &amp; Apply Actions <ArrowRight size={16} /></Link></div></section>

    <section className="home-metrics" aria-label="Key performance metrics">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

    <div className="home-chart-row" id="analytics"><section className="home-panel home-performance"><div className="home-panel-head"><div><h2>Performance Overview</h2><p>Attributed revenue trajectories paired against media expenditure</p></div><div className="home-chart-legend"><span><i />Revenue (AED)</span><span><i />Spend (AED)</span></div></div><PerformanceChart /></section><section className="home-panel home-channel"><div className="home-panel-head"><h2>{channelMetric} by channel</h2><select value={channelMetric} onChange={(event) => setChannelMetric(event.target.value)} aria-label="Channel metric"><option>Revenue</option><option>Spend</option></select></div><div className="home-donut" style={{ background: `conic-gradient(${slices})` }}><div><small>DOMINANT</small><strong>Meta {shares[0] + shares[1]}%</strong></div></div><div className="home-channel-list">{['Facebook', 'Instagram', 'Google Ads', 'TikTok', 'Other'].map((name, index) => <div key={name}><span><i style={{ background: colors[index] }} />{name}</span><strong>{shares[index]}%</strong></div>)}</div></section></div>

    <section className="home-panel home-priority" id="priority-actions"><div className="home-section-head"><div className="home-heading-icon"><Sparkles size={18} /></div><div><h2>Priority Actions <span>{actions.length} pending</span></h2><p>High-confidence optimization triggers generated by Bayesian predictive models</p></div><Link to="/dashboard/recommendations">View all recommendations <ArrowRight size={15} /></Link></div><div className="home-table-scroll"><table className="home-priority-table"><thead><tr><th>Finding</th><th>Evidence</th><th>Expected impact</th><th>Confidence</th><th>Action</th></tr></thead><tbody>{actions.map((action) => <tr key={action.title}><td><div className="home-finding"><span className={action.kind}>{action.kind === 'growth' ? <TrendingUp size={16} /> : <Activity size={16} />}</span><div><strong>{action.title}</strong><small>{action.detail}</small></div></div></td><td><strong>{action.evidence}</strong><small>{action.context}</small></td><td><span className="home-impact">{action.impact}</span></td><td><strong>{action.confidence}</strong><small>Sample projection</small></td><td><Link to="/dashboard/recommendations">{action.action}</Link></td></tr>)}</tbody></table></div></section>

    <div className="home-insights-row"><section className="home-panel home-audience" id="audience"><div className="home-card-title"><h2><Users size={18} />Audience Overview</h2><span>Reach</span></div><div className="home-audience-total"><strong>1.2M</strong><small>Total Qualified Reach</small><em><ArrowUp size={13} />24% vs. previous 30 days</em></div><h3>Top demographics</h3><div className="home-demographics">{[['18–24', 34], ['25–34', 28], ['35–44', 20], ['45–54', 12]].map(([age, share]) => <div key={age}><span>{age}</span><i><b style={{ width: `${share / 34 * 100}%` }} /></i><strong>{share}%</strong></div>)}</div><div className="home-card-foot"><span>Female 22–31 (UAE / KSA)</span><button onClick={() => setShowAudience(true)}>Insights <ArrowRight size={14} /></button></div></section>
      <section className="home-panel home-activity" id="activity"><div className="home-card-title"><div><h2><Activity size={18} />Recent Activity</h2><p>Latest automation &amp; optimization events</p></div><button onClick={() => setShowAllActivity((value) => !value)}>{showAllActivity ? 'Show less' : 'View all'} <ArrowRight size={14} /></button></div><div className="home-activity-list">{(showAllActivity ? recentActivity : recentActivity.slice(0, 4)).map(({ title, detail, time, Icon }) => <div key={title}><span>{createElement(Icon, { size: 15 })}</span><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div>)}</div><div className="home-card-foot"><span>Auto-synced via Meta &amp; Google</span><em>● Active</em></div></section>
      <section className="home-panel home-weekly"><div className="home-card-title"><div><h2><WandSparkles size={18} />Weekly AI Summary</h2><p>Sep 15 – Oct 14, 2025</p></div><span>Active</span></div><ul><li><Check size={14} /><span>Revenue increased by <strong>24%</strong> compared to the previous 30 days.</span></li><li><Check size={14} /><span>ROAS is up <strong>23%</strong> and now at <strong>7.38x</strong>.</span></li><li><Check size={14} /><span>Facebook &amp; Meta scaling drove <strong>68%</strong> of attributed revenue.</span></li><li><Check size={14} /><span>Consider refreshing 30-day audience creatives and reducing spend on low-ROAS networks.</span></li></ul><div className="home-card-foot"><span>AI Model NeuroBayes</span><Link to="/dashboard/executive-brief">View full report <ArrowRight size={14} /></Link></div></section></div>

    <section className="home-panel home-executive"><div className="home-section-head"><div className="home-heading-icon"><Sparkles size={19} /></div><div><h2>AI Executive Brief <span>99.4% Conf. · Copilot v3.2</span></h2><p>Oct 01 – Oct 14, 2025 · Generated today, 08:30 AM</p></div><Link to="/dashboard/executive-brief" className="home-primary-link">View full brief <ArrowRight size={15} /></Link></div><div className="home-synthesis"><span><TrendingUp size={15} />Core Synthesis</span><strong>Revenue pacing +24% ahead of plan, driven by Meta scaling; TikTok frequency drag requires immediate creative rotation.</strong></div><div className="home-brief-grid"><article><div><span>↗ What Changed</span><b>+AED 32.8k lift</b></div><h3>Meta CBO Contribution Margin Expanded</h3><p>Advantage+ campaign structure captured incremental volume with 8.8x ROAS headroom across retargeting and lookalike audiences.</p><footer><span>ROAS Ceiling: 9.4x</span><strong>Headroom: Active</strong></footer></article><article className="risk"><div><span>△ Urgent Risk</span><b>-22% CTR drag</b></div><h3>Lifestyle UGC Creative Fatigue</h3><p>Ad fatigue detected as ad frequency surpassed 4.8x on TikTok and Reels placements. Prompt creative rotation is recommended.</p><footer><span>Frequency: 4.8x</span><strong>Action: Rotate</strong></footer></article><article><div><span>↗ Where to Scale</span><b>+18% Exp. ROAS</b></div><h3>High-Intent Female 25–34 Segment</h3><p>Shift unused budget from paused channels into the highest-converting demographic cohort across GCC territory.</p><footer><span>Audience Size: 336k</span><strong>Alloc: +AED 10k</strong></footer></article></div></section>

    <section className="home-panel home-campaigns" id="campaigns"><div className="home-section-head"><BarChart3 size={18} /><h2>Campaign Performance</h2><Link to="/dashboard/explorer">View all <ArrowRight size={14} /></Link></div><div className="home-table-scroll"><table><thead><tr><th>Campaign</th><th>Objective</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>CTR</th><th>Status</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.name}><th scope="row">{campaign.name}</th><td>{campaign.objective}</td><td>{campaign.spend}</td><td>{campaign.revenue}</td><td className="home-roas">{campaign.roas}</td><td>{campaign.ctr}</td><td><span className={`home-status ${campaign.status.toLowerCase()}`}>● {campaign.status}</span></td></tr>)}</tbody></table></div><div className="home-campaign-footer"><span>Showing {campaigns.length} sample campaigns</span><strong>Combined ROAS 6.94x</strong></div></section>

    {showSimulator && <div className="home-modal-backdrop" onClick={() => setShowSimulator(false)}><div className="home-modal" role="dialog" aria-modal="true" aria-labelledby="simulator-title" onClick={(event) => event.stopPropagation()}><button onClick={() => setShowSimulator(false)} aria-label="Close simulator"><X size={19} /></button><h2 id="simulator-title">Impact Simulator</h2><p>Sample projection: shifting paused budget toward the high-intent cohort could increase revenue. Review the recommendations before applying any changes.</p><Link to="/dashboard/recommendations">Review actions <ArrowRight size={15} /></Link></div></div>}
    {showAudience && <div className="home-modal-backdrop" onClick={() => setShowAudience(false)}><div className="home-modal" role="dialog" aria-modal="true" aria-labelledby="audience-title" onClick={(event) => event.stopPropagation()}><button onClick={() => setShowAudience(false)} aria-label="Close audience insights"><X size={19} /></button><h2 id="audience-title">Audience insights</h2><p>Female 22–31 audiences in the UAE and KSA are the strongest converting segment in this sample workspace.</p></div></div>}
  </div>
}

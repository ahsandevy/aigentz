import { createElement, useState } from 'react'
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, MousePointerClick, Repeat2, Search, ShoppingBag, TrendingUp } from 'lucide-react'
import './ExplorerPage.css'

// Figures shown in the supplied Stitch design. This screen is a sample preview.
const campaigns = [
  { name: 'Summer Collection 2025', objective: 'Sales', stage: 'Conversion', spend: 42318, revenue: 314120, purchases: 3240, roas: 7.42, cpa: 13.06, ctr: 4.82, assessment: 'High Efficiency' },
  { name: 'Brand Awareness & Reach – Q4', objective: 'Awareness', stage: 'Prospecting', spend: 28540, revenue: 119868, purchases: 890, roas: 4.20, cpa: 32.06, ctr: 2.15, assessment: 'Pacing Fast' },
  { name: 'Search Core Intent – Exact Match', objective: 'Sales', stage: 'Conversion', spend: 22731, revenue: 122747, purchases: 1410, roas: 5.40, cpa: 16.12, ctr: 5.92, assessment: 'Optimal ROAS' },
  { name: 'Omnichannel Dynamic Catalog Feed', objective: 'Sales', stage: 'Conversion', spend: 54190, revenue: 444358, purchases: 4890, roas: 8.20, cpa: 11.08, ctr: 3.44, assessment: 'Outperforming' },
  { name: 'VIP Loyalty Re-engagement', objective: 'Retention', stage: 'Unknown', spend: 15652, revenue: 205600, purchases: 2020, roas: 13.13, cpa: 7.74, ctr: 6.80, assessment: 'Maximum Margin' },
]

const frequency = [
  ['Summer Hero 9:16 Video', 3.4, 'high'], ['Catalog Dynamic Carousel', 2.8],
  ['Brand Lifestyle Cut', 2.3, 'optimal'], ['Core Intent Search Ad', 1.9], ['VIP Exclusive Teaser', 1.6],
]
const clicks = [
  ['Engaged IG Followers', '18,420'], ['Catalog Viewers Drop-off', '14,100'],
  ['High-Intent Search', '9,850'], ['LAL 1-2% UAE Cart', '6,240'], ['Lifestyle Video Retarget', '4,110'],
]
const ctr = [
  ['VIP Exclusive Teaser', 6.80], ['Core Intent Search Ad', 5.92],
  ['Summer Hero 9:16 Video', 4.82], ['Catalog Dynamic Carousel', 3.44], ['Brand Lifestyle Cut', 2.15],
]
const purchases = [
  ['Omnichannel Dynamic Feed', 4890], ['Summer Collection 2025', 3240],
  ['VIP Loyalty Re-engagement', 2020], ['Search Core Intent', 1410], ['Brand Awareness & Reach', 890],
]
const integer = new Intl.NumberFormat('en-US')

function VisualCard({ category, title, Icon, badge, children, footer }) {
  return <article className="explorer-visual-card">
    <div className="explorer-card-head"><div><div className="explorer-card-category">{createElement(Icon, { size: 14 })}{category}</div><h3>{title}</h3></div>{badge && <span className="explorer-card-badge">{badge}</span>}</div>
    <div className="explorer-card-content">{children}</div>
    <div className="explorer-card-footer">{footer}</div>
  </article>
}

export default function ExplorerPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState([])
  const rows = campaigns.filter((campaign) => campaign.name.toLowerCase().includes(search.toLowerCase()) && (status === 'all' || (status === 'above' ? campaign.roas >= 6 : campaign.roas < 6)))
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.name))

  const toggleRow = (name) => setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  const toggleAll = () => setSelected((current) => allSelected ? current.filter((name) => !rows.some((row) => row.name === name)) : [...new Set([...current, ...rows.map((row) => row.name)])])
  const exportCsv = () => {
    const fields = ['name', 'objective', 'stage', 'spend', 'revenue', 'purchases', 'roas', 'cpa', 'ctr', 'assessment']
    const csv = [fields.join(','), ...rows.map((row) => fields.map((field) => `"${String(row[field]).replaceAll('"', '""')}"`).join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'aigentz-campaigns.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="asc-explorer">
    <div className="explorer-page-heading"><div><div className="explorer-title-line"><h1>Performance Explorer</h1><span>Entity diagnostics</span></div><p>Multivariate breakdown, attribution linkages, and relational vector diagnostics.</p></div><div className="explorer-page-controls"><span className="explorer-account-pill">✣ <strong>Meridian Global Brand</strong> (All Regions)</span><span className="explorer-date-pills"><strong>30D sample</strong></span><span className="explorer-sync"><i />Sample data</span></div></div>

    <section className="explorer-visual-section" aria-labelledby="explorer-visual-title">
      <div className="explorer-visual-heading"><span className="explorer-visual-icon"><BarChart3 size={18} /></span><div><div className="explorer-visual-title"><h2 id="explorer-visual-title">Performance Visuals</h2><span>Executive Breakdown</span></div><p>Clean multi-stage metrics across audience exposure, interaction propensity, and commercial return.</p></div><span className="explorer-benchmark"><i />Benchmark: Target 6.0x ROAS</span></div>
      <div className="explorer-visual-grid">
        <VisualCard category="Visibility" title="Campaign Reach" Icon={Eye} badge="Audience Cap" footer={<><span>Total Reach: <strong>1.94M</strong></span><em>↑ 12.4% vs last period</em></>}>
          <div className="explorer-reach-chart" role="img" aria-label="Campaign reach: Catalog 620 thousand, Summer 482 thousand, Brand 410 thousand, Search 245 thousand, Loyalty 180 thousand">
            {[['Catalog', 620], ['Summer', 482], ['Brand', 410], ['Search', 245], ['Loyalty', 180]].map(([label, value], index) => <div className="explorer-reach-bar" key={label}><strong>{value}k</strong><i className={index > 2 ? 'muted' : ''} style={{ height: `${value / 620 * 150}px` }} /><span>{label}</span></div>)}
          </div>
        </VisualCard>

        <VisualCard category="Visibility" title="Ad Frequency Exposure" Icon={Repeat2} badge="Ideal: 1.8x – 2.5x" footer={<><span>Average Cadence: <strong>2.4x</strong></span><em>Healthy Saturation</em></>}>
          <div className="explorer-bar-list">{frequency.map(([label, value, state]) => <div key={label}><div className="explorer-bar-label"><span>{label}</span><strong className={state || ''}>{value.toFixed(1)}x{state === 'high' ? ' • High' : state === 'optimal' ? ' • Optimal' : ''}</strong></div><div className="explorer-bar-track"><i className={state === 'high' ? 'warning' : ''} style={{ width: `${value / 3.9 * 100}%` }} /></div></div>)}</div>
        </VisualCard>

        <VisualCard category="Interest" title="Link Clicks by Ad Set" Icon={MousePointerClick} badge="Top 5 Ranked" footer={<><span>Total Click Volume: <strong>52,720</strong></span><em>Cost/Click: AED 0.94</em></>}>
          <div className="explorer-ranked-list">{clicks.map(([label, value], index) => <div key={label}><span className="explorer-rank">{index + 1}</span><span>{label}</span><strong>{value}</strong></div>)}</div>
        </VisualCard>

        <VisualCard category="Interest" title="Ad Click-Through Rate" Icon={MousePointerClick} badge="Avg: 3.8%" footer={<><span>Highest Velocity: <strong>Teaser (6.8%)</strong></span><em>Above Industry Top 10%</em></>}>
          <div className="explorer-bar-list explorer-ctr-list">{ctr.map(([label, value], index) => <div key={label}><div className="explorer-bar-label"><span>{label}</span><strong>{value.toFixed(2)}%</strong></div><div className="explorer-bar-track"><i className={index > 2 ? 'muted' : ''} style={{ width: `${value / 6.8 * 100}%` }} /></div></div>)}</div>
        </VisualCard>

        <VisualCard category="Results" title="Purchases by Campaign" Icon={ShoppingBag} badge="Volume Share" footer={<><span>Total Purchases: <strong>12,450</strong></span><em>CPA Avg: AED 14.88</em></>}>
          <div className="explorer-bar-list explorer-purchases-list">{purchases.map(([label, value], index) => <div key={label}><div className="explorer-bar-label"><span>{label}</span><strong>{integer.format(value)} <small>({Math.round(value / 12450 * 100)}%)</small></strong></div><div className="explorer-bar-track"><i className={index > 2 ? 'muted' : ''} style={{ width: `${value / 4890 * 100}%` }} /></div></div>)}</div>
        </VisualCard>

        <VisualCard category="Results" title="Return on Ad Spend" Icon={TrendingUp} badge="Target: 6.0x" footer={<><span>Portfolio Blended ROAS: <strong>7.65x</strong></span><em>+27.5% vs KPI</em></>}>
          <div className="explorer-roas-list">{[['VIP Loyalty', 'Retention Campaign', 13.13, 'Max Margin'], ['Omnichannel Dynamic', 'Scale Driver', 8.20, 'Outperforming'], ['Summer Collection', 'Seasonal Core', 7.42, 'Target Met'], ['Search Core Intent', 'Intent Harvest', 5.40, 'Pacing'], ['Brand Awareness', 'Upper Funnel', 4.20, 'Discovery']].map(([label, note, value, badge]) => <div key={label}><div><strong>{label}</strong><small>{note}</small></div><b>{value.toFixed(2)}x</b><span>{badge}</span></div>)}</div>
        </VisualCard>
      </div>
    </section>

    <section className="explorer-table-section" id="campaigns" aria-label="Campaigns table">
      <div className="explorer-table-toolbar"><div className="explorer-tabs" aria-label="Entity types"><span className="active">Campaigns <b>{campaigns.length}</b></span></div><div className="explorer-table-actions"><label className="explorer-search"><Search size={15} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns..." aria-label="Search campaigns" /></label><label className="explorer-status">Status: <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter campaigns by target"><option value="all">All</option><option value="above">Above target</option><option value="below">Below target</option></select><ChevronDown size={13} /></label><button className="explorer-export" onClick={exportCsv}><Download size={14} />Export CSV</button></div></div>
      <div className="explorer-table-scroll"><table className="explorer-table"><thead><tr><th scope="col"><input type="checkbox" aria-label="Select all visible campaigns" checked={allSelected} onChange={toggleAll} /></th><th scope="col">Campaign name</th><th scope="col">Objective</th><th scope="col">Funnel stage</th><th scope="col">Spend (AED)</th><th scope="col">Revenue (AED)</th><th scope="col">Purchases</th><th scope="col">ROAS</th><th scope="col">CPA</th><th scope="col">CTR</th><th scope="col">Assessment</th></tr></thead><tbody>{rows.map((campaign) => <tr key={campaign.name}><td><input type="checkbox" aria-label={`Select ${campaign.name}`} checked={selected.includes(campaign.name)} onChange={() => toggleRow(campaign.name)} /></td><th scope="row"><span className="explorer-campaign-dot" />{campaign.name}</th><td>{campaign.objective}</td><td><span className="explorer-stage">{campaign.stage}</span></td><td>AED {integer.format(campaign.spend)}</td><td>AED {integer.format(campaign.revenue)}</td><td>{integer.format(campaign.purchases)}</td><td className="explorer-roas-value">{campaign.roas.toFixed(2)}x</td><td>AED {campaign.cpa.toFixed(2)}</td><td>{campaign.ctr.toFixed(2)}%</td><td><span className="explorer-assessment">{campaign.assessment}</span></td></tr>)}</tbody></table>{rows.length === 0 && <p className="explorer-no-results">No campaigns match your filters.</p>}</div>
      <div className="explorer-table-footer"><span>Showing {rows.length} of {campaigns.length} sample campaigns</span><span className="explorer-pagination"><ChevronLeft size={14} />1<ChevronRight size={14} /></span></div>
    </section>
    <footer className="explorer-footer"><span>© 2025 AIGENTZ</span><span>Sample dashboard data</span></footer>
  </div>
}

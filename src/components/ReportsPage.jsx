import { createElement, useEffect, useState } from 'react'
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays,
  CheckCircle2, ChevronDown, Download, FileText, RefreshCw, Rocket,
  Shield, Sparkles, TrendingUp, Wrench, X,
} from 'lucide-react'
import './ReportsPage.css'

const briefSections = [
  {
    id: 'changed', title: 'What Changed', tag: 'Trajectory Shift', Icon: TrendingUp, tone: 'blue',
    entries: [
      { label: '↑ +24% Revenue velocity in Catalog Feed', detail: 'Algorithmic DPA expanded reach across GCC markets resulting in AED 444,358 total revenue.' },
      { label: '↓ CPA improved by 18% in Brand Search', detail: 'Exact match query pruning reduced wasted spend on broad keyword duplicates.' },
      { label: '↑ +12% Reach in Retention Cohort', detail: 'Custom audience sync frequency lowered bounce rates across checkout re-engagement.' },
      { label: '↓ CTR dip in video formats (-9%)', detail: 'Initial hook retention dropped by 0.8s across top video placements after day 18.' },
    ],
  },
  {
    id: 'fix', title: 'What to Fix', tag: 'Urgent Actions', Icon: Wrench, tone: 'red',
    entries: [
      { label: 'Summer Hero 9:16 Video (Creative Fatigue)', detail: 'Frequency reached 3.4x with CTR decaying 22% over the last 14 days; swap to the secondary B-roll cut.' },
      { label: 'Low-ROAS Network Placement (TikTok & Display)', detail: 'ROAS is 2.2x against a 6.0x benchmark; reduce the bid cap or pause unvalidated placements.' },
      { label: 'Checkout Dropoff in Mobile Web', detail: 'Cart abandonment rose 4.1% during evening rush hours due to checkout script latency on Safari iOS.' },
    ],
  },
  {
    id: 'scale', title: 'Where to Scale', tag: 'Yield Drivers', Icon: Rocket, tone: 'blue',
    entries: [
      { label: 'Omnichannel Dynamic Feed (8.20x ROAS)', detail: 'Marginal return remains strong above 8x; increase the daily cap by AED 5,000.' },
      { label: 'VIP Loyalty Tier 1 & 2 (13.13x ROAS)', detail: 'High conversion efficiency with low saturation; expand the lookalike audience to 2% UAE buyers.' },
      { label: 'Localized Arabic Creatives (Saudi Arabia)', detail: 'KSA localized headline variations delivered a 32% lift in conversion rates at early test spends.' },
    ],
  },
  {
    id: 'risks', title: 'Risks', tag: 'Threat Horizon', Icon: Shield, tone: 'amber',
    entries: [
      { label: 'Creative Concentration Risk', detail: '42% of total conversion volume depends on two video assets, creating a single-point vulnerability.' },
      { label: 'Q4 Holiday CPM Inflation Surge', detail: 'UAE fashion retail CPMs are projected to rise 25–30% heading into November.' },
      { label: 'iOS Privacy Signal Latency', detail: 'SKAdNetwork 4.0 purchase verification can lag by 48 hours.' },
    ],
  },
]

const opportunities = [
  { name: 'Omnichannel Dynamic Catalog', type: 'Catalog Feed', detail: 'Scale top-performing algorithmic feed to Saudi & Kuwait tiers', action: 'Expand geographic delivery with localized currency feeds', impact: '+AED 48,000 / mo', measure: 'revenue potential' },
  { name: 'VIP Loyalty Audience', type: 'First-Party Data', detail: 'Re-engage dormant 90-day buyers with exclusive seasonal early-access', action: 'Deploy custom audience sync with tailored dynamic discount creatives', impact: '+AED 26,500 / mo', measure: 'revenue potential' },
  { name: 'High-Intent Search Exact Match', type: 'Search Intent', detail: 'Harvest uncaptured search intent on core branded and category terms', action: 'Increase impression share target from 72% to 90%', impact: '+AED 18,200 / mo', measure: 'revenue potential' },
  { name: 'Video Creative Variation Refresh', type: 'Creative Assets', detail: 'Introduce UGC testimonial cuts to mitigate Summer Hero fatigue', action: 'Activate 3 pre-cleared creator assets in consideration ad sets', impact: 'Stabilize CTR', measure: 'target > 4.5%' },
]

const boardSummary = [
  ['Executive summary', 'ROAS remained above the 6.0x benchmark across active tiers. Catalog inventory drove growth, while mid-funnel creative fatigue and secondary placements reduced efficiency.'],
  ['Key highlights', 'Catalog Feed generated AED 444,358 in revenue. Brand Search CPA improved by 18%. Four sample actions reallocated AED 14,200.'],
  ['Strategic recommendations', 'Scale catalog ads in Saudi Arabia and Kuwait, rotate the Summer Hero creative, and raise the Brand Search impression share target.'],
  ['Financial impact', 'The three quantified growth opportunities total an illustrative AED 92,700 per month. These estimates have not been independently validated.'],
  ['Risk alerts', 'Monitor creative concentration, holiday CPM inflation, and delayed iOS attribution signals.'],
]

function BriefCard({ section, expanded, onToggle }) {
  const visible = expanded ? section.entries : section.entries.slice(0, 2)
  return <article className="report-brief-card">
    <div className="report-card-head"><div><span className={`report-icon ${section.tone}`}>{createElement(section.Icon, { size: 17 })}</span><h3>{section.title}</h3></div><span className="report-card-tag">{section.tag}</span></div>
    <div className="report-brief-items">{visible.map((entry) => <div className="report-brief-item" key={entry.label}><strong className={section.tone}>{entry.label}</strong><p>{entry.detail}</p></div>)}</div>
    {section.entries.length > 2 && <button className="report-showall" type="button" onClick={onToggle} aria-expanded={expanded}>{expanded ? 'Show less' : `Show all (${section.entries.length} ${section.id === 'changed' ? 'updates' : 'items'})`}<ChevronDown size={15} className={expanded ? 'up' : ''} /></button>}
  </article>
}

export default function ReportsPage() {
  const [expanded, setExpanded] = useState({})
  const [modal, setModal] = useState(null)
  const [reminderDate, setReminderDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
  const [reminderTime, setReminderTime] = useState('09:00')
  useEffect(() => {
    if (!modal) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setModal(null) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [modal])

  const downloadMarkdown = () => {
    const markdown = `# AIGENTZ Executive Briefing\n\nSample report · Sep 15–Oct 14, 2025\n\n${boardSummary.map(([title, body]) => `## ${title}\n\n${body}`).join('\n\n')}\n`
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'aigentz-executive-brief-sample.md'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const printFullReport = () => {
    setExpanded(Object.fromEntries(briefSections.map((section) => [section.id, true])))
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()))
  }

  const downloadReminder = () => {
    const start = new Date(`${reminderDate}T${reminderTime}:00`)
    if (Number.isNaN(start.getTime())) return
    const end = new Date(start.getTime() + 30 * 60000)
    const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AIGENTZ//Demo Report Reminder//EN', 'BEGIN:VEVENT', `UID:aigentz-report-${stamp(start)}@demo.local`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, 'SUMMARY:Review AIGENTZ executive report', 'DESCRIPTION:Open the sample AIGENTZ Reports page to review or export the report.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'aigentz-report-reminder.ics'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setModal(null)
  }

  return <div className={`reports-page${modal === 'summary' ? ' print-summary' : ''}`}>
    <header className="report-heading"><div><div className="report-title-row"><h1>Reports</h1><span>Executive Edition</span></div><p>Executive intelligence briefings, diagnostic analyses, and board-ready deliverables.</p></div><div className="report-actions"><span className="report-generated"><CalendarDays size={16} />Sample generated Oct 15, 2025</span><button type="button" onClick={() => setModal('schedule')}><CalendarDays size={16} />Set Reminder</button><button type="button" className="primary" onClick={printFullReport}><Download size={16} />Export PDF</button></div></header>

    <section className="report-synthesis"><div className="report-synthesis-top"><div><span className="report-synthesis-pill"><Sparkles size={14} />Weekly Synthesis</span><small>Period: <strong>Last 7 days</strong></small></div><span>Conf: 99.4% · Sample diagnosis</span></div><h2>Stable ROAS with creative fatigue emerging in mid-funnel retargeting.</h2><div className="report-synthesis-grid"><div><span className="report-icon blue"><CheckCircle2 size={18} /></span><div><small>Approved Actions</small><strong>4 actions applied</strong><p>Rules executed across campaigns</p></div></div><div><span className="report-icon blue"><RefreshCw size={18} /></span><div><small>Budget Shift</small><strong>AED +14,200 reallocated</strong><p>Directed to top catalog feed</p></div></div><div className="risk"><span className="report-icon red"><AlertTriangle size={18} /></span><div><small>Primary Risk</small><strong>Ad saturation on Summer Hero</strong><p>9:16 video frequency reached 3.4x</p></div></div></div></section>

    <section className="report-brief"><div className="report-section-head"><div><h2>AI Executive Brief</h2><span>Analysis window: <strong>Sep 15 – Oct 14, 2025</strong> · Generated: <strong>Oct 15, 2025</strong></span></div><small>4 Diagnostic Dimensions Analyzed</small></div><div className="report-brief-grid">{briefSections.map((section) => <BriefCard key={section.id} section={section} expanded={Boolean(expanded[section.id])} onToggle={() => setExpanded((current) => ({ ...current, [section.id]: !current[section.id] }))} />)}</div></section>

    <section className="report-opportunities"><div className="report-opportunity-head"><div><div><h2>Growth Opportunities</h2><span>Priority Ranked</span></div><p>Expansion opportunities ranked by revenue potential and implementation readiness.</p></div></div><div className="report-opportunity-list">{opportunities.map((item, index) => <article key={item.name}><span className="report-rank">{index + 1}</span><div className="report-opportunity-copy"><div><h3>{item.name}</h3><span>{item.type}</span></div><p>{item.detail}</p><small><ArrowRight size={15} />Proposed Action: <strong>{item.action}</strong></small></div><div className="report-impact"><small>{index === 3 ? 'Quality Goal' : 'Estimated Impact'}</small><strong>{item.impact}</strong><span>{item.measure}</span></div></article>)}</div></section>

    <section className="report-governance"><div className="report-governance-icon"><Sparkles size={27} /></div><h2>Executive Governance Ready</h2><p>Consolidate insights, recommendations, and forward exposure modeling into a presentation document.</p><button type="button" onClick={() => setModal('summary')}><FileText size={18} />Generate Board-Ready Summary</button><small>Sample executive PDF or Markdown for leadership and stakeholders.</small></section>
    <footer className="report-footer"><span>© 2025 AIGENTZ · Sample report</span><span>Know Exactly What to Do Next</span></footer>

    {modal && <div className="report-modal-backdrop" onClick={() => setModal(null)}><div className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title" onClick={(event) => event.stopPropagation()}><div className="report-modal-head"><div><span className="report-icon blue">{modal === 'summary' ? <BadgeCheck size={18} /> : <CalendarDays size={18} />}</span><h2 id="report-modal-title">{modal === 'summary' ? 'Board-Ready Executive Briefing' : 'Set a report reminder'}</h2></div><button type="button" aria-label="Close" onClick={() => setModal(null)}><X size={19} /></button></div>{modal === 'summary' ? <><div className="report-modal-body"><p className="report-modal-note">Sample synthesis · Sep 15–Oct 14, 2025</p>{boardSummary.map(([title, body]) => <section key={title}><h3><ArrowUpRight size={15} />{title}</h3><p>{body}</p></section>)}</div><div className="report-modal-actions"><button type="button" onClick={downloadMarkdown}><Download size={16} />Download Markdown</button><button type="button" className="primary" onClick={() => window.print()}><Download size={16} />Export PDF</button></div></> : <div className="report-modal-body"><p>Download a calendar reminder to review this sample report. Automatic delivery requires a connected report service.</p><div className="report-reminder-fields"><label>Reminder date <input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} /></label><label>Time <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} /></label></div><button type="button" className="report-modal-dismiss" disabled={!reminderDate || !reminderTime} onClick={downloadReminder}><Download size={16} /> Download calendar reminder</button></div>}</div></div>}
  </div>
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, BarChart3, LayoutDashboard,
  LockKeyhole, LogOut, ShieldCheck, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'
import './AigentzLandingPage.css'

const examples = [
  {
    title: 'Summer Retargeting ROAS',
    question: 'Why is ROAS dropping on the Summer Collection retargeting set, and what immediate reallocation do you recommend?',
    simple: <>The Summer Hero 9:16 Video creative has reached saturation frequency (3.4×) across core retargeting pools. Reallocating <strong>AED 14.2k</strong> into your uncapped Dynamic Catalog feed is projected to yield <mark>+18% ROAS lift</mark> without audience wearout.</>,
    detailed: <>Summer Hero 9:16 Video reached 3.4× frequency over the last 14 days, and retargeting ROAS declined from 8.4× to 6.1×. Moving <strong>AED 14.2k</strong> from that fatigued segment to the Dynamic Catalog feed uses available headroom and is projected to deliver <mark>+18% ROAS lift</mark>. Review the underlying campaign data before applying any change.</>,
    time: 'Today 10:14 AM',
  },
  {
    title: 'Q3 Catalog Attribution',
    question: 'How is the Dynamic Catalog feed contributing to attributed revenue?',
    simple: <>The Dynamic Catalog feed is the strongest scale opportunity in this sample. Its uncapped delivery has room to absorb budget while keeping return above the account target.</>,
    detailed: <>The Dynamic Catalog feed remains above the 6.0× account ROAS target and has unused delivery capacity. Its contribution has improved alongside Meta scaling, making it a candidate for a measured budget test with a defined rollback threshold.</>,
    time: 'Yesterday',
  },
  {
    title: 'Brand Awareness Drift',
    question: 'What changed in our UAE awareness campaign?',
    simple: <>Frequency rose to 4.1× in the UAE audience. Reach is still growing, but creative repetition is increasing. Review new variants before raising spend.</>,
    detailed: <>The UAE tier-one awareness audience reached 4.1× frequency. Delivery is continuing, but the same creative is appearing more often to a narrower pool. Compare reach and CTR by placement, then rotate a new variant before increasing budget.</>,
    time: 'Aug 24',
  },
]

const actions = [
  { type: '+18% ROAS', meta: 'AED 14,200', title: 'Reallocate to Catalog Feed', body: 'Shift AED 14.2k from fatigued retargeting into high-yield catalog ads.', tone: 'positive' },
  { type: '3.4× Freq', meta: 'Fatigue safeguard', title: 'Pause Saturated Creative', body: 'Summer Hero 9:16 video exceeds the repetition threshold.', tone: 'risk' },
  { type: 'Fresh Creative', meta: 'Asset #410-B', title: 'Activate B-Roll Variant', body: 'Deploy a pre-cleared 9:16 variant to prevent frequency creep.', tone: 'neutral' },
]

function AssistantWorkspace() {
  const [thread, setThread] = useState(0)
  const [style, setStyle] = useState('simple')
  const [tab, setTab] = useState('chat')
  const active = examples[thread]

  return <section className="ax-workspace" aria-label="AIGENTZ assistant">
      <div className="ax-preview">
        <div className="ax-preview-toolbar">
          <div className="ax-preview-identity"><strong>Analytics Assistant</strong><span className="ax-account">Acme Brands Ltd. · AED</span><span className="ax-sync">Illustrative example</span></div>
          <div className="ax-preview-tools"><span className="ax-style-label">Answer style</span><div className="ax-style-switch" role="group" aria-label="Answer style"><button type="button" aria-pressed={style === 'simple'} onClick={() => setStyle('simple')}>Simple</button><button type="button" aria-pressed={style === 'detailed'} onClick={() => setStyle('detailed')}>Detailed</button></div></div>
        </div>
        <div className="ax-mobile-tabs" role="tablist" aria-label="Preview panels">{[['chat', 'Chat'], ['history', 'History'], ['actions', 'Actions (3)']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div className="ax-preview-grid">
          <aside className={`ax-preview-history${tab === 'history' ? ' is-active' : ''}`} aria-label="Sample conversations">
            <div className="ax-small-label">Recent threads</div>
            {examples.map((item, index) => <button className={`ax-thread${thread === index ? ' is-selected' : ''}`} key={item.title} type="button" aria-pressed={thread === index} onClick={() => { setThread(index); setTab('chat') }}><strong>{item.title}</strong><span>{item.question}</span><small>{item.time}</small></button>)}
          </aside>

          <div className={`ax-preview-chat${tab === 'chat' ? ' is-active' : ''}`}>
            <div className="ax-preview-messages"><div className="ax-question"><div>{active.question}</div><small>10:14 AM&nbsp; · &nbsp;You</small></div><div className="ax-answer"><span className="ax-answer-icon"><Sparkles size={15} /></span><div><p>{style === 'simple' ? active.simple : active.detailed}</p><div className="ax-answer-actions"><Link to="/dashboard/recommendations">Review recommendation <ArrowRight size={13} /></Link><Link to="/dashboard/explorer"><BarChart3 size={13} /> View evidence</Link></div></div></div></div>
            <button className="ax-preview-input" type="button" onClick={() => setThread((thread + 1) % examples.length)}><span>Try another sample question</span><span className="ax-input-send"><ArrowUp size={15} /></span></button>
          </div>

          <aside className={`ax-preview-actions${tab === 'actions' ? ' is-active' : ''}`} aria-label="Sample assisted actions">
            <div className="ax-actions-head"><div><ShieldCheck size={16} /><strong>Suggested actions</strong></div><span>3 ideas</span></div>
            {actions.map((action) => <article className="ax-action-card" key={action.title}><div className="ax-action-meta"><span className={action.tone}>{action.type}</span><small>{action.meta}</small></div><h3>{action.title}</h3><p>{action.body}</p><Link to="/dashboard/recommendations">Review <ArrowRight size={12} /></Link></article>)}
            <div className="ax-actions-foot"><LockKeyhole size={14} /> You approve any change</div>
          </aside>
        </div>
      </div>
  </section>
}

export default function AigentzLandingPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/login') }

  return <div className="ax-page">
    <header className="ax-header"><div className="ax-header-inner"><Link to="/aigentz" className="ax-header-brand" aria-label="AIGENTZ home"><BrandLogo className="ax-logo" /></Link><nav aria-label="AIGENTZ navigation"><Link className="ax-dashboard-link" to="/dashboard"><LayoutDashboard size={18} /> Dashboard</Link><button type="button" onClick={handleLogout}><LogOut size={18} /> Log out</button></nav></div></header>
    <main className="ax-main"><AssistantWorkspace /></main>
  </div>
}

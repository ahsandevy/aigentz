import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, BarChart3, Bot, LayoutDashboard,
  LockKeyhole, LogOut, MoreHorizontal, Plus, Search, ShieldCheck, Sparkles,
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
  const [tab, setTab] = useState('chat')
  const [started, setStarted] = useState(false)
  const active = examples[thread]

  return <section className="ax-workspace" aria-label="AIGENTZ assistant">
      <div className="ax-preview">
        <div className="ax-mobile-tabs" role="tablist" aria-label="Preview panels">{[['chat', 'Chat'], ['history', 'History'], ['actions', 'Actions (3)']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div className="ax-preview-grid">
          <aside className={`ax-preview-history${tab === 'history' ? ' is-active' : ''}`} aria-label="My chats">
            <div className="ax-history-head"><strong><span className="ax-history-mark"><Sparkles size={12} /></span>My Chats</strong><button type="button" aria-label="Chat options"><MoreHorizontal size={14} /></button></div>
            <label className="ax-history-search"><Search size={13} /><input type="search" placeholder="Search" aria-label="Search chats" /></label>
            <div className="ax-history-section ax-history-chats">
              <div className="ax-history-section-label"><span>Chats</span><MoreHorizontal size={12} /></div>
              {examples.map((item, index) => <button className={`ax-thread${thread === index ? ' is-selected' : ''}`} key={item.title} type="button" aria-pressed={thread === index} onClick={() => { setThread(index); setTab('chat'); setStarted(true) }}><span className="ax-thread-icon"><Sparkles size={10} /></span><span className="ax-thread-copy"><strong>{item.title}</strong><small>{item.question}</small></span></button>)}
            </div>
            <button className="ax-new-chat" type="button" onClick={() => { setStarted(false); setThread(0); setTab('chat') }}><span>New chat</span><span><Plus size={14} /></span></button>
          </aside>

          <div className={`ax-preview-chat${tab === 'chat' ? ' is-active' : ''}`}>
            {!started ? (
              <div className="ax-chat-welcome">
                <div className="ax-welcome-orbit"><Bot size={18} /></div>
                <span className="ax-welcome-kicker">AIGENTZ ANALYTICS</span>
                <h1>How can we help you today?</h1>
                <p className="ax-welcome-copy">Ask about performance, spot what changed, and turn the signal into a next step.</p>
                <div className="ax-welcome-pros">
                  <div className="ax-welcome-pro"><span><BarChart3 size={14} /></span><strong>Find the signal</strong><small>See what is moving your results.</small></div>
                  <div className="ax-welcome-pro"><span><Sparkles size={14} /></span><strong>Get the why</strong><small>Understand the story behind the metric.</small></div>
                  <div className="ax-welcome-pro"><span><ShieldCheck size={14} /></span><strong>Act with confidence</strong><small>Review evidence before you change spend.</small></div>
                </div>
                <button className="ax-preview-input ax-welcome-input" type="button" onClick={() => setStarted(true)}><span>Start with your campaigns</span><span className="ax-input-send"><ArrowUp size={15} /></span></button>
                <small className="ax-welcome-note">AI can make mistakes. Verify important data.</small>
              </div>
            ) : (
              <>
                <div className="ax-preview-messages"><div className="ax-question"><div>{active.question}</div><small>10:14 AM&nbsp; · &nbsp;You</small></div><div className="ax-answer"><span className="ax-answer-icon"><Bot size={15} /></span><div><p>{active.detailed}</p><div className="ax-answer-actions"><Link to="/dashboard/recommendations">Review recommendation <ArrowRight size={13} /></Link><Link to="/dashboard/explorer"><BarChart3 size={13} /> View evidence</Link></div></div></div></div>
                <button className="ax-preview-input" type="button" onClick={() => setThread((thread + 1) % examples.length)}><span>Try another sample question</span><span className="ax-input-send"><ArrowUp size={15} /></span></button>
              </>
            )}
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

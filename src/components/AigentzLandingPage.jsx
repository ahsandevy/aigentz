import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, BarChart3, CircleCheck,
  Expand, LayoutDashboard, LockKeyhole, LogOut, Minimize2,
  RotateCcw, ShieldCheck, Sparkles,
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

function AssistantPreview({ fullScreen, setFullScreen }) {
  const [thread, setThread] = useState(0)
  const [style, setStyle] = useState('simple')
  const [tab, setTab] = useState('chat')
  const previewRef = useRef(null)
  const fullScreenButtonRef = useRef(null)
  const active = examples[thread]

  useEffect(() => {
    if (!fullScreen) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    fullScreenButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setFullScreen(false)
      }
      if (event.key !== 'Tab') return

      const focusable = [...previewRef.current.querySelectorAll('a[href], button:not([disabled])')]
        .filter((element) => element.getClientRects().length)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [fullScreen, setFullScreen])

  return <section className="ax-preview-section" aria-label="AIGENTZ assistant preview">
    <div className="ax-container">
      <div className="ax-preview-intro"><div><span>Product preview</span><h2>See AIGENTZ in action</h2></div><p>Explore a sample conversation and the recommendations it creates.</p></div>
      <div ref={previewRef} className={`ax-preview${fullScreen ? ' is-fullscreen' : ''}`} role={fullScreen ? 'dialog' : undefined} aria-modal={fullScreen ? 'true' : undefined} aria-label={fullScreen ? 'Full-screen AIGENTZ chatbot preview' : undefined}>
        <div className="ax-preview-toolbar">
          <div className="ax-preview-identity"><BrandLogo className="ax-logo" /><span className="ax-account">Acme Brands Ltd. · AED</span><span className="ax-sync">Illustrative example</span></div>
          <div className="ax-preview-tools"><div className="ax-style-switch" role="group" aria-label="Preview answer style"><button type="button" aria-pressed={style === 'simple'} onClick={() => setStyle('simple')}>Simple</button><button type="button" aria-pressed={style === 'detailed'} onClick={() => setStyle('detailed')}>Detailed</button></div><button ref={fullScreenButtonRef} className="ax-expand" type="button" aria-label={fullScreen ? 'Exit full-screen chatbot' : 'Open full-screen chatbot'} onClick={() => setFullScreen(!fullScreen)}>{fullScreen ? <Minimize2 size={15} /> : <Expand size={15} />}<span>{fullScreen ? 'Exit full screen' : 'Full-screen chat'}</span></button></div>
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
    </div>
  </section>
}

export default function AigentzLandingPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [fullScreen, setFullScreen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return <div className="ax-page">
    <header className="ax-header"><div className="ax-container ax-header-inner"><Link to="/aigentz" className="ax-header-brand"><BrandLogo className="ax-logo" /></Link><nav aria-label="AIGENTZ navigation"><Link to="/dashboard"><LayoutDashboard size={16} /> Dashboard</Link><span className="ax-header-divider" /><button type="button" onClick={handleLogout}><LogOut size={16} /> Log out</button></nav></div></header>

    <main>
      <section className="ax-hero"><div className="ax-container"><span className="ax-eyebrow">Meet AIGENTZ</span><h1>Marketing Expertise, on Demand.<span>Always available. Always Executing.</span></h1><p>An AI-powered growth strategist that detects wasted spend, reallocates budgets, refreshes creatives, and optimizes performance — no expertise required.</p><div className="ax-hero-actions"><button className="ax-primary" type="button" onClick={() => setFullScreen(true)}>Open full-screen chat <Expand size={18} /></button></div></div></section>

      <AssistantPreview fullScreen={fullScreen} setFullScreen={setFullScreen} />

      <section className="ax-awareness"><div className="ax-container ax-awareness-grid"><div><h2>See what needs attention.</h2></div><div><p>Bring audience fatigue, budget pacing, and campaign performance into one clear view, so you can focus on the decisions that matter.</p><small>Meta &nbsp;·&nbsp; Google Ads &nbsp;·&nbsp; Campaign diagnostics</small></div></div></section>

      <section className="ax-process"><div className="ax-container"><h2>From question to action.</h2><div className="ax-process-grid"><article><span>01 / Ask</span><h3>Ask in plain language</h3><p>Ask what changed in a campaign or where your budget could work harder.</p></article><article><span>02 / Understand</span><h3>Get a clear answer</h3><p>See the reason, the supporting data, and a recommended next step together.</p></article><article><span>03 / Approve</span><h3>Review the next step</h3><p>Check a proposed budget shift or creative change before anything is applied.</p></article></div></div></section>

      <section className="ax-control"><div className="ax-container"><h2>You stay in control.</h2><p>Review each proposed budget shift or creative pause before it goes live. Approval and rollback safeguards keep every action in your hands.</p><div className="ax-control-points"><span><CircleCheck size={17} /> Your approval</span><span><RotateCcw size={17} /> Rollback safeguards</span><span><LockKeyhole size={17} /> Scoped access</span></div></div></section>

      <section className="ax-final"><div className="ax-container"><h2>Ready to see what AIGENTZ finds?</h2><p>Explore a sample conversation and see the next steps AIGENTZ recommends.</p><button className="ax-primary" type="button" onClick={() => setFullScreen(true)}>Open full-screen chat <Expand size={18} /></button></div></section>
    </main>
    <footer className="ax-footer"><div className="ax-container"><div><strong>AIGENTZ</strong><span>AI marketing assistant</span></div><div><Link to="/dashboard">Dashboard</Link><Link to="/dashboard/explorer">Performance</Link></div></div></footer>
  </div>
}

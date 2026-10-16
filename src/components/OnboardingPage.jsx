import { createElement, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, Check,
  CircleDollarSign, Eye, Megaphone, MousePointerClick, Palette,
  ShoppingBag, Sparkles, Target, TrendingDown, TrendingUp, Users,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'
import { saveOnboarding } from '../services/onboarding'
import './OnboardingPage.css'

const roles = [
  { id: 'business-owner', label: 'Business Owner', description: 'Keep the big picture in focus across revenue, spend, and growth.', icon: BriefcaseBusiness },
  { id: 'marketing-lead', label: 'Marketing Lead', description: 'Plan campaigns, spot opportunities, and improve performance.', icon: Megaphone },
  { id: 'data-analyst', label: 'Data & BI Analyst', description: 'Explore trends, compare metrics, and uncover what changed.', icon: BarChart3 },
  { id: 'agency-partner', label: 'Agency Partner', description: 'Turn account performance into clear updates for clients.', icon: Users },
]

const metrics = [
  { id: 'revenue', label: 'Revenue', icon: CircleDollarSign },
  { id: 'roas', label: 'ROAS', icon: TrendingUp },
  { id: 'spend', label: 'Spend', icon: Wallet },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'cpa', label: 'CPA', icon: Target },
  { id: 'ctr', label: 'CTR', icon: MousePointerClick },
  { id: 'reach', label: 'Reach', icon: Eye },
  { id: 'link-clicks', label: 'Link clicks', icon: MousePointerClick },
]

const signals = [
  { id: 'growth', label: 'Growth', description: 'Know when results are accelerating.', icon: TrendingUp },
  { id: 'budget-efficiency', label: 'Budget efficiency', description: 'Spot spend that could work harder.', icon: Wallet },
  { id: 'performance-drops', label: 'Performance drops', description: 'Catch declines before they become costly.', icon: TrendingDown },
  { id: 'creative-fatigue', label: 'Creative fatigue', description: 'See when ads need a refresh.', icon: Palette },
  { id: 'audience-reach', label: 'Audience reach', description: 'Track delivery and saturation.', icon: Users },
]

function ToggleChoice({ icon: Icon, title, description, selected, onClick, compact = false }) {
  return <button
    type="button"
    className={`onboarding-choice${selected ? ' is-selected' : ''}${compact ? ' is-compact' : ''}`}
    aria-pressed={selected}
    onClick={onClick}
  >
    <span className="onboarding-choice-icon">{createElement(Icon, { size: 18, strokeWidth: 1.8 })}</span>
    <span className="onboarding-choice-copy"><strong>{title}</strong>{description && <small>{description}</small>}</span>
    <span className="onboarding-choice-check" aria-hidden="true">{selected && <Check size={13} strokeWidth={3} />}</span>
  </button>
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answerStyle, setAnswerStyle] = useState('simple')
  const [role, setRole] = useState('marketing-lead')
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'roas', 'spend', 'purchases'])
  const [selectedSignals, setSelectedSignals] = useState(['growth', 'budget-efficiency'])

  const toggle = (value, selected, setSelected) => {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  const finish = () => {
    saveOnboarding(user, { answerStyle, role, metrics: selectedMetrics, signals: selectedSignals })
    navigate('/aigentx', { replace: true })
  }

  const next = () => step === 3 ? finish() : setStep(step + 1)

  return <main className="onboarding-page">
    <div className="onboarding-progress" aria-label={`Step ${step + 1} of 4`}><span style={{ width: `${(step + 1) * 25}%` }} /></div>
    <header className="onboarding-header">
      <div className="onboarding-brand"><BrandLogo className="onboarding-brand-logo" /></div>
      <span className="onboarding-step-count">STEP {step + 1} OF 4</span>
    </header>

    <div className="onboarding-content" key={step}>
      <div className="onboarding-intro">
        <span className="onboarding-eyebrow"><Sparkles size={15} /> YOUR WORKSPACE</span>
        {step === 0 && <><h1>How should AI answer?</h1><p>Choose how much detail you prefer in insights, alerts, and recommended actions.</p></>}
        {step === 1 && <><h1>What’s your role?</h1><p>Tell us how you work with marketing data.</p></>}
        {step === 2 && <><h1>Which metrics matter most?</h1><p>Choose the numbers that matter most to you.</p></>}
        {step === 3 && <><h1>What should we watch?</h1><p>Choose the signals you want to follow most closely.</p></>}
      </div>

      {step === 0 && <div className="onboarding-options" role="group" aria-label="AI answer style">
        <ToggleChoice icon={Sparkles} title="Simple" description="Clear takeaways and practical next steps, without the extra detail." selected={answerStyle === 'simple'} onClick={() => setAnswerStyle('simple')} />
        <ToggleChoice icon={BarChart3} title="Detailed" description="More context, supporting metrics, and the reasoning behind each insight." selected={answerStyle === 'detailed'} onClick={() => setAnswerStyle('detailed')} />
      </div>}

      {step === 1 && <div className="onboarding-options" role="group" aria-label="Your role">
        {roles.map(({ id, label, description, icon }) => <ToggleChoice key={id} icon={icon} title={label} description={description} selected={role === id} onClick={() => setRole(id)} />)}
      </div>}

      {step === 2 && <div className="onboarding-metrics" role="group" aria-label="Metrics to show first">
        {metrics.map(({ id, label, icon }) => <ToggleChoice key={id} icon={icon} title={label} selected={selectedMetrics.includes(id)} onClick={() => toggle(id, selectedMetrics, setSelectedMetrics)} compact />)}
      </div>}

      {step === 3 && <div className="onboarding-options" role="group" aria-label="Signals to watch">
        {signals.map(({ id, label, description, icon }) => <ToggleChoice key={id} icon={icon} title={label} description={description} selected={selectedSignals.includes(id)} onClick={() => toggle(id, selectedSignals, setSelectedSignals)} />)}
      </div>}

      <footer className="onboarding-actions">
        <button type="button" className="onboarding-back" onClick={() => setStep(step - 1)} disabled={step === 0}><ArrowLeft size={16} /> Back</button>
        <div className="onboarding-actions-right">
          <span>{step === 2 ? `${selectedMetrics.length} selected` : step === 3 ? `${selectedSignals.length} selected` : ''}</span>
          <button type="button" className="onboarding-next" onClick={next} disabled={(step === 2 && selectedMetrics.length === 0) || (step === 3 && selectedSignals.length === 0)}>{step === 3 ? 'Open AIGENTZ' : 'Continue'} <ArrowRight size={16} /></button>
        </div>
      </footer>
    </div>
    <p className="onboarding-legal">Your choices are saved in this browser when you finish.</p>
  </main>
}

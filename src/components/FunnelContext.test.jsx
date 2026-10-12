import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import FunnelContext from './FunnelContext'
import { audienceContext, campaignStageSpend } from '../utils/funnelClassification'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})

describe('configured audience context', () => {
  it('keeps sales and purchase optimization separate from TOFU', () => {
    render(<FunnelContext showStage item={{ funnel_context: {
      audience_stage: 'TOFU', campaign_objective: 'OUTCOME_SALES',
      optimization_goal: 'OFFSITE_CONVERSIONS', optimization_event: 'PURCHASE',
      expansion_status: 'enabled', customer_relationship: 'unresolved',
      lifecycle_intent: 'UNKNOWN', classification_reason: 'Broad targeting',
    } }} />)
    expect(screen.getByText('TOFU · Prospecting')).toBeTruthy()
    expect(screen.queryByText(/Objective: OUTCOME_SALES/)).toBeNull()
    const button = screen.getByRole('button', { name: /TOFU|MOFU|BOFU|Classification unavailable/ })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
    expect(screen.queryByRole('button', { name: 'Funnel classification' })).toBeNull()
    expect(screen.getByText(/Objective: OUTCOME_SALES/)).toBeTruthy()
    expect(screen.getByText('Optimization event: PURCHASE')).toBeTruthy()
    expect(screen.queryByText(/Lifecycle/)).toBeNull()
    expect(screen.getByText(/Expansion: enabled/)).toBeTruthy()
    expect(screen.getByText('Broad targeting')).toBeTruthy()
    expect(screen.getByText(/delivered audience composition is unobserved/)).toBeTruthy()
    expect(screen.queryByText(/awareness/i)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Close funnel details' }))
    expect(screen.queryByText('Optimization event: PURCHASE')).toBeNull()
    expect(screen.getByText('TOFU · Prospecting')).toBeTruthy()
  })

  it('shows UNKNOWN spend alongside known stages without redistribution', () => {
    render(<FunnelContext item={{ stage_spend_distribution: {
      TOFU: { spend: 75, spend_percentage: 75 },
      MOFU: { spend: 0, spend_percentage: 0 },
      BOFU: { spend: 0, spend_percentage: 0 },
      UNKNOWN: { spend: 25, spend_percentage: 25 },
    } }} />)
    expect(screen.queryByText('Ad-set stage spend')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /TOFU|MOFU|BOFU|Classification unavailable/ }))
    expect(screen.getByText('UNKNOWN: 25 (25.0%)')).toBeTruthy()
    expect(screen.getByText('TOFU: 75 (75.0%)')).toBeTruthy()
    expect(screen.getByText('BOFU: 0 (0.0%)')).toBeTruthy()
  })

  it('does not fabricate stage or spend from an objective-only legacy response', () => {
    const item = { objective: 'OUTCOME_SALES', spend: 100 }
    expect(audienceContext(item).audienceStage).toBe('UNKNOWN')
    expect(audienceContext(item).expansion).toBe('unknown')
    expect(campaignStageSpend(item)).toEqual([])
    expect(campaignStageSpend({ stage_spend_distribution: { UNKNOWN: { spend: null } } })).toEqual([])
    render(<FunnelContext showStage item={item} />)
    expect(screen.getByText(/Classification unavailable/)).toBeTruthy()
    expect(screen.queryByText('Ad-set stage spend')).toBeNull()
  })

  it('opens a portal modal and closes with Escape, restoring badge focus', () => {
    const { container } = render(<FunnelContext item={{ funnel_stage: 'MOFU' }} />)
    const trigger = screen.getByRole('button', { name: 'MOFU · Warm audience' })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    expect(container.contains(dialog)).toBe(false)
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Close funnel details' }))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps modal interactions separate from row clicks and closes on backdrop', () => {
    const onRowClick = vi.fn()
    render(<div onClick={onRowClick}><FunnelContext item={{ funnel_stage: 'BOFU' }} /></div>)
    fireEvent.click(screen.getByRole('button', { name: 'BOFU · High intent' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByText(/Objective:/))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(onRowClick).not.toHaveBeenCalled()
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('retains zero-total buckets and signed reconciliation residuals without a percentage', () => {
    render(<FunnelContext item={{
      spend_distribution_basis: 'adset_ledger_with_campaign_reconciliation',
      stage_spend_distribution: {
        TOFU: { spend: 10, spend_percentage: null },
        UNKNOWN: { spend: -10, spend_percentage: null },
      },
    }} />)
    fireEvent.click(screen.getByRole('button', { name: /TOFU|MOFU|BOFU|Classification unavailable/ }))
    expect(screen.getByText('TOFU: 10 (percentage unavailable)')).toBeTruthy()
    expect(screen.getByText('UNKNOWN: -10 (percentage unavailable)')).toBeTruthy()
    expect(screen.getByText(/Ad-set ledger reconciled to campaign spend/)).toBeTruthy()
  })

  it('labels incomplete spend coverage and shows multiple campaign optimization goals and events', () => {
    render(<FunnelContext item={{
      spend_distribution_basis: 'available_adset_metrics',
      funnel_context: { optimization_goals: ['OFFSITE_CONVERSIONS', 'LINK_CLICKS'], optimization_events: ['PURCHASE', 'ADD_TO_CART'] },
      stage_spend_distribution: { UNKNOWN: { spend: 0, spend_percentage: null } },
    }} />)
    fireEvent.click(screen.getByRole('button', { name: /TOFU|MOFU|BOFU|Classification unavailable/ }))
    expect(screen.getByText(/Optimization: OFFSITE_CONVERSIONS, LINK_CLICKS/)).toBeTruthy()
    expect(screen.getByText('Optimization event: PURCHASE, ADD_TO_CART')).toBeTruthy()
    expect(screen.getByText(/Available ad-set metrics only/)).toBeTruthy()
    expect(screen.getByText('UNKNOWN: 0 (percentage unavailable)')).toBeTruthy()
  })

  it.each(['retention', 'reactivation'])('shows explicitly supplied %s lifecycle strategy', (lifecycle) => {
    render(<FunnelContext item={{ funnel_context: { audience_stage: 'MOFU', lifecycle_intent: lifecycle } }} />)
    fireEvent.click(screen.getByRole('button', { name: 'MOFU · Warm audience' }))
    expect(screen.getByText(`Lifecycle strategy: ${lifecycle}`)).toBeTruthy()
  })
})

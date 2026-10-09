import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FunnelContext from './FunnelContext'
import { audienceContext, campaignStageSpend } from '../utils/funnelClassification'

describe('configured audience context', () => {
  it('keeps sales and purchase optimization separate from TOFU', () => {
    render(<FunnelContext showStage item={{ funnel_context: {
      audience_stage: 'TOFU', campaign_objective: 'OUTCOME_SALES',
      optimization_goal: 'OFFSITE_CONVERSIONS', optimization_event: 'PURCHASE',
      expansion_status: 'enabled', customer_relationship: 'unresolved',
      lifecycle_intent: 'UNKNOWN', classification_reason: 'Broad targeting',
    } }} />)
    expect(screen.getByText('TOFU · Prospecting')).toBeTruthy()
    expect(screen.getByText(/Objective: OUTCOME_SALES/)).toBeTruthy()
    expect(screen.getByText('Optimization event: PURCHASE')).toBeTruthy()
    expect(screen.getByText(/Expansion: enabled/)).toBeTruthy()
    expect(screen.getByText('Broad targeting')).toBeTruthy()
    expect(screen.getByText(/delivered audience composition is unobserved/)).toBeTruthy()
    expect(screen.queryByText(/awareness/i)).toBeNull()
  })

  it('shows UNKNOWN spend alongside known stages without redistribution', () => {
    render(<FunnelContext item={{ stage_spend_distribution: {
      TOFU: { spend: 75, spend_percentage: 75 },
      MOFU: { spend: 0, spend_percentage: 0 },
      BOFU: { spend: 0, spend_percentage: 0 },
      UNKNOWN: { spend: 25, spend_percentage: 25 },
    } }} />)
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

  it('retains zero-total buckets and signed reconciliation residuals without a percentage', () => {
    render(<FunnelContext item={{
      spend_distribution_basis: 'adset_ledger_with_campaign_reconciliation',
      stage_spend_distribution: {
        TOFU: { spend: 10, spend_percentage: null },
        UNKNOWN: { spend: -10, spend_percentage: null },
      },
    }} />)
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
    expect(screen.getByText(/Optimization: OFFSITE_CONVERSIONS, LINK_CLICKS/)).toBeTruthy()
    expect(screen.getByText('Optimization event: PURCHASE, ADD_TO_CART')).toBeTruthy()
    expect(screen.getByText(/Available ad-set metrics only/)).toBeTruthy()
    expect(screen.getByText('UNKNOWN: 0 (percentage unavailable)')).toBeTruthy()
  })
})

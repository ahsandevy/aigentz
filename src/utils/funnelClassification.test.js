import { describe, expect, it } from 'vitest'
import { funnelStageLabel, funnelClassificationHint, optimizationOutcomeLabel, usesEngagementTargets } from './funnelClassification'

describe('audience relationship display', () => {
  it('keeps conversion optimization separate from prospecting', () => {
    const item = { funnel_stage: 'TOFU', optimization_goal: 'OFFSITE_CONVERSIONS' }
    expect(funnelStageLabel(item.funnel_stage)).toBe('TOFU · Prospecting')
    expect(optimizationOutcomeLabel(item)).toBe('OFFSITE_CONVERSIONS')
    expect(usesEngagementTargets(item)).toBe(false)
    expect(funnelStageLabel(item.funnel_stage)).not.toMatch(/awareness/i)
  })
  it('labels unknown, absent, mixed, and legacy mixed evidence defensively', () => {
    for (const stage of [undefined, null, 'UNKNOWN', 'invalid']) {
      expect(funnelStageLabel(stage)).toContain('Evidence unavailable')
    }
    expect(funnelStageLabel('MIXED')).toBe('Classification unavailable · Legacy policy')
    expect(funnelStageLabel('FULL_FUNNEL')).toBe('Classification unavailable · Legacy policy')
    expect(funnelClassificationHint({})).toContain('does not determine')
  })
  it('uses server evidence and explicit engagement basis', () => {
    expect(funnelClassificationHint({ funnel_classification: { reason: 'Missing audience definitions' } })).toBe('Missing audience definitions')
    expect(usesEngagementTargets({ assessment: { targets: { assessment_basis: 'engagement_goal' } } })).toBe(true)
    expect(optimizationOutcomeLabel({ objective: 'OUTCOME_SALES' })).toBe('OUTCOME_SALES')
  })
})

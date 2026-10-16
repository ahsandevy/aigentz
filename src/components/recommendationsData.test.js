import { describe, expect, it } from 'vitest'
import { normalizeAppliedRecommendation, normalizeRecommendation, numericImpact, RECOMMENDATION_SOURCES } from './recommendationsData'

describe('recommendation data mapping', () => {
  it('uses live recommendation fields and the cross-card priority', () => {
    const result = normalizeRecommendation({
      success: true,
      recommendation_id: 42,
      recommendation: {
        recommendation: 'Move budget to the stronger campaign',
        priority: 'low',
        confidence: 87,
        revenue_lift: { value: 5600, range_low: 4000, range_high: 7000 },
        scope: { source: { name: 'Campaign A' }, destination: { name: 'Campaign B' } },
        insights: ['A has lower ROAS'],
      },
    }, RECOMMENDATION_SOURCES[0], { Budget: 'high' })
    expect(result).toMatchObject({ id: '42', priority: 'high', impact: 5600, confidence: 87, affected: 'Campaign A · Campaign B' })
  })

  it('does not invent a numeric lift or show reverted history', () => {
    expect(numericImpact(null)).toBeNull()
    expect(normalizeRecommendation({ success: false }, RECOMMENDATION_SOURCES[0])).toBeNull()
    expect(normalizeAppliedRecommendation({ id: 8, recommendation_type: 'creative_analysis', recommendation: { recommendation: 'Refresh creative', revenue_lift: null } })).toMatchObject({ id: 'applied-8', status: 'applied', impact: null })
  })
})

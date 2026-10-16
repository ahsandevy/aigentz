// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { approveDemoRecommendation, getDemoApplied, getDemoRecommendation, getDemoSpendTrend, getDemoUser, loginDemo, logoutDemo, simulateDemoRecommendation } from './demoMode.js'

afterEach(() => localStorage.clear())

describe('standalone demo state', () => {
  it('keeps a local session and scopes approvals to the signed-in user', () => {
    loginDemo('one@example.com')
    expect(getDemoUser().name).toBe('One')
    expect(getDemoRecommendation('budget_reallocation').recommendation.status).toBe('pending')
    expect(simulateDemoRecommendation('budget-1').preview.changes).toHaveLength(1)
    expect(approveDemoRecommendation('budget-1').success).toBe(true)
    expect(getDemoApplied().data).toHaveLength(1)
    logoutDemo()
    loginDemo('two@example.com')
    expect(getDemoApplied().data).toHaveLength(0)
    expect(getDemoRecommendation('budget_reallocation').recommendation.status).toBe('pending')
  })

  it('provides a complete local spend series', () => {
    const trend = getDemoSpendTrend().data
    expect(trend).toHaveLength(30)
    expect(trend[0].date).toBe('2025-09-15')
    expect(trend.at(-1).date).toBe('2025-10-14')
  })
})

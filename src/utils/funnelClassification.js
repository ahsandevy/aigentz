const labels = {
  TOFU: 'TOFU · Prospecting',
  MOFU: 'MOFU · Warm audience',
  BOFU: 'BOFU · High intent',
  MIXED: 'Classification unavailable · Legacy policy',
  FULL_FUNNEL: 'Classification unavailable · Legacy policy',
  UNKNOWN: 'Classification unavailable · Evidence unavailable',
}

export const funnelStageLabel = (stage) => labels[stage] ?? labels.UNKNOWN

export const funnelClassificationHint = (item) => {
  const evidence = item?.funnel_classification
  return item?.funnel_context?.classification_reason ?? evidence?.reason ?? 'Audience configuration evidence is unavailable. The optimization goal does not determine audience stage.'
}

export const audienceContext = (item) => {
  const context = item?.funnel_context ?? {}
  const evidence = item?.funnel_classification ?? {}
  return {
    audienceStage: context.audience_stage ?? item?.funnel_stage ?? 'UNKNOWN',
    objective: context.campaign_objective ?? item?.campaign_objective ?? item?.objective ?? 'Not available',
    optimization: context.optimization_goal ?? (context.optimization_goals?.length ? context.optimization_goals.join(', ') : null) ?? item?.optimization_goal ?? 'Not available',
    event: context.optimization_event ?? (context.optimization_events?.length ? context.optimization_events.join(', ') : null) ?? 'Not available',
    expansion: context.expansion_status ?? evidence.expansion_status ?? 'unknown',
    customerRelationship: context.customer_relationship ?? evidence.customer_relationship ?? 'unresolved',
    lifecycle: context.lifecycle_intent ?? evidence.lifecycle_intent ?? 'UNKNOWN',
    reason: funnelClassificationHint(item),
  }
}

export const campaignStageSpend = (item) => {
  const distribution = item?.stage_spend_distribution
  if (!distribution || typeof distribution !== 'object') return []
  return ['TOFU', 'MOFU', 'BOFU', 'UNKNOWN'].flatMap((stage) => {
    const value = distribution[stage]
    if (!value || !Number.isFinite(value.spend)) return []
    return [{ stage, spend: value.spend, percentage: Number.isFinite(value.spend_percentage) ? value.spend_percentage : null }]
  })
}

export const stageSpendBasisLabel = (item) => {
  if (item?.spend_distribution_basis === 'adset_ledger_with_campaign_reconciliation') {
    return 'Ad-set ledger reconciled to campaign spend; unresolved differences remain UNKNOWN.'
  }
  if (item?.spend_distribution_basis === 'available_adset_metrics') {
    return 'Available ad-set metrics only; campaign spend reconciliation is unavailable.'
  }
  return 'Spend coverage is not available.'
}

export const optimizationOutcomeLabel = (item) =>
  item?.optimization_goal || item?.objective || item?.campaign_objective || 'Not available'

export const usesEngagementTargets = (item) =>
  item?.assessment?.targets?.assessment_basis === 'engagement_goal'

import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import RecommendationCard from './RecommendationCard'
import RecommendationPreviewModal from './RecommendationPreviewModal'
import BudgetRecommendationModal from './BudgetRecommendationModal'
import CreativeAnalysisRecommendationModal from './CreativeAnalysisRecommendationModal'
import PlacementOptimizationRecommendationModal from './PlacementOptimizationRecommendationModal'
import AudienceOptimizationRecommendationModal from './AudienceOptimizationRecommendationModal'
import BiddingStrategyOptimizationRecommendationModal from './BiddingStrategyOptimizationRecommendationModal'
import DaypartingOptimizationRecommendationModal from './DaypartingOptimizationRecommendationModal'
import { useBudgetRecommendation } from '../hooks/useBudgetRecommendation'
import { useCreativeAnalysisRecommendation } from '../hooks/useCreativeAnalysisRecommendation'
import { usePlacementOptimizationRecommendation } from '../hooks/usePlacementOptimizationRecommendation'
import { useAudienceOptimizationRecommendation } from '../hooks/useAudienceOptimizationRecommendation'
import { useBiddingStrategyOptimizationRecommendation } from '../hooks/useBiddingStrategyOptimizationRecommendation'
import { useDaypartingOptimizationRecommendation } from '../hooks/useDaypartingOptimizationRecommendation'
import { useAllRecommendationsPriorities } from '../hooks/useAllRecommendationsPriorities'
import { useAppliedRecommendations } from '../hooks/useAppliedRecommendations'
import { analyticsAPI } from '../services/api'
import { useModal } from '../context/ModalContext'

function AIRecommendations() {
  const { showAlert, showConfirm, showSuccess, showError } = useModal()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch: refetchBudget } = useBudgetRecommendation(7)
  const { data: creativeData, isLoading: creativeIsLoading, error: creativeError, refetch: refetchCreative } = useCreativeAnalysisRecommendation(7)
  const { data: placementData, isLoading: placementIsLoading, error: placementError, refetch: refetchPlacement } = usePlacementOptimizationRecommendation(7)
  const { data: audienceData, isLoading: audienceIsLoading, error: audienceError, refetch: refetchAudience } = useAudienceOptimizationRecommendation(7)
  const { data: biddingData, isLoading: biddingIsLoading, error: biddingError, refetch: refetchBidding } = useBiddingStrategyOptimizationRecommendation(7)
  const { data: daypartingData, isLoading: daypartingIsLoading, error: daypartingError, refetch: refetchDayparting } = useDaypartingOptimizationRecommendation(7)

  // Fetch priorities from the all recommendations endpoint using React Query
  const { data: priorities = {}, isLoading: prioritiesLoading, refetch: refetchPriorities } = useAllRecommendationsPriorities(7)

  // Fetch applied recommendations using React Query
  const { data: appliedRecommendations = [], isLoading: appliedLoading, refetch: refetchAppliedRecommendations } = useAppliedRecommendations(50)
  const [selectedBudgetRecommendation, setSelectedBudgetRecommendation] = useState(null)
  const [selectedCreativeRecommendation, setSelectedCreativeRecommendation] = useState(null)
  const [selectedPlacementRecommendation, setSelectedPlacementRecommendation] = useState(null)
  const [selectedAudienceRecommendation, setSelectedAudienceRecommendation] = useState(null)
  const [selectedBiddingRecommendation, setSelectedBiddingRecommendation] = useState(null)
  const [selectedDaypartingRecommendation, setSelectedDaypartingRecommendation] = useState(null)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isCreativeModalOpen, setIsCreativeModalOpen] = useState(false)
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false)
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false)
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false)
  const [isDaypartingModalOpen, setIsDaypartingModalOpen] = useState(false)

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [previewRecommendation, setPreviewRecommendation] = useState(null)

  // Loading states for approve/simulate
  const [approvingIds, setApprovingIds] = useState(new Set())
  const [simulatingIds, setSimulatingIds] = useState(new Set())

  // Track which categories are refreshing after approval
  const [refreshingCategories, setRefreshingCategories] = useState(new Set())

  // Force refresh trigger to ensure component updates
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Helper function to get priority from API or fallback to individual response
  const getPriority = (cardName, fallbackPriority, category = null) => {
    // If this category is refreshing after approval, return null to show loading
    if (category && refreshingCategories.has(category)) {
      return null
    }

    const apiPriority = priorities[cardName]
    if (apiPriority) {
      return apiPriority.charAt(0).toUpperCase() + apiPriority.slice(1)
    }
    // Fallback to individual response priority
    if (fallbackPriority) {
      return fallbackPriority.charAt(0).toUpperCase() + fallbackPriority.slice(1)
    }
    // Return null if still loading, so we can show loading icon
    if (prioritiesLoading) {
      return null
    }
    // Only return default if not loading and no priority found
    return 'High'
  }

  // Map API response to RecommendationCard format
  const budgetRecommendation = useMemo(() => {
    if (!data?.success || !data?.recommendation) {
      return null
    }

    const rec = data.recommendation

    // Get priority from API (card_name: "Budget")
    const priority = getPriority('Budget', rec.priority, 'Budget')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift
    const revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
    const revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`

    // Build scope array
    const scope = []
    if (rec.scope.source) {
      const sourceType = rec.scope.type === 'adset' ? 'Ad Set' : 'Campaign'
      const changePct = Math.abs(rec.scope.source.recommended_change_pct)
      const action = rec.scope.source.recommended_change_pct < 0 ? 'Reduce' : 'Increase'
      scope.push(`${sourceType}: ${rec.scope.source.name} (${action} ${changePct}%)`)
    }
    if (rec.scope.destination) {
      const destType = rec.scope.type === 'adset' ? 'Ad Set' : 'Campaign'
      const changePct = Math.abs(rec.scope.destination.recommended_change_pct)
      const action = rec.scope.destination.recommended_change_pct < 0 ? 'Reduce' : 'Increase'
      scope.push(`${destType}: ${rec.scope.destination.name} (${action} ${changePct}%)`)
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics
    const metrics = [
      { label: 'Revenue Lift', value: rec.metrics.revenue_lift, highlight: true },
      { label: 'CPA Change', value: rec.metrics.cpa_change, highlight: false },
      { label: 'ROAS', value: rec.metrics.roas_change, highlight: false }
    ]

    return {
      priority,
      category: 'Budget',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: 'Performance Team',
      nextCheck: '48 hours',
      recommendationId: rec.id || data.recommendation_id,
      status: rec.status || 'pending',
      rawData: data
    }
  }, [data, priorities, prioritiesLoading, refreshTrigger])

  // Debug: Log recommendation IDs (remove in production)
  useEffect(() => {
    if (budgetRecommendation) {
      console.log('Budget recommendation ID:', budgetRecommendation.recommendationId)
    }
  }, [budgetRecommendation])

  // Map Creative Analysis API response to RecommendationCard format
  const creativeAnalysisRecommendation = useMemo(() => {
    if (!creativeData?.success || !creativeData?.recommendation) {
      return null
    }

    const rec = creativeData.recommendation

    // Get priority from API (card_name: "Creative")
    const priority = getPriority('Creative', rec.priority, 'Creative')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift
    const revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
    const revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`

    // Build scope array from ad scope
    const scope = []
    if (rec.scope?.ad) {
      const ad = rec.scope.ad
      if (ad.campaign_name) {
        scope.push(`Campaign: ${ad.campaign_name}`)
      }
      if (ad.adset_name) {
        scope.push(`Ad Set: ${ad.adset_name}`)
      }
      if (ad.name) {
        scope.push(`Ad: ${ad.name}`)
      }
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics - use metrics from API (convert PKR to AED if needed, or use as-is)
    const revenueLiftMetric = rec.metrics?.revenue_lift
      ? rec.metrics.revenue_lift.replace('PKR', 'AED')
      : `+${rec.revenue_lift.value.toLocaleString()} AED revenue lift`

    const metrics = [
      { label: 'Revenue Lift', value: revenueLiftMetric, highlight: true },
      { label: 'CTR Improvement', value: rec.metrics?.ctr_improvement || 'N/A', highlight: false },
      { label: 'Engagement Lift', value: rec.metrics?.engagement_lift || 'N/A', highlight: false }
    ]

    return {
      priority,
      category: rec.category || 'Creative',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: rec.owner || 'Creative Team',
      nextCheck: rec.next_check_days ? `${rec.next_check_days} days` : '7 days',
      recommendationId: rec.id || creativeData.recommendation_id,
      status: rec.status || 'pending',
      rawData: creativeData
    }
  }, [creativeData, priorities, prioritiesLoading, refreshTrigger])

  // Map Placement Optimization API response to RecommendationCard format
  const placementOptimizationRecommendation = useMemo(() => {
    if (!placementData?.success || !placementData?.recommendation) {
      return null
    }

    const rec = placementData.recommendation

    // Get priority from API (card_name: "Placement")
    const priority = getPriority('Placement', rec.priority, 'Placement')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift
    const revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
    const revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`

    // Build scope array from source and destination
    const scope = []
    if (rec.scope?.source) {
      const source = rec.scope.source
      const changePct = Math.abs(source.recommended_change_pct)
      const action = source.recommended_change_pct < 0 ? 'Reduce' : 'Increase'
      const typeLabel = source.type === 'platform' ? 'Platform' : 'Placement'
      scope.push(`${typeLabel}: ${source.name} (${action} ${changePct}%)`)
    }
    if (rec.scope?.destination) {
      const dest = rec.scope.destination
      const changePct = Math.abs(dest.recommended_change_pct)
      const action = dest.recommended_change_pct > 0 ? 'Increase' : 'Reduce'
      const typeLabel = dest.type === 'platform' ? 'Platform' : 'Placement'
      scope.push(`${typeLabel}: ${dest.name} (${action} ${changePct}%)`)
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics - use metrics from API
    const metrics = [
      { label: 'Revenue Lift', value: rec.metrics?.revenue_lift || `+${rec.revenue_lift.value.toLocaleString()} AED revenue lift`, highlight: true },
      { label: 'CPA Change', value: rec.metrics?.cpa_change || 'N/A', highlight: false },
      { label: 'ROAS', value: rec.metrics?.roas_change || 'N/A', highlight: false }
    ]

    return {
      priority,
      category: rec.category || 'Placement',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: rec.owner || 'Media Planning Team',
      nextCheck: rec.next_check_days ? `${rec.next_check_days} days` : '14 days',
      recommendationId: rec.id || placementData.recommendation_id,
      status: rec.status || 'pending',
      rawData: placementData
    }
  }, [placementData, priorities, prioritiesLoading, refreshTrigger])

  // Map Audience Optimization API response to RecommendationCard format
  const audienceOptimizationRecommendation = useMemo(() => {
    if (!audienceData?.success || !audienceData?.recommendation) {
      return null
    }

    const rec = audienceData.recommendation

    // Get priority from API (card_name: "Audience")
    const priority = getPriority('Audience', rec.priority, 'Audience')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift - check if revenue_lift exists (object with value, range_low, range_high)
    let revenueLift = 'Operational Optimization'
    let revenueRange = 'Focus on saturation, frequency & engagement'

    if (rec.revenue_lift) {
      if (typeof rec.revenue_lift === 'object' && rec.revenue_lift.value !== undefined) {
        // Revenue lift is an object with value, range_low, range_high
        revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
        if (rec.revenue_lift.range_low !== undefined && rec.revenue_lift.range_high !== undefined) {
          revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`
        }
      } else if (typeof rec.revenue_lift === 'number') {
        // Revenue lift is a simple number
        revenueLift = `+${rec.revenue_lift.toLocaleString()} AED Revenue Lift`
      }
    }

    // Build scope array from audience
    const scope = []
    if (rec.scope?.audience) {
      const audience = rec.scope.audience
      scope.push(`Audience: ${audience.name}`)
      if (audience.subtype) {
        scope.push(`Type: ${audience.subtype}`)
      }
      if (audience.recommended_changes?.action_description) {
        scope.push(`Action: ${audience.recommended_changes.action_description}`)
      }
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics - include revenue lift if available, otherwise use operational metrics
    const metrics = []
    if (rec.metrics?.revenue_lift) {
      // Use formatted revenue lift from metrics if available
      metrics.push({ label: 'Revenue Lift', value: rec.metrics.revenue_lift, highlight: true })
      // Add operational metrics as secondary
      metrics.push(
        { label: 'Saturation Change', value: rec.metrics?.saturation_change || 'N/A', highlight: false },
        { label: 'Frequency Change', value: rec.metrics?.frequency_change || 'N/A', highlight: false }
      )
    } else if (rec.revenue_lift) {
      // Format revenue lift from revenue_lift object/number
      const revenueValue = typeof rec.revenue_lift === 'object' ? rec.revenue_lift.value : rec.revenue_lift
      metrics.push({ label: 'Revenue Lift', value: `+${revenueValue.toLocaleString()} AED revenue lift`, highlight: true })
      // Add operational metrics as secondary
      metrics.push(
        { label: 'Saturation Change', value: rec.metrics?.saturation_change || 'N/A', highlight: false },
        { label: 'Frequency Change', value: rec.metrics?.frequency_change || 'N/A', highlight: false }
      )
    } else {
      // No revenue lift, use operational metrics
      metrics.push(
        { label: 'Saturation Change', value: rec.metrics?.saturation_change || 'N/A', highlight: true },
        { label: 'Frequency Change', value: rec.metrics?.frequency_change || 'N/A', highlight: false },
        { label: 'Engagement Improvement', value: rec.metrics?.engagement_improvement || 'N/A', highlight: false }
      )
    }

    return {
      priority,
      category: rec.category || 'Audience',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: rec.owner || 'Media Planning Team',
      nextCheck: rec.next_check_days ? `${rec.next_check_days} days` : '14 days',
      recommendationId: rec.id || audienceData.recommendation_id,
      status: rec.status || 'pending',
      rawData: audienceData
    }
  }, [audienceData, priorities, prioritiesLoading, refreshTrigger])

  // Map Bidding Strategy Optimization API response to RecommendationCard format
  const biddingStrategyOptimizationRecommendation = useMemo(() => {
    if (!biddingData?.success || !biddingData?.recommendation) {
      return null
    }

    const rec = biddingData.recommendation

    // Get priority from API (card_name: "Bidding Strategy")
    const priority = getPriority('Bidding Strategy', rec.priority, 'Bidding')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift
    const revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
    const revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`

    // Build scope array from campaign/adset (only one will be populated based on scope.type)
    const scope = []
    if (rec.scope?.type === 'campaign' && rec.scope?.campaign) {
      scope.push(`Campaign: ${rec.scope.campaign.name || rec.scope.campaign.id}`)
    } else if (rec.scope?.type === 'adset' && rec.scope?.adset) {
      scope.push(`Ad Set: ${rec.scope.adset.name || rec.scope.adset.id}`)
      if (rec.scope.adset.campaign_name) {
        scope.push(`Campaign: ${rec.scope.adset.campaign_name}`)
      }
    }

    // Add current and recommended bid strategy info
    if (rec.scope?.current_bid_strategy) {
      const currentStrategy = rec.scope.current_bid_strategy.replace(/_/g, ' ')
      if (rec.recommendation_type === 'strategy_change' && rec.scope?.recommended_bid_strategy) {
        const recommendedStrategy = rec.scope.recommended_bid_strategy.replace(/_/g, ' ')
        scope.push(`Strategy: ${currentStrategy} → ${recommendedStrategy}`)
      } else {
        scope.push(`Current Strategy: ${currentStrategy}`)
      }
    }

    // Add config information if available
    if (rec.scope?.current_config?.type && rec.scope?.current_config?.value !== null && rec.scope?.current_config?.value !== undefined) {
      const configType = rec.scope.current_config.type.replace(/_/g, ' ')
      scope.push(`Current ${configType}: $${rec.scope.current_config.value}`)
    }
    if (rec.scope?.recommended_config?.type && rec.scope?.recommended_config?.value !== null && rec.scope?.recommended_config?.value !== undefined) {
      const configType = rec.scope.recommended_config.type.replace(/_/g, ' ')
      scope.push(`Recommended ${configType}: $${rec.scope.recommended_config.value}`)
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics - include revenue_lift and cost efficiency metrics from API
    const metrics = [
      { label: 'Revenue Lift', value: rec.metrics?.revenue_lift || `+${rec.revenue_lift.value.toLocaleString()} AED revenue lift`, highlight: true },
      { label: 'CPM Improvement', value: rec.metrics?.cpm_improvement || 'N/A', highlight: false },
      { label: 'Budget Utilization', value: rec.metrics?.budget_utilization_improvement || 'N/A', highlight: false }
    ]

    // Add cost efficiency gain if available
    if (rec.metrics?.cost_efficiency_gain) {
      metrics.push({ label: 'Cost Efficiency', value: rec.metrics.cost_efficiency_gain, highlight: false })
    }

    return {
      priority,
      category: rec.category || 'Bidding',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: rec.owner || 'Bidding Specialists',
      nextCheck: rec.next_check_days ? `${rec.next_check_days} days` : '7 days',
      recommendationId: rec.id || biddingData.recommendation_id,
      status: rec.status || 'pending',
      rawData: biddingData
    }
  }, [biddingData, priorities, prioritiesLoading, refreshTrigger])

  // Map Dayparting Optimization API response to RecommendationCard format
  const daypartingOptimizationRecommendation = useMemo(() => {
    if (!daypartingData?.success || !daypartingData?.recommendation) {
      return null
    }

    const rec = daypartingData.recommendation

    // Get priority from API (card_name: "Dayparting")
    const priority = getPriority('Dayparting', rec.priority, 'Dayparting')

    // Format confidence
    const confidence = `${rec.confidence}% Confidence`

    // Format risk level
    const risk = rec.risk_level ? rec.risk_level.charAt(0).toUpperCase() + rec.risk_level.slice(1) + ' Risk' : 'Low Risk'

    // Format revenue lift
    const revenueLift = `+${rec.revenue_lift.value.toLocaleString()} AED Revenue Lift`
    const revenueRange = `+${rec.revenue_lift.range_low.toLocaleString()} to +${rec.revenue_lift.range_high.toLocaleString()} AED`

    // Build scope array from campaign/adset
    const scope = []
    if (rec.scope?.type === 'campaign' && rec.scope?.campaign?.name) {
      scope.push(`Campaign: ${rec.scope.campaign.name}`)
    } else if (rec.scope?.type === 'adset' && rec.scope?.adset?.name) {
      scope.push(`Ad Set: ${rec.scope.adset.name}`)
      if (rec.scope.adset.campaign_name) {
        scope.push(`Campaign: ${rec.scope.adset.campaign_name}`)
      }
    }
    if (rec.scope?.recommended_dayparting) {
      const dayparting = rec.scope.recommended_dayparting
      if (dayparting.peak_hours_description && dayparting.low_hours_description) {
        scope.push(`Peak: ${dayparting.peak_hours_description} (+${dayparting.peak_budget_increase_pct}%)`)
        scope.push(`Low: ${dayparting.low_hours_description} (${dayparting.low_budget_decrease_pct}%)`)
      }
    }

    // Use insights from API
    const insights = rec.insights || []

    // Format metrics - include revenue_lift and other metrics from API
    const metrics = [
      { label: 'Revenue Lift', value: rec.metrics?.revenue_lift || `+${rec.revenue_lift.value.toLocaleString()} AED revenue lift`, highlight: true },
      { label: 'CPA Change', value: rec.metrics?.cpa_change || 'N/A', highlight: false },
      { label: 'ROAS', value: rec.metrics?.roas_change || 'N/A', highlight: false }
    ]

    return {
      priority,
      category: rec.category || 'Dayparting',
      confidence,
      risk,
      title: rec.recommendation,
      revenueLift,
      revenueRange,
      scope,
      insights,
      metrics,
      owner: rec.owner || 'Automation Team',
      nextCheck: rec.next_check_days ? `${rec.next_check_days} days` : '14 days',
      recommendationId: rec.id || daypartingData.recommendation_id,
      status: rec.status || 'pending',
      rawData: daypartingData
    }
  }, [daypartingData, priorities, prioritiesLoading, refreshTrigger])

  // Static recommendations (excluding API-driven ones)
  const staticRecommendations = []

  // Combine budget recommendation, creative analysis, placement optimization, and static recommendations
  const allRecommendations = useMemo(() => {
    const recommendations = []

    // Add budget recommendation if available
    if (budgetRecommendation) {
      recommendations.push(budgetRecommendation)
    }

    // Add creative analysis recommendation if available (second position)
    if (creativeAnalysisRecommendation) {
      recommendations.push(creativeAnalysisRecommendation)
    }

    // Add placement optimization recommendation if available (third position)
    if (placementOptimizationRecommendation) {
      recommendations.push(placementOptimizationRecommendation)
    }

    // Add audience optimization recommendation if available (fourth position)
    if (audienceOptimizationRecommendation) {
      recommendations.push(audienceOptimizationRecommendation)
    }

    // Add bidding strategy optimization recommendation if available (fifth position)
    if (biddingStrategyOptimizationRecommendation) {
      recommendations.push(biddingStrategyOptimizationRecommendation)
    }

    // Add dayparting optimization recommendation if available (sixth position)
    if (daypartingOptimizationRecommendation) {
      recommendations.push(daypartingOptimizationRecommendation)
    }

    // Add static recommendations
    recommendations.push(...staticRecommendations)

    return recommendations
  }, [budgetRecommendation, creativeAnalysisRecommendation, placementOptimizationRecommendation, audienceOptimizationRecommendation, biddingStrategyOptimizationRecommendation, daypartingOptimizationRecommendation, refreshTrigger])

  // Handle "More Details" click
  const handleMoreDetails = (index) => {
    // Calculate which recommendation is at this index based on what exists
    let expectedIndex = 0

    // Index 0: Budget (if exists), otherwise Creative, otherwise Placement, otherwise Audience, otherwise Bidding, otherwise Dayparting
    if (index === expectedIndex) {
      if (budgetRecommendation && data?.success && data?.recommendation) {
        setSelectedBudgetRecommendation(data)
        setIsBudgetModalOpen(true)
        return
      } else if (creativeAnalysisRecommendation && creativeData?.success && creativeData?.recommendation) {
        setSelectedCreativeRecommendation(creativeData)
        setIsCreativeModalOpen(true)
        return
      } else if (placementOptimizationRecommendation && placementData?.success && placementData?.recommendation) {
        setSelectedPlacementRecommendation(placementData)
        setIsPlacementModalOpen(true)
        return
      } else if (audienceOptimizationRecommendation && audienceData?.success && audienceData?.recommendation) {
        setSelectedAudienceRecommendation(audienceData)
        setIsAudienceModalOpen(true)
        return
      } else if (biddingStrategyOptimizationRecommendation && biddingData?.success && biddingData?.recommendation) {
        setSelectedBiddingRecommendation(biddingData)
        setIsBiddingModalOpen(true)
        return
      } else if (daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
        setSelectedDaypartingRecommendation(daypartingData)
        setIsDaypartingModalOpen(true)
        return
      }
    }

    // Index 1: Creative (if budget exists), otherwise Placement, otherwise Audience, otherwise Bidding, otherwise Dayparting
    if (budgetRecommendation) expectedIndex++
    if (index === expectedIndex) {
      if (creativeAnalysisRecommendation && creativeData?.success && creativeData?.recommendation) {
        setSelectedCreativeRecommendation(creativeData)
        setIsCreativeModalOpen(true)
        return
      } else if (placementOptimizationRecommendation && placementData?.success && placementData?.recommendation) {
        setSelectedPlacementRecommendation(placementData)
        setIsPlacementModalOpen(true)
        return
      } else if (audienceOptimizationRecommendation && audienceData?.success && audienceData?.recommendation) {
        setSelectedAudienceRecommendation(audienceData)
        setIsAudienceModalOpen(true)
        return
      } else if (biddingStrategyOptimizationRecommendation && biddingData?.success && biddingData?.recommendation) {
        setSelectedBiddingRecommendation(biddingData)
        setIsBiddingModalOpen(true)
        return
      } else if (daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
        setSelectedDaypartingRecommendation(daypartingData)
        setIsDaypartingModalOpen(true)
        return
      }
    }

    // Index 2: Placement (if budget and creative exist), otherwise Audience, otherwise Bidding, otherwise Dayparting
    if (creativeAnalysisRecommendation) expectedIndex++
    if (index === expectedIndex) {
      if (placementOptimizationRecommendation && placementData?.success && placementData?.recommendation) {
        setSelectedPlacementRecommendation(placementData)
        setIsPlacementModalOpen(true)
        return
      } else if (audienceOptimizationRecommendation && audienceData?.success && audienceData?.recommendation) {
        setSelectedAudienceRecommendation(audienceData)
        setIsAudienceModalOpen(true)
        return
      } else if (biddingStrategyOptimizationRecommendation && biddingData?.success && biddingData?.recommendation) {
        setSelectedBiddingRecommendation(biddingData)
        setIsBiddingModalOpen(true)
        return
      } else if (daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
        setSelectedDaypartingRecommendation(daypartingData)
        setIsDaypartingModalOpen(true)
        return
      }
    }

    // Index 3: Audience (if budget, creative, and placement exist), otherwise Bidding, otherwise Dayparting
    if (placementOptimizationRecommendation) expectedIndex++
    if (index === expectedIndex) {
      if (audienceOptimizationRecommendation && audienceData?.success && audienceData?.recommendation) {
        setSelectedAudienceRecommendation(audienceData)
        setIsAudienceModalOpen(true)
        return
      } else if (biddingStrategyOptimizationRecommendation && biddingData?.success && biddingData?.recommendation) {
        setSelectedBiddingRecommendation(biddingData)
        setIsBiddingModalOpen(true)
        return
      } else if (daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
        setSelectedDaypartingRecommendation(daypartingData)
        setIsDaypartingModalOpen(true)
        return
      }
    }

    // Index 4: Bidding (if budget, creative, placement, and audience exist), otherwise Dayparting
    if (audienceOptimizationRecommendation) expectedIndex++
    if (index === expectedIndex) {
      if (biddingStrategyOptimizationRecommendation && biddingData?.success && biddingData?.recommendation) {
        setSelectedBiddingRecommendation(biddingData)
        setIsBiddingModalOpen(true)
        return
      } else if (daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
        setSelectedDaypartingRecommendation(daypartingData)
        setIsDaypartingModalOpen(true)
        return
      }
    }

    // Index 5: Dayparting (if budget, creative, placement, audience, and bidding exist)
    if (biddingStrategyOptimizationRecommendation) expectedIndex++
    if (index === expectedIndex && daypartingOptimizationRecommendation && daypartingData?.success && daypartingData?.recommendation) {
      setSelectedDaypartingRecommendation(daypartingData)
      setIsDaypartingModalOpen(true)
    }
  }

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false)
  }

  const handleCloseCreativeModal = () => {
    setIsCreativeModalOpen(false)
  }

  const handleClosePlacementModal = () => {
    setIsPlacementModalOpen(false)
  }

  const handleCloseAudienceModal = () => {
    setIsAudienceModalOpen(false)
  }

  const handleCloseBiddingModal = () => {
    setIsBiddingModalOpen(false)
  }

  const handleCloseDaypartingModal = () => {
    setIsDaypartingModalOpen(false)
  }

  // Handle simulate
  const handleSimulate = async (recommendationId) => {
    if (!recommendationId) {
      console.warn('Cannot simulate: Missing recommendation ID')
      showAlert('Missing ID', 'This recommendation cannot be simulated. Missing recommendation ID.')
      return
    }

    try {
      setSimulatingIds(prev => new Set(prev).add(recommendationId))
      const result = await analyticsAPI.simulateRecommendation(recommendationId)

      if (result?.success && result?.preview) {
        // Find the recommendation text
        const rec = allRecommendations.find(r => r.recommendationId === recommendationId)
        setPreviewRecommendation(rec?.title || '')
        setPreviewData(result.preview)
        setPreviewModalOpen(true)
      } else {
        showError('Simulation Failed', 'Simulation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error simulating recommendation:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to simulate recommendation. Please try again.'
      showError('Simulation Error', errorMessage)
    } finally {
      setSimulatingIds(prev => {
        const next = new Set(prev)
        next.delete(recommendationId)
        return next
      })
    }
  }

  // Handle approve
  const handleApprove = async (recommendationId) => {
    if (!recommendationId) {
      console.warn('Cannot approve: Missing recommendation ID')
      showAlert('Missing ID', 'This recommendation cannot be approved. Missing recommendation ID.')
      return
    }

    const confirmed = await showConfirm(
      'Confirm Approval',
      'Are you sure you want to approve this recommendation? Changes will be applied immediately to your Meta account.'
    )
    if (!confirmed) {
      return
    }

    // Find the category of the recommendation being approved
    const approvedRec = allRecommendations.find(r => r.recommendationId === recommendationId)
    const category = approvedRec?.category || null

    // Set category to refreshing state immediately to show loading icon
    if (category) {
      setRefreshingCategories(prev => new Set(prev).add(category))
    }

    try {
      setApprovingIds(prev => new Set(prev).add(recommendationId))

      const result = await analyticsAPI.approveRecommendation(recommendationId)

      if (result?.success) {
        // Show success message
        const successMessage = result.message || 'Recommendation approved successfully!'

        // Map recommendation types to their refetch functions and query keys
        const recommendationTypeMap = {
          'budget': { refetch: refetchBudget, queryKey: ['budget-reallocation', 7] },
          'creative': { refetch: refetchCreative, queryKey: ['creative-analysis', 7] },
          'placement': { refetch: refetchPlacement, queryKey: ['placement-optimization', 7] },
          'audience': { refetch: refetchAudience, queryKey: ['audience-optimization', 7] },
          'bidding': { refetch: refetchBidding, queryKey: ['bidding-strategy-optimization', 7] },
          'dayparting': { refetch: refetchDayparting, queryKey: ['dayparting-optimization', 7] },
          'budget_reallocation': { refetch: refetchBudget, queryKey: ['budget-reallocation', 7] },
          'creative_analysis': { refetch: refetchCreative, queryKey: ['creative-analysis', 7] },
          'placement_optimization': { refetch: refetchPlacement, queryKey: ['placement-optimization', 7] },
          'audience_optimization': { refetch: refetchAudience, queryKey: ['audience-optimization', 7] },
          'bidding_strategy_optimization': { refetch: refetchBidding, queryKey: ['bidding-strategy-optimization', 7] },
          'dayparting_optimization': { refetch: refetchDayparting, queryKey: ['dayparting-optimization', 7] }
        }

        // OPTIMIZED: Only refetch what's necessary based on backend response
        if (result.new_recommendation_generated && result.new_recommendation_type) {
          // New recommendation was generated - refetch only specific type + supporting queries
          const regeneratedTypeConfig = recommendationTypeMap[result.new_recommendation_type.toLowerCase()]

          if (regeneratedTypeConfig) {
            console.log('New recommendation generated - invalidating specific type:', {
              type: result.new_recommendation_type,
              id: result.new_recommendation_id,
              queryKey: regeneratedTypeConfig.queryKey
            })

            // Invalidate necessary queries
            // Use Promise.all for concurrent invalidation
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: regeneratedTypeConfig.queryKey }),
              queryClient.invalidateQueries({ queryKey: ['all-recommendations-priorities', 7] }),
              queryClient.invalidateQueries({ queryKey: ['applied-recommendations', 50] }),
              queryClient.invalidateQueries({ queryKey: ['weekly-summary', 7] })
            ])

            console.log('Invalidation complete - active observers will refetch')

            // Show informative success message
            const typeName = result.new_recommendation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            showSuccess(
              'Recommendation Approved',
              `${successMessage}\n\nA new ${typeName} recommendation (ID: ${result.new_recommendation_id}) has been generated and will appear shortly.`
            )
          } else {
            // Unknown type - fallback to invalidating all (safety net)
            console.warn('Unknown recommendation type - falling back to full invalidation:', result.new_recommendation_type)

            const queriesToInvalidate = [
              ['budget-reallocation', 7],
              ['creative-analysis', 7],
              ['placement-optimization', 7],
              ['audience-optimization', 7],
              ['bidding-strategy-optimization', 7],
              ['dayparting-optimization', 7],
              ['all-recommendations-priorities', 7],
              ['applied-recommendations', 50],
              ['weekly-summary', 7]
            ]

            await Promise.all(queriesToInvalidate.map(key => queryClient.invalidateQueries({ queryKey: key })))

            showSuccess('Recommendation Approved', `${successMessage}\n\nA new recommendation has been generated and will appear shortly.`)
          }
        } else {
          // No new recommendation generated - refetch approved type to update status + applied list
          console.log('No new recommendation generated - invalidating approved type and applied recommendations')

          // Find which type was approved based on the category
          const approvedTypeConfig = category ? recommendationTypeMap[category.toLowerCase()] : null

          const queriesToInvalidate = [['applied-recommendations', 50], ['weekly-summary', 7]]
          if (approvedTypeConfig) {
            queriesToInvalidate.push(approvedTypeConfig.queryKey)
          }

          await Promise.all(queriesToInvalidate.map(key => queryClient.invalidateQueries({ queryKey: key })))

          console.log('Invalidation complete - active observers will refetch')

          showSuccess('Recommendation Approved', successMessage)
        }

        // Force component re-render by updating trigger
        setRefreshTrigger(prev => prev + 1)

        // Clear refreshing state
        if (category) {
          setRefreshingCategories(prev => {
            const next = new Set(prev)
            next.delete(category)
            return next
          })
        }
      } else {
        showError('Approval Failed', 'Approval failed. Please try again.')
        // Clear refreshing state on failure
        if (category) {
          setRefreshingCategories(prev => {
            const next = new Set(prev)
            next.delete(category)
            return next
          })
        }
      }
    } catch (error) {
      console.error('Error approving recommendation:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to approve recommendation. Please try again.'
      showError('Approval Error', errorMessage)
      // Clear refreshing state on error
      if (category) {
        setRefreshingCategories(prev => {
          const next = new Set(prev)
          next.delete(category)
          return next
        })
      }
    } finally {
      setApprovingIds(prev => {
        const next = new Set(prev)
        next.delete(recommendationId)
        return next
      })
    }
  }


  // Handle revert
  const handleRevert = async (executionId, recommendationType = null) => {
    if (!executionId) return

    const confirmed = await showConfirm(
      'Confirm Revert',
      'Are you sure you want to revert this recommendation? This will attempt to restore the previous budget settings.'
    )
    if (!confirmed) {
      return
    }

    try {
      const result = await analyticsAPI.revertExecution(executionId)

      if (result?.success) {
        showSuccess('Revert Successful', result.message || 'Recommendation reverted successfully!')

        // Refetch all recommendation types + applied recommendations
        // This ensures new pending recommendations appear immediately after revert
        console.log('Reverting recommendation - invalidating all recommendation types')

        const queriesToInvalidate = [
          ['budget-reallocation', 7],
          ['creative-analysis', 7],
          ['placement-optimization', 7],
          ['audience-optimization', 7],
          ['bidding-strategy-optimization', 7],
          ['dayparting-optimization', 7],
          ['applied-recommendations', 50],
          ['weekly-summary', 7]
        ]

        // Invalidate all queries to force refetch for all active observers
        await Promise.all(queriesToInvalidate.map(key => queryClient.invalidateQueries({ queryKey: key })))

        console.log('Invalidation complete - active observers will refetch')

        // Force component re-render
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error reverting execution:', error)
      showError('Revert Error', error.response?.data?.detail || 'Failed to revert recommendation. Please try again.')
    }
  }


  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#1e4a79]">AI Recommendations</h2>
      </div>

      {/* Recommendations Grid - Render independently as data loads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Recommendation */}
        {isLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (error || (data && !data.success)) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Budget Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {error?.message || data?.error || 'Failed to fetch budget reallocation recommendation. Please try again later.'}
            </p>
          </div>
        ) : budgetRecommendation && (!budgetRecommendation.status || budgetRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Budget') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...budgetRecommendation}
              onMoreDetails={() => {
                if (data?.success && data?.recommendation) {
                  setSelectedBudgetRecommendation(data)
                  setIsBudgetModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(budgetRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(budgetRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Creative Recommendation */}
        {creativeIsLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : creativeError || (creativeData && !creativeData.success) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Creative Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {creativeError?.message || creativeData?.error || 'Failed to fetch creative analysis recommendation.'}
            </p>
          </div>
        ) : creativeAnalysisRecommendation && (!creativeAnalysisRecommendation.status || creativeAnalysisRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Creative') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...creativeAnalysisRecommendation}
              onMoreDetails={() => {
                if (creativeData?.success && creativeData?.recommendation) {
                  setSelectedCreativeRecommendation(creativeData)
                  setIsCreativeModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(creativeAnalysisRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(creativeAnalysisRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Placement Recommendation */}
        {placementIsLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : placementError || (placementData && !placementData.success) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Placement Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {placementError?.message || placementData?.error || 'Failed to fetch placement optimization recommendation.'}
            </p>
          </div>
        ) : placementOptimizationRecommendation && (!placementOptimizationRecommendation.status || placementOptimizationRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Placement') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...placementOptimizationRecommendation}
              onMoreDetails={() => {
                if (placementData?.success && placementData?.recommendation) {
                  setSelectedPlacementRecommendation(placementData)
                  setIsPlacementModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(placementOptimizationRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(placementOptimizationRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Audience Recommendation */}
        {audienceIsLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : audienceError || (audienceData && !audienceData.success) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Audience Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {audienceError?.message || audienceData?.error || 'Failed to fetch audience optimization recommendation.'}
            </p>
          </div>
        ) : audienceOptimizationRecommendation && (!audienceOptimizationRecommendation.status || audienceOptimizationRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Audience') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...audienceOptimizationRecommendation}
              onMoreDetails={() => {
                if (audienceData?.success && audienceData?.recommendation) {
                  setSelectedAudienceRecommendation(audienceData)
                  setIsAudienceModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(audienceOptimizationRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(audienceOptimizationRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Bidding Recommendation */}
        {biddingIsLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : biddingError || (biddingData && !biddingData.success) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Bidding Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {biddingError?.message || biddingData?.error || 'Failed to fetch bidding strategy optimization recommendation.'}
            </p>
          </div>
        ) : biddingStrategyOptimizationRecommendation && (!biddingStrategyOptimizationRecommendation.status || biddingStrategyOptimizationRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Bidding') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...biddingStrategyOptimizationRecommendation}
              onMoreDetails={() => {
                if (biddingData?.success && biddingData?.recommendation) {
                  setSelectedBiddingRecommendation(biddingData)
                  setIsBiddingModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(biddingStrategyOptimizationRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(biddingStrategyOptimizationRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Dayparting Recommendation */}
        {daypartingIsLoading ? (
          <div className="rounded-lg border border-[#e2e8f0] p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : daypartingError || (daypartingData && !daypartingData.success) ? (
          <div className="rounded-lg border border-red-200 p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold">Unable to Load Dayparting Recommendation</h3>
            </div>
            <p className="text-sm text-red-600">
              {daypartingError?.message || daypartingData?.error || 'Failed to fetch dayparting optimization recommendation.'}
            </p>
          </div>
        ) : daypartingOptimizationRecommendation && (!daypartingOptimizationRecommendation.status || daypartingOptimizationRecommendation.status === 'pending') ? (
          <div className="relative">
            {refreshingCategories.has('Dayparting') && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-[#1e4a79] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-semibold text-[#1e4a79]">Loading new recommendation...</p>
                </div>
              </div>
            )}
            <RecommendationCard
              {...daypartingOptimizationRecommendation}
              onMoreDetails={() => {
                if (daypartingData?.success && daypartingData?.recommendation) {
                  setSelectedDaypartingRecommendation(daypartingData)
                  setIsDaypartingModalOpen(true)
                }
              }}
              onApprove={handleApprove}
              onSimulate={handleSimulate}
              isApproving={approvingIds.has(daypartingOptimizationRecommendation.recommendationId)}
              isSimulating={simulatingIds.has(daypartingOptimizationRecommendation.recommendationId)}
            />
          </div>
        ) : null}

        {/* Static Recommendations */}
        {staticRecommendations.map((rec, idx) => (
          <RecommendationCard key={`static-${idx}`} {...rec} />
        ))}

        {/* Show loading skeleton cards for categories that are refreshing */}
        {refreshingCategories.size > 0 && Array.from(refreshingCategories).map(category => {
          // Check if this category already has a recommendation displayed
          const hasRecommendation = allRecommendations.some(
            rec => rec.category === category && (!rec.status || rec.status === 'pending')
          )

          if (hasRecommendation) return null

          // Show loading skeleton card
          return (
            <div key={`loading-${category}`} className="rounded-lg border-l-[6px] border-gray-300 p-6 shadow-sm relative bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] animate-pulse">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
                    <div className="h-5 w-24 bg-gray-300 rounded-full"></div>
                    <div className="h-5 w-32 bg-gray-300 rounded-full"></div>
                    <div className="h-5 w-28 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="h-7 w-32 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>

              {/* Scope Section */}
              <div className="mb-5">
                <div className="h-3 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-3.5 bg-gray-300 shrink-0"></div>
                    <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-3.5 bg-gray-300 shrink-0"></div>
                    <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Insights Section */}
              <div className="mb-6">
                <div className="h-3 w-32 bg-gray-300 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-3.5 bg-gray-300 shrink-0"></div>
                    <div className="h-4 w-full bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-3.5 bg-gray-300 shrink-0"></div>
                    <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="bg-white rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shadow-sm border border-gray-100">
                <div className="flex flex-col">
                  <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                  <div className="h-5 w-24 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-col">
                  <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                  <div className="h-5 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-col">
                  <div className="h-3 w-16 bg-gray-300 rounded mb-2"></div>
                  <div className="h-5 w-20 bg-gray-300 rounded"></div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="h-8 w-20 bg-gray-300 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                  <div className="h-8 w-28 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget Recommendation Modal */}
      {isBudgetModalOpen && (
        <BudgetRecommendationModal
          isOpen={isBudgetModalOpen}
          onClose={handleCloseBudgetModal}
          recommendation={budgetRecommendation}
          rawData={selectedBudgetRecommendation || data}
        />
      )}

      {/* Creative Analysis Recommendation Modal */}
      {isCreativeModalOpen && (
        <CreativeAnalysisRecommendationModal
          isOpen={isCreativeModalOpen}
          onClose={handleCloseCreativeModal}
          recommendation={creativeAnalysisRecommendation}
          rawData={selectedCreativeRecommendation || creativeData}
        />
      )}

      {/* Placement Optimization Recommendation Modal */}
      {isPlacementModalOpen && (
        <PlacementOptimizationRecommendationModal
          isOpen={isPlacementModalOpen}
          onClose={handleClosePlacementModal}
          recommendation={placementOptimizationRecommendation}
          rawData={selectedPlacementRecommendation || placementData}
        />
      )}

      {/* Audience Optimization Recommendation Modal */}
      {isAudienceModalOpen && (
        <AudienceOptimizationRecommendationModal
          isOpen={isAudienceModalOpen}
          onClose={handleCloseAudienceModal}
          recommendation={audienceOptimizationRecommendation}
          rawData={selectedAudienceRecommendation || audienceData}
        />
      )}

      {/* Bidding Strategy Optimization Recommendation Modal */}
      {isBiddingModalOpen && (
        <BiddingStrategyOptimizationRecommendationModal
          isOpen={isBiddingModalOpen}
          onClose={handleCloseBiddingModal}
          recommendation={biddingStrategyOptimizationRecommendation}
          rawData={selectedBiddingRecommendation || biddingData}
        />
      )}

      {/* Dayparting Optimization Recommendation Modal */}
      {isDaypartingModalOpen && (
        <DaypartingOptimizationRecommendationModal
          isOpen={isDaypartingModalOpen}
          onClose={handleCloseDaypartingModal}
          recommendation={daypartingOptimizationRecommendation}
          rawData={selectedDaypartingRecommendation || daypartingData}
        />
      )}

      {/* Preview Modal */}
      <RecommendationPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        preview={previewData}
        recommendation={previewRecommendation}
      />

      {/* Recently Applied Recommendations - Always visible */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-[#1e4a79]">Recently Applied Recommendations</h2>
        </div>
        {appliedLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e4a79]"></div>
          </div>
        ) : appliedRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appliedRecommendations.map((rec) => (
              <div key={rec.id} className="rounded-lg border-l-[6px] border-green-500 p-6 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-green-500 text-white text-[10px] uppercase font-bold rounded-full">Applied</span>
                      <span className="px-3 py-1 bg-white border border-[#e5e7eb] text-[#4b5563] text-[10px] font-medium rounded-full">
                        {rec.recommendation_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Recommendation'}
                      </span>
                      {rec.execution_status && (
                        <span className={`px-3 py-1 text-[10px] font-medium rounded-full ${rec.execution_status === 'executed'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                          {rec.execution_status === 'executed' ? 'Live' : 'Logged'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[#1e4a79] font-bold text-lg leading-tight mb-2">
                      {rec.recommendation?.recommendation || 'Applied Recommendation'}
                    </h3>
                    {rec.recommendation?.priority && (
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded ${rec.recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {rec.recommendation.priority.toUpperCase()} Priority
                      </span>
                    )}
                  </div>
                </div>

                {/* Changes Made */}
                {rec.changes && rec.changes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[#1e4a79] font-bold text-[10px] uppercase mb-2">Changes Made</p>
                    <div className="space-y-2">
                      {rec.changes.map((change, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{change.entity_name}</p>
                              <p className="text-xs text-gray-500">
                                {change.entity_type === 'campaign' ? 'Campaign' : 'Ad Set'} • ID: {change.entity_id}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${change.change_type.includes('increase') ? 'bg-green-100 text-green-800' :
                              change.change_type.includes('reduction') ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {change.change_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-gray-500">Before:</span>
                              <span className="ml-1 font-semibold text-gray-700">
                                {change.current_budget !== undefined ? `${change.current_budget.toLocaleString()} AED` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">After:</span>
                              <span className={`ml-1 font-semibold ${change.new_budget > (change.current_budget || 0) ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {change.new_budget !== undefined ? `${change.new_budget.toLocaleString()} AED` : 'N/A'}
                              </span>
                            </div>
                          </div>
                          {(change.change_percentage || change.change_amount) && (
                            <div className="mt-2 flex gap-3 text-xs">
                              {change.change_percentage !== undefined && (
                                <span className={`font-semibold ${change.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                  {change.change_percentage > 0 ? '+' : ''}{change.change_percentage}%
                                </span>
                              )}
                              {change.change_amount !== undefined && (
                                <span className={`font-semibold ${change.change_amount > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                  {change.change_amount > 0 ? '+' : ''}{change.change_amount.toLocaleString()} AED
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation Details */}
                {rec.recommendation && (
                  <div className="mb-4">
                    {rec.recommendation.revenue_lift && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                        <p className="text-xs text-gray-600 mb-1">Expected Revenue Lift</p>
                        <p className="text-sm font-bold text-green-700">
                          +{rec.recommendation.revenue_lift.value?.toLocaleString() || 'N/A'} AED
                        </p>
                      </div>
                    )}
                    {rec.recommendation.confidence && (
                      <p className="text-xs text-gray-600">
                        Confidence: <span className="font-semibold">{rec.recommendation.confidence}%</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-[#6b7280]">
                    {rec.approved_at && (
                      <span>Applied: {new Date(rec.approved_at).toLocaleString()}</span>
                    )}
                  </div>
                  {(rec.execution_id || rec.execution?.execution_id) && (
                    <button
                      onClick={() => handleRevert(rec.execution_id || rec.execution?.execution_id, rec.recommendation_type)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 p-8 bg-gray-50 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applied Recommendations</h3>
            <p className="text-sm text-gray-500">Approved recommendations will appear here</p>
          </div>
        )}
      </div>

      {/* Empty State - No recommendations available (only show if all queries have finished) */}
      {!isLoading && !creativeIsLoading && !placementIsLoading && !audienceIsLoading && !biddingIsLoading && !daypartingIsLoading &&
        allRecommendations.length === 0 &&
        !error && !creativeError && !placementError && !audienceError && !biddingError && !daypartingError && (
          <div className="rounded-lg border border-[#e2e8f0] p-8 shadow-sm bg-gradient-to-br from-[#f8faff] to-[#f0f4fa] text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Recommendations Available</h3>
            <p className="text-sm text-gray-500">
              No recommendations found at this time. Please check back later.
            </p>
          </div>
        )}
    </section>
  )
}

export default AIRecommendations



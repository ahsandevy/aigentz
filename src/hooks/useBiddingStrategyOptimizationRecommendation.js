import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useBiddingStrategyOptimizationRecommendation = () => {
  return useQuery({
    queryKey: ['bidding-strategy-optimization'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getBiddingStrategyOptimizationRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

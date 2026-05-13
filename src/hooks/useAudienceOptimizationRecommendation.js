import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useAudienceOptimizationRecommendation = () => {
  return useQuery({
    queryKey: ['audience-optimization'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getAudienceOptimizationRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

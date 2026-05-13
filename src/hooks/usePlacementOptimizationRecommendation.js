import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const usePlacementOptimizationRecommendation = () => {
  return useQuery({
    queryKey: ['placement-optimization'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getPlacementOptimizationRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

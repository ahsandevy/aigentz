import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useDaypartingOptimizationRecommendation = () => {
  return useQuery({
    queryKey: ['dayparting-optimization'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getDaypartingOptimizationRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

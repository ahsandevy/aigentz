import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import {
  AI_RECOMMENDATIONS_APPLIED_LIMIT,
  AI_RECOMMENDATIONS_QUERY_DEFAULTS,
} from './aiRecommendationsQueryUtils'

export const useAppliedRecommendations = (limit = AI_RECOMMENDATIONS_APPLIED_LIMIT) => {
  return useQuery({
    queryKey: ['applied-recommendations', limit],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getAppliedRecommendations(limit, signal)
      if (response?.success && response?.data) {
        // Filter out reverted items (only show active applied recommendations)
        return response.data.filter(rec => rec.reverted_at === null)
      }
      return []
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useAllRecommendationsPriorities = (days = 7) => {
  return useQuery({
    queryKey: ['all-recommendations-priorities', days],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getAllRecommendationsPriorities(days, signal)
      if (response?.recommendations) {
        // Create a map of card_name to priority
        const priorityMap = {}
        response.recommendations.forEach(rec => {
          priorityMap[rec.card_name] = rec.priority
        })
        return priorityMap
      }
      return {}
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

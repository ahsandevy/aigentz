import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

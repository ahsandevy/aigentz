import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const useAppliedRecommendations = (limit = 50) => {
  return useQuery({
    queryKey: ['applied-recommendations', limit],
    queryFn: async () => {
      const response = await analyticsAPI.getAppliedRecommendations(limit)
      if (response?.success && response?.data) {
        // Filter out reverted items (only show active applied recommendations)
        return response.data.filter(rec => rec.reverted_at === null)
      }
      return []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

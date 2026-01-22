import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const useDaypartingOptimizationRecommendation = (days = 7) => {
  return useQuery({
    queryKey: ['dayparting-optimization', days],
    queryFn: async () => {
      const response = await analyticsAPI.getDaypartingOptimizationRecommendation(days)
      return response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

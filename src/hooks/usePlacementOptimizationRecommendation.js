import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const usePlacementOptimizationRecommendation = (days = 7) => {
  return useQuery({
    queryKey: ['placement-optimization', days],
    queryFn: async () => {
      const response = await analyticsAPI.getPlacementOptimizationRecommendation(days)
      return response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

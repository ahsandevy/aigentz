import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const useCreativeAnalysisRecommendation = (days = 7) => {
  return useQuery({
    queryKey: ['creative-analysis', days],
    queryFn: async () => {
      const response = await analyticsAPI.getCreativeAnalysisRecommendation(days)
      return response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

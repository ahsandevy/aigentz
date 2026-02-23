import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

export const useBudgetRecommendation = (days = 7) => {
  return useQuery({
    queryKey: ['budget-reallocation', days],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getBudgetReallocationRecommendation(days, signal)
      return response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once on failure
  })
}

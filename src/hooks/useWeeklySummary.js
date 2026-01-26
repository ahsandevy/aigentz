import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

/**
 * useWeeklySummary - Data-access hook for the Weekly AI Summary section.
 * Fetches qualitative highlights and quantitative impact metrics.
 * 
 * Includes automatic refetching when recommendations are approved 
 * (via invalidation of query keys in the approval handlers).
 */
export const useWeeklySummary = (days = 7) => {
    return useQuery({
        queryKey: ['weekly-summary', days],
        queryFn: async () => {
            return await analyticsAPI.getWeeklySummary(days)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
}

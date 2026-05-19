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
        staleTime: WEEKLY_SUMMARY_STALE_MS,
        refetchOnWindowFocus: false,
        // On mount, refetch only when data is stale.
        refetchOnMount: true,
    })
}

export const WEEKLY_SUMMARY_STALE_MS = 24 * 60 * 60 * 1000

const isWeeklySummaryQueryFresh = (query, staleMs) => {
    if (!query || query.state.status !== 'success') return false
    if (query.getObserversCount() > 0) {
        return !query.isStale()
    }
    const updated = query.state.dataUpdatedAt
    return (
        updated > 0 &&
        Date.now() - updated < staleMs &&
        !query.state.isInvalidated
    )
}

export const weeklySummaryQueryIsFresh = (queryClient, days = 7) => {
    const cache = queryClient.getQueryCache()
    const query = cache.find({ queryKey: ['weekly-summary', days], exact: true })
    return isWeeklySummaryQueryFresh(query, WEEKLY_SUMMARY_STALE_MS)
}

export const getWeeklySummaryLatestDataUpdatedAt = (queryClient, days = 7) => {
    const cache = queryClient.getQueryCache()
    const query = cache.find({ queryKey: ['weekly-summary', days], exact: true })
    if (!query || query.state.status !== 'success' || !query.state.dataUpdatedAt) return null
    return query.state.dataUpdatedAt
}

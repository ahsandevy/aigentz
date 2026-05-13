/** 24h — must match `staleTime` on every AI recommendations `useQuery`. */
export const AI_RECOMMENDATIONS_STALE_MS = 24 * 60 * 60 * 1000

export const AI_RECOMMENDATIONS_APPLIED_LIMIT = 50

/** Shared React Query options for recommendation hooks (cards, priorities, applied). */
export const AI_RECOMMENDATIONS_QUERY_DEFAULTS = {
  staleTime: AI_RECOMMENDATIONS_STALE_MS,
  gcTime: 48 * 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
}

export const getAIRecommendationsQueryKeys = (
  days,
  appliedLimit = AI_RECOMMENDATIONS_APPLIED_LIMIT
) => [
  ['budget-reallocation'],
  ['creative-analysis'],
  ['placement-optimization'],
  ['audience-optimization'],
  ['bidding-strategy-optimization'],
  ['dayparting-optimization'],
  ['all-recommendations-priorities', days],
  ['applied-recommendations', appliedLimit],
]

const isQueryFreshForStaleMs = (query, staleMs) => {
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

/** True when all AI recommendation section queries are loaded and still within staleTime. */
export const aiRecommendationsQueriesAreFresh = (
  queryClient,
  days,
  appliedLimit = AI_RECOMMENDATIONS_APPLIED_LIMIT
) => {
  const cache = queryClient.getQueryCache()
  const staleMs = AI_RECOMMENDATIONS_STALE_MS
  for (const key of getAIRecommendationsQueryKeys(days, appliedLimit)) {
    const query = cache.find({ queryKey: key, exact: true })
    if (!isQueryFreshForStaleMs(query, staleMs)) return false
  }
  return true
}

export const getAIRecommendationsLatestDataUpdatedAt = (
  queryClient,
  days,
  appliedLimit = AI_RECOMMENDATIONS_APPLIED_LIMIT
) => {
  const cache = queryClient.getQueryCache()
  let latest = 0
  for (const key of getAIRecommendationsQueryKeys(days, appliedLimit)) {
    const query = cache.find({ queryKey: key, exact: true })
    if (!query || query.state.status !== 'success' || !query.state.dataUpdatedAt) {
      return null
    }
    latest = Math.max(latest, query.state.dataUpdatedAt)
  }
  return latest || null
}

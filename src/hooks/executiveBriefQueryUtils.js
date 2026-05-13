/** 24h — must match `staleTime` on `useExecutiveBrief`. */
export const EXECUTIVE_BRIEF_STALE_MS = 24 * 60 * 60 * 1000

export const EXECUTIVE_BRIEF_QUERY_KEY = ['executive-brief']

export const EXECUTIVE_BRIEF_QUERY_DEFAULTS = {
  staleTime: EXECUTIVE_BRIEF_STALE_MS,
  gcTime: 48 * 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
}

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

export const executiveBriefQueriesAreFresh = (queryClient) => {
  const cache = queryClient.getQueryCache()
  const query = cache.find({ queryKey: EXECUTIVE_BRIEF_QUERY_KEY, exact: true })
  return isQueryFreshForStaleMs(query, EXECUTIVE_BRIEF_STALE_MS)
}

export const getExecutiveBriefLatestDataUpdatedAt = (queryClient) => {
  const cache = queryClient.getQueryCache()
  const query = cache.find({ queryKey: EXECUTIVE_BRIEF_QUERY_KEY, exact: true })
  if (!query || query.state.status !== 'success' || !query.state.dataUpdatedAt) return null
  return query.state.dataUpdatedAt
}

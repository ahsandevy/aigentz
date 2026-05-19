/** Same value as `EfficiencyDrivers` useQuery `staleTime` — use for “still fresh” checks in Dashboard. */
export const EFFICIENCY_DRIVERS_STALE_MS = 24 * 60 * 60 * 1000

export const getEfficiencyDriversQueryKey = (days) => ['efficiency-drivers', days]

const isEfficiencyDriversQueryFresh = (query, staleMs) => {
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

export const efficiencyDriversQueryIsFresh = (queryClient, days) => {
  const cache = queryClient.getQueryCache()
  const query = cache.find({ queryKey: getEfficiencyDriversQueryKey(days), exact: true })
  return isEfficiencyDriversQueryFresh(query, EFFICIENCY_DRIVERS_STALE_MS)
}

export const getEfficiencyDriversLatestDataUpdatedAt = (queryClient, days) => {
  const cache = queryClient.getQueryCache()
  const query = cache.find({ queryKey: getEfficiencyDriversQueryKey(days), exact: true })
  if (!query || query.state.status !== 'success' || !query.state.dataUpdatedAt) return null
  return query.state.dataUpdatedAt
}

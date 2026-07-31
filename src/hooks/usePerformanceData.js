import { useCallback, useMemo, useState } from 'react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

/** Same value as `sharedQueryOptions.staleTime` — use for “still fresh” checks outside the hook. */
export const PERFORMANCE_EXPLORER_STALE_MS = 24 * 60 * 60 * 1000

/** Prefix for all Performance Explorer queries */
export const PERFORMANCE_EXPLORER_QUERY_KEY = ['performance-explorer']

export const getPerformanceExplorerQueryKeys = (days) => [
  [...PERFORMANCE_EXPLORER_QUERY_KEY, 'campaigns', days],
  [...PERFORMANCE_EXPLORER_QUERY_KEY, 'adsets', days],
  [...PERFORMANCE_EXPLORER_QUERY_KEY, 'ads', days],
  [...PERFORMANCE_EXPLORER_QUERY_KEY, 'audiences', days],
]

/** Matches React Query “fresh” when PE is mounted; falls back to dataUpdatedAt if no observers yet. */
const isPerformanceExplorerQueryFresh = (query, staleMs) => {
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

/**
 * True when all four PE queries exist, succeeded, and are still fresh (within staleTime).
 */
export const performanceExplorerQueriesAreFresh = (queryClient, days) => {
  const staleMs = PERFORMANCE_EXPLORER_STALE_MS
  const cache = queryClient.getQueryCache()
  for (const key of getPerformanceExplorerQueryKeys(days)) {
    const query = cache.find({ queryKey: key, exact: true })
    if (!isPerformanceExplorerQueryFresh(query, staleMs)) return false
  }
  return true
}

/** Latest `dataUpdatedAt` among the four queries (ms), or null if any query is missing / not success. */
export const getPerformanceExplorerLatestDataUpdatedAt = (queryClient, days) => {
  const cache = queryClient.getQueryCache()
  let latest = 0
  for (const key of getPerformanceExplorerQueryKeys(days)) {
    const query = cache.find({ queryKey: key, exact: true })
    if (!query || query.state.status !== 'success' || !query.state.dataUpdatedAt) {
      return null
    }
    latest = Math.max(latest, query.state.dataUpdatedAt)
  }
  return latest || null
}

// Shared query options for all Performance Explorer queries
const sharedQueryOptions = {
  staleTime: PERFORMANCE_EXPLORER_STALE_MS, // while fresh, remount does not trigger HTTP
  gcTime: 60 * 60 * 1000, // 60 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  // Refetch on mount only when data is stale (staleTime elapsed); fresh cache = no refetch
  refetchOnMount: true,
}

const normalizeCampaigns = (raw) =>
  Array.isArray(raw) ? raw : raw?.campaigns ?? raw?.data ?? []

const normalizeAdSets = (raw) =>
  Array.isArray(raw) ? raw : raw?.adsets ?? raw?.data ?? []

const normalizeAds = (raw) =>
  Array.isArray(raw) ? raw : raw?.ads ?? raw?.data ?? []

const normalizeAudiences = (raw) =>
  Array.isArray(raw) ? raw : raw?.audiences ?? raw?.data ?? []

/**
 * Single useQueries run: all four Performance Explorer endpoints in parallel.
 * Includes audience LLM refresh mutations (cache updates on same audience query key).
 */
export const usePerformanceExplorer = (days = 30) => {
  const queryClient = useQueryClient()

  const queries = useQueries({
    queries: [
      {
        queryKey: [...PERFORMANCE_EXPLORER_QUERY_KEY, 'campaigns', days],
        queryFn: ({ signal }) => analyticsAPI.getPerformanceExplorer(days, signal),
        ...sharedQueryOptions,
      },
      {
        queryKey: [...PERFORMANCE_EXPLORER_QUERY_KEY, 'adsets', days],
        queryFn: ({ signal }) => analyticsAPI.getPerformanceAdSets(days, signal),
        ...sharedQueryOptions,
      },
      {
        queryKey: [...PERFORMANCE_EXPLORER_QUERY_KEY, 'ads', days],
        queryFn: ({ signal }) => analyticsAPI.getPerformanceAds(days, signal),
        ...sharedQueryOptions,
      },
      {
        queryKey: [...PERFORMANCE_EXPLORER_QUERY_KEY, 'audiences', days],
        queryFn: ({ signal }) => analyticsAPI.getPerformanceAudiences(days, null, signal),
        ...sharedQueryOptions,
      },
    ],
  })

  const [campaignsQuery, adsetsQuery, adsQuery, audiencesQuery] = queries

  const campaigns = useMemo(
    () => normalizeCampaigns(campaignsQuery.data),
    [campaignsQuery.data]
  )
  const adSets = useMemo(() => normalizeAdSets(adsetsQuery.data), [adsetsQuery.data])
  const ads = useMemo(() => normalizeAds(adsQuery.data), [adsQuery.data])
  const audiences = useMemo(
    () => normalizeAudiences(audiencesQuery.data),
    [audiencesQuery.data]
  )

  const refetchAll = useCallback(async () => {
    await Promise.all([
      campaignsQuery.refetch(),
      adsetsQuery.refetch(),
      adsQuery.refetch(),
      audiencesQuery.refetch(),
    ])
  }, [
    campaignsQuery.refetch,
    adsetsQuery.refetch,
    adsQuery.refetch,
    audiencesQuery.refetch,
  ])

  const audienceQueryKey = useMemo(
    () => [...PERFORMANCE_EXPLORER_QUERY_KEY, 'audiences', days],
    [days]
  )

  const refreshLLMMutation = useMutation({
    mutationFn: async (audienceId) => {
      return await analyticsAPI.refreshAudienceLLM(audienceId, days)
    },
    onSuccess: (updatedAudience, audienceId) => {
      queryClient.setQueryData(audienceQueryKey, (old) => {
        if (!old) return old
        const list = Array.isArray(old) ? old : old?.audiences ?? old?.data
        if (!Array.isArray(list)) return old
        const next = list.map((aud) =>
          aud.audience_id === audienceId || aud.id === audienceId ? updatedAudience : aud
        )
        if (Array.isArray(old)) return next
        if (old?.audiences) return { ...old, audiences: next }
        if (old?.data) return { ...old, data: next }
        return next
      })
    },
  })

  const refreshAllLLMMutation = useMutation({
    mutationFn: async (audienceIds) => {
      return await analyticsAPI.getPerformanceAudiences(days, audienceIds)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(audienceQueryKey, data)
    },
  })

  const [refreshingIds, setRefreshingIds] = useState(new Set())

  const refreshAudienceLLM = useCallback(
    (audienceId) => {
      setRefreshingIds((prev) => new Set(prev).add(audienceId))
      refreshLLMMutation.mutate(audienceId, {
        onSettled: () => {
          setRefreshingIds((prev) => {
            const next = new Set(prev)
            next.delete(audienceId)
            return next
          })
        },
      })
    },
    [refreshLLMMutation]
  )

  const refreshAudienceLLMAsync = useCallback(
    async (audienceId) => {
      setRefreshingIds((prev) => new Set(prev).add(audienceId))
      try {
        return await refreshLLMMutation.mutateAsync(audienceId)
      } finally {
        setRefreshingIds((prev) => {
          const next = new Set(prev)
          next.delete(audienceId)
          return next
        })
      }
    },
    [refreshLLMMutation]
  )

  const refreshAllAudiencesLLM = useCallback(
    (audienceIds) => {
      setRefreshingIds(new Set(audienceIds))
      refreshAllLLMMutation.mutate(audienceIds, {
        onSettled: () => {
          setRefreshingIds(new Set())
        },
      })
    },
    [refreshAllLLMMutation]
  )

  const isFetchingAny =
    campaignsQuery.isFetching ||
    adsetsQuery.isFetching ||
    adsQuery.isFetching ||
    audiencesQuery.isFetching

  return {
    campaigns,
    adSets,
    ads,
    audiences,
    campaignsLoading: campaignsQuery.isLoading,
    adSetsLoading: adsetsQuery.isLoading,
    adsLoading: adsQuery.isLoading,
    audiencesLoading: audiencesQuery.isLoading,
    campaignsError: campaignsQuery.error,
    adSetsError: adsetsQuery.error,
    adsError: adsQuery.error,
    audiencesError: audiencesQuery.error,
    isFetchingAny,
    refetchAll,
    refreshAudienceLLM,
    refreshAudienceLLMAsync,
    isRefreshingAudience: refreshLLMMutation.isPending,
    refreshingAudienceIds: refreshingIds,
    refreshAllAudiencesLLM,
    isRefreshingAll: refreshAllLLMMutation.isPending,
  }
}

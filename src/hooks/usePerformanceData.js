import { useState } from 'react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

// Shared query options for all Performance Explorer queries
const sharedQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  refetchOnMount: false,
}

// Use parallel queries hook - fetches all 4 endpoints simultaneously
// React Query's useQueries executes all queries in parallel by default
const usePerformanceQueries = (days = 7) => {
  return useQueries({
    queries: [
      {
        queryKey: ['performance-explorer', 'campaigns', days],
        queryFn: async () => {
          // analyticsAPI methods already return response.data
          const data = await analyticsAPI.getPerformanceExplorer(days)
          return data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'adsets', days],
        queryFn: async () => {
          const data = await analyticsAPI.getPerformanceAdSets(days)
          return data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'ads', days],
        queryFn: async () => {
          const data = await analyticsAPI.getPerformanceAds(days)
          return data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'audiences', days],
        queryFn: async () => {
          const data = await analyticsAPI.getPerformanceAudiences(days)
          return data
        },
        ...sharedQueryOptions,
      },
    ],
  })
}

// Hook for Campaigns - uses parallel queries but returns only campaigns data
export const useCampaigns = (days = 7) => {
  const queries = usePerformanceQueries(days)
  const campaignsQuery = queries[0]

  const raw = campaignsQuery.data
  const campaigns =
    Array.isArray(raw)
      ? raw
      : raw?.campaigns ??
        raw?.data ??
        []

  return {
    data: campaigns,
    isLoading: campaignsQuery.isLoading,
    isError: campaignsQuery.isError,
    error: campaignsQuery.error,
    refetch: campaignsQuery.refetch,
  }
}

// Hook for Ad Sets - uses parallel queries but returns only adsets data
export const useAdSets = (days = 7) => {
  const queries = usePerformanceQueries(days)
  const adsetsQuery = queries[1]

  const raw = adsetsQuery.data
  const adsets =
    Array.isArray(raw)
      ? raw
      : raw?.adsets ??
        raw?.data ??
        []

  return {
    data: adsets,
    isLoading: adsetsQuery.isLoading,
    isError: adsetsQuery.isError,
    error: adsetsQuery.error,
    refetch: adsetsQuery.refetch,
  }
}

// Hook for Ads - uses parallel queries but returns only ads data
export const useAds = (days = 7) => {
  const queries = usePerformanceQueries(days)
  const adsQuery = queries[2]

  const raw = adsQuery.data
  const ads =
    Array.isArray(raw)
      ? raw
      : raw?.ads ??
        raw?.data ??
        []

  return {
    data: ads,
    isLoading: adsQuery.isLoading,
    isError: adsQuery.isError,
    error: adsQuery.error,
    refetch: adsQuery.refetch,
  }
}

// Hook for Audiences - uses parallel queries but returns only audiences data
export const useAudiences = (days = 7) => {
  const queryClient = useQueryClient()
  const queries = usePerformanceQueries(days)
  const audiencesQuery = queries[3]

  // Mutation for refreshing individual audience LLM
  const refreshLLMMutation = useMutation({
    mutationFn: async (audienceId) => {
      return await analyticsAPI.refreshAudienceLLM(audienceId, days)
    },
    onSuccess: (updatedAudience, audienceId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['performance-explorer', 'audiences', days], (old) => {
        if (!old) return old
        return old.map(aud =>
          (aud.audience_id === audienceId || aud.id === audienceId)
            ? updatedAudience
            : aud
        )
      })
    },
  })

  // Mutation for refreshing all audiences LLM
  const refreshAllLLMMutation = useMutation({
    mutationFn: async (audienceIds) => {
      const data = await analyticsAPI.getPerformanceAudiences(days, audienceIds)
      return data
    },
    onSuccess: (data) => {
      // Update the cache with refreshed data
      queryClient.setQueryData(['performance-explorer', 'audiences', days], data)
    },
  })

  // Track refreshing IDs manually since mutations don't support multiple concurrent calls easily
  const [refreshingIds, setRefreshingIds] = useState(new Set())

  const refreshAudienceLLM = (audienceId) => {
    setRefreshingIds(prev => new Set(prev).add(audienceId))
    refreshLLMMutation.mutate(audienceId, {
      onSettled: () => {
        setRefreshingIds(prev => {
          const next = new Set(prev)
          next.delete(audienceId)
          return next
        })
      }
    })
  }

  const refreshAllAudiencesLLM = (audienceIds) => {
    setRefreshingIds(new Set(audienceIds))
    refreshAllLLMMutation.mutate(audienceIds, {
      onSettled: () => {
        setRefreshingIds(new Set())
      }
    })
  }

  const raw = audiencesQuery.data
  const audiences =
    Array.isArray(raw)
      ? raw
      : raw?.audiences ??
        raw?.data ??
        []

  return {
    data: audiences,
    isLoading: audiencesQuery.isLoading,
    isError: audiencesQuery.isError,
    error: audiencesQuery.error,
    refetch: audiencesQuery.refetch,
    refreshAudienceLLM,
    isRefreshingAudience: refreshLLMMutation.isPending,
    refreshingAudienceIds: refreshingIds,
    refreshAllAudiencesLLM,
    isRefreshingAll: refreshAllLLMMutation.isPending,
  }
}

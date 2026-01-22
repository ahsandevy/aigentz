import { useState } from 'react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

const DAYS = 7

// Shared query options for all Performance Explorer queries
const sharedQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  refetchOnMount: false,
}

// Use parallel queries hook - fetches all 4 endpoints simultaneously
// React Query's useQueries executes all queries in parallel by default
const usePerformanceQueries = () => {
  return useQueries({
    queries: [
      {
        queryKey: ['performance-explorer', 'campaigns', DAYS],
        queryFn: async () => {
          const response = await analyticsAPI.getPerformanceExplorer(DAYS)
          return response.data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'adsets', DAYS],
        queryFn: async () => {
          const response = await analyticsAPI.getPerformanceAdSets(DAYS)
          return response.data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'ads', DAYS],
        queryFn: async () => {
          const response = await analyticsAPI.getPerformanceAds(DAYS)
          return response.data
        },
        ...sharedQueryOptions,
      },
      {
        queryKey: ['performance-explorer', 'audiences', DAYS],
        queryFn: async () => {
          const response = await analyticsAPI.getPerformanceAudiences(DAYS)
          return response.data
        },
        ...sharedQueryOptions,
      },
    ],
  })
}

// Hook for Campaigns - uses parallel queries but returns only campaigns data
export const useCampaigns = () => {
  const queries = usePerformanceQueries()
  const campaignsQuery = queries[0]
  
  return {
    data: campaignsQuery.data ?? [],
    isLoading: campaignsQuery.isLoading,
    isError: campaignsQuery.isError,
    error: campaignsQuery.error,
    refetch: campaignsQuery.refetch,
  }
}

// Hook for Ad Sets - uses parallel queries but returns only adsets data
export const useAdSets = () => {
  const queries = usePerformanceQueries()
  const adsetsQuery = queries[1]
  
  return {
    data: adsetsQuery.data ?? [],
    isLoading: adsetsQuery.isLoading,
    isError: adsetsQuery.isError,
    error: adsetsQuery.error,
    refetch: adsetsQuery.refetch,
  }
}

// Hook for Ads - uses parallel queries but returns only ads data
export const useAds = () => {
  const queries = usePerformanceQueries()
  const adsQuery = queries[2]
  
  return {
    data: adsQuery.data ?? [],
    isLoading: adsQuery.isLoading,
    isError: adsQuery.isError,
    error: adsQuery.error,
    refetch: adsQuery.refetch,
  }
}

// Hook for Audiences - uses parallel queries but returns only audiences data
export const useAudiences = () => {
  const queryClient = useQueryClient()
  const queries = usePerformanceQueries()
  const audiencesQuery = queries[3]

  // Mutation for refreshing individual audience LLM
  const refreshLLMMutation = useMutation({
    mutationFn: async (audienceId) => {
      return await analyticsAPI.refreshAudienceLLM(audienceId, DAYS)
    },
    onSuccess: (updatedAudience, audienceId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['performance-explorer', 'audiences', DAYS], (old) => {
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
      const response = await analyticsAPI.getPerformanceAudiences(DAYS, audienceIds)
      return response
    },
    onSuccess: (response) => {
      // Update the cache with refreshed data
      queryClient.setQueryData(['performance-explorer', 'audiences', DAYS], response.data)
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

  return {
    data: audiencesQuery.data ?? [],
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

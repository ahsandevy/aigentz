import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'

const toArray = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.data)) return raw.data
  if (raw.data && typeof raw.data === 'object') return [raw.data]
  if (typeof raw === 'object') return [raw]
  return []
}

const normalizeCampaignItem = (payload) => {
  if (!payload || typeof payload !== 'object') return null

  return {
    campaign: payload.campaign || null,
    lookback: payload.lookback || null,
    summary: payload.summary || null,
    kpis: payload.kpis || null,
    adsets: Array.isArray(payload.adsets) ? payload.adsets : [],
    ads: Array.isArray(payload.ads) ? payload.ads : [],
    trend: payload.trend || null,
    recommendations: Array.isArray(payload.recommendations) ? payload.recommendations : [],
    warnings: Array.isArray(payload.warnings) ? payload.warnings : []
  }
}

const normalizeCampaignLevelInfo = (raw) => {
  const source = toArray(raw)
  const items = source
    .map((item) => normalizeCampaignItem(item))
    .filter(Boolean)

  return {
    items,
    total: typeof raw?.total === 'number' ? raw.total : items.length
  }
}

export const useCampaignLevelInfo = () => {
  return useQuery({
    queryKey: ['campaign-level-info'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getCampaignLevelInfo(signal)
      return normalizeCampaignLevelInfo(response)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  })
}


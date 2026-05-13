import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useCreativeAnalysisRecommendation = () => {
  return useQuery({
    queryKey: ['creative-analysis'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getCreativeAnalysisRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

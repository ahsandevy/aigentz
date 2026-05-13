import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import { AI_RECOMMENDATIONS_QUERY_DEFAULTS } from './aiRecommendationsQueryUtils'

export const useBudgetRecommendation = () => {
  return useQuery({
    queryKey: ['budget-reallocation'],
    queryFn: async ({ signal }) => {
      const response = await analyticsAPI.getBudgetReallocationRecommendation(signal)
      return response
    },
    ...AI_RECOMMENDATIONS_QUERY_DEFAULTS,
  })
}

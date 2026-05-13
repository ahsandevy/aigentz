import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import {
  EXECUTIVE_BRIEF_QUERY_DEFAULTS,
  EXECUTIVE_BRIEF_QUERY_KEY,
} from './executiveBriefQueryUtils'

export const useExecutiveBrief = () => {
  return useQuery({
    queryKey: EXECUTIVE_BRIEF_QUERY_KEY,
    queryFn: async ({ signal }) => {
      return await analyticsAPI.getExecutiveBrief(false, signal)
    },
    ...EXECUTIVE_BRIEF_QUERY_DEFAULTS,
  })
}

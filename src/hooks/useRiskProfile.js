import { useQuery } from '@tanstack/react-query'
import { userApi } from '../utils/api'

const EMPTY_PROFILE = {
  profile: null,
  score: null,
  allocation: { bonds: 0, equities: 0, cash: 0 },
}

const normalizeProfile = (riskProfile) => {
  if (!riskProfile?.profile) return EMPTY_PROFILE
  return {
    profile: riskProfile.profile,
    score: riskProfile.score ?? null,
    allocation: {
      bonds: riskProfile.allocation?.bonds ?? 0,
      equities: riskProfile.allocation?.equities ?? 0,
      cash: riskProfile.allocation?.cash ?? 0,
    },
  }
}

export const useRiskProfile = () =>
  useQuery({
    queryKey: ['riskProfile'],
    queryFn: async () => {
      const data = await userApi.getProfile()
      return normalizeProfile(data?.user?.riskProfile)
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

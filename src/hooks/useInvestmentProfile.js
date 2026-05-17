import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { investmentApi, userApi } from '../utils/api';

const QUERY_KEY = ['investmentProfile'];
const EMPTY_PROFILE = {
  profile: null,
  score: null,
  allocation: {
    bonds: 0,
    equities: 0,
    cash: 0,
  },
};

const normalizeProfile = (riskProfile) => {
  if (!riskProfile?.profile) {
    return EMPTY_PROFILE;
  }

  return {
    profile: riskProfile.profile,
    score: riskProfile.score ?? null,
    allocation: {
      bonds: riskProfile.allocation?.bonds ?? 0,
      equities: riskProfile.allocation?.equities ?? 0,
      cash: riskProfile.allocation?.cash ?? 0,
    },
  };
};

const scoreAnswers = (answers) =>
  answers.reduce((sum, value) => sum + Number(value), 0);

const toAnswersArray = (answers) => {
  if (Array.isArray(answers)) return answers;
  if (!answers || typeof answers !== 'object') return [];

  const orderedEntries = Object.entries(answers).sort(([a], [b]) => {
    const indexA = Number(a.replace(/\D/g, ''));
    const indexB = Number(b.replace(/\D/g, ''));
    return indexA - indexB;
  });

  return orderedEntries.map(([, value]) => Number(value));
};

export default function useInvestmentProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const data = await userApi.getProfile();
      return normalizeProfile(data?.user?.riskProfile);
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: async (rawAnswers) => {
      const answers = toAnswersArray(rawAnswers);
      const score = scoreAnswers(answers);
      return investmentApi.submitProfile({ answers, score });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(QUERY_KEY, normalizeProfile(profile));
    },
  });

  const submitAssessment = useCallback(
    (answers) => submitMutation.mutateAsync(answers),
    [submitMutation]
  );

  const resetProfile = useCallback(() => {
    queryClient.setQueryData(QUERY_KEY, EMPTY_PROFILE);
  }, [queryClient]);

  return {
    data: profileQuery.data ?? EMPTY_PROFILE,
    isLoading: profileQuery.isLoading || submitMutation.isPending,
    error: profileQuery.error || submitMutation.error || null,
    submitAssessment,
    resetProfile,
  };
}

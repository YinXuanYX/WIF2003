import { useCallback, useState } from "react";
import investmentProfileSeed from "../mocks/investmentProfile.json";

const ALLOCATIONS = {
  Conservative: { bonds: 60, equities: 20, cash: 20 },
  Moderate: { bonds: 40, equities: 50, cash: 10 },
  Aggressive: { bonds: 10, equities: 80, cash: 10 },
};

const getProfile = (score) => {
  if (score <= 10) return "Conservative";
  if (score <= 20) return "Moderate";
  return "Aggressive";
};

const scoreAnswers = (answers) =>
  Object.values(answers).reduce((sum, value) => sum + value, 0);

const buildProfilePayload = (answers) => {
  const score = scoreAnswers(answers);
  const profile = getProfile(score);

  return {
    profile,
    score,
    allocation: ALLOCATIONS[profile],
  };
};

export default function useInvestmentProfile() {
  const [data, setData] = useState(investmentProfileSeed);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitAssessment = useCallback((answers) => {
    setIsLoading(true);
    setError(null);

    const next = buildProfilePayload(answers);
    setData(next);
    setIsLoading(false);

    return next;
  }, []);

  const resetProfile = useCallback(() => {
    setData(investmentProfileSeed);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    submitAssessment,
    resetProfile,
  };
}

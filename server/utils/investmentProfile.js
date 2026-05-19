export const scoreToProfile = (score) => {
  if (score >= 0 && score <= 10) return 'Conservative';
  if (score >= 11 && score <= 20) return 'Moderate';
  if (score >= 21 && score <= 30) return 'Aggressive';
  throw new Error(`Invalid score: ${score}. Must be between 0 and 30.`);
};

export const getProfileAllocation = (profile) => {
  const allocations = {
    Conservative: { bonds: 60, equities: 20, cash: 20 },
    Moderate: { bonds: 40, equities: 50, cash: 10 },
    Aggressive: { bonds: 10, equities: 80, cash: 10 },
  };

  if (!allocations[profile]) {
    throw new Error(`Invalid profile: ${profile}`);
  }

  return allocations[profile];
};

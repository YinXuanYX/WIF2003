/**
 * Maps a score (0-30) to a risk profile.
 * @param {number} score - The total score from the questionnaire (0-30)
 * @returns {string} - One of: 'Conservative', 'Moderate', 'Aggressive'
 * @throws {Error} - If score is invalid
 */
export const scoreToProfile = (score) => {
  if (score >= 0 && score <= 10) return 'Conservative';
  if (score >= 11 && score <= 20) return 'Moderate';
  if (score >= 21 && score <= 30) return 'Aggressive';
  throw new Error(`Invalid score: ${score}. Must be between 0 and 30.`);
};

/**
 * Gets the predefined asset allocation for a given profile.
 * @param {string} profile - One of: 'Conservative', 'Moderate', 'Aggressive'
 * @returns {object} - Allocation object with bonds, equities, and cash percentages
 * @throws {Error} - If profile is invalid
 */
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

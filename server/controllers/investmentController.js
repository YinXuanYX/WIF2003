import User from '../models/User.js';
import { scoreToProfile, getProfileAllocation } from '../utils/investmentProfile.js';

export const submitInvestmentProfile = async (req, res, next) => {
  try {
    const { answers, score } = req.body;
    const userId = req.user._id;
    const computedScore = answers.reduce((total, answer) => total + Number(answer), 0);

    if (computedScore !== score) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['score must match the sum of answers'],
      });
    }

    const profile = scoreToProfile(computedScore);
    const allocation = getProfileAllocation(profile);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'riskProfile.profile': profile,
        'riskProfile.score': computedScore,
        'riskProfile.allocation': allocation,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      profile: updatedUser.riskProfile.profile,
      score: updatedUser.riskProfile.score,
      allocation: updatedUser.riskProfile.allocation,
    });
  } catch (error) {
    next(error);
  }
};

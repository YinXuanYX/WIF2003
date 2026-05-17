import User from '../models/User.js';
import { scoreToProfile, getProfileAllocation } from '../utils/investmentProfile.js';

export const submitInvestmentProfile = async (req, res, next) => {
  try {
    const { score } = req.body;
    const userId = req.user._id;

    const profile = scoreToProfile(score);
    const allocation = getProfileAllocation(profile);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'riskProfile.profile': profile,
        'riskProfile.score': score,
        'riskProfile.allocation': allocation,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      profile: updatedUser.riskProfile.profile,
      score: updatedUser.riskProfile.score,
      allocation: updatedUser.riskProfile.allocation,
    });
  } catch (error) {
    next(error);
  }
};

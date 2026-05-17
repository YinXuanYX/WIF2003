export const submitInvestmentProfile = async (_req, res, next) => {
  try {
    return res.status(501).json({
      message: 'Investment profile scoring is not implemented yet.',
    });
  } catch (error) {
    next(error);
  }
};

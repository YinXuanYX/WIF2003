const hasMongoOperators = (obj) => {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.keys(obj).some(
    (key) => key.startsWith('$') || hasMongoOperators(obj[key])
  );
};

const sanitizeBody = (req, res, next) => {
  if (req.body && hasMongoOperators(req.body)) {
    return res.status(400).json({
      message:
        'Invalid input: request body contains disallowed operator keys.',
    });
  }
  next();
};

export default sanitizeBody;

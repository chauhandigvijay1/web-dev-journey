const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(new AppError(result.array().map((item) => item.msg).join(", "), 422));
};

module.exports = validateRequest;

const customError = require("./../utils/customError");

const devError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error,
  });
};

const duplicateKeyError = (error) => {
  const nameORemail = error.keyValue.username
    ? error.keyValue.username
    : error.keyValue.email;
  const msg = `There are already an user available with name/email : ${nameORemail}. please use another name or email`;
  return new customError(msg, 400);
};

const validationErrorHandler = (error) => {
  const errors = Object.values(error.errors).map((val) => val.message);
  const errorMessage = errors.join(". ");
  const msg = `Invalid Input data : ${errorMessage}`;
  return new customError(msg, 400);
};

const jsonWebTokenErrorHandler = (error) => {
  const msg = `${error.message}! Please login and try again`
  return new customError(msg, 400);
};

const prodError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode).json({
      status: error.status,
      message: "something wents wrong! please try again later",
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    if (error.code == 11000) error = duplicateKeyError(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "JsonWebTokenError")
      error = jsonWebTokenErrorHandler(error);
    prodError(error, res);
  }
};

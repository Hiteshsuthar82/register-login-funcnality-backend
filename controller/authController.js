const jwt = require("jsonwebtoken");
const util = require("util");
const _ = require("lodash");
const User = require("./../models/userModel");
const customError = require("./../utils/customError");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRE,
  });
};

const createSendResponce = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: 1000000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // Use Lax or Strict for local development and none for secure true
  };

  res.cookie("jwt", token, options);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

exports.signUp = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendResponce(newUser, 200, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const error = new customError(
      "please provide email ID & Password for login in!",
      400
    );
    return next(error);
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new customError("Incorrect email or password", 400);
    return next(error);
  }

  createSendResponce(user, 200, res);
});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  console.log(req.body);
  const data = req.body.email
    ? { username: req.body.username, email: req.body.email }
    : { username: req.body.username };
  const user = await User.findOne(data);
  console.log(user);

  if (_.isEmpty(user)) {
    const error = new customError(
      `user with ${
        req.body.email
          ? req.body.username + " & " + req.body.email
          : req.body.username
      } detail does not found`
    );
    return next(error);
  }

  if (!req.body.email) {
    res.status(200).json({
      status: "success",
      message: "email enter popup shown",
    });
    return;
  }

  const resetToken = user.createResetPasswordToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}:api/v1/resetPassword/${resetToken}`;

  const message = `we have recevied your password reset request, please use the below link to reset your password\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Passowrd change request received",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "password reset link sent on the user email",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new customError(
        "There was an error when sending password reset email. please try again later"
      ),
      500
    );
  }
});

exports.logout = asyncErrorHandler(async (req, res, next) => {
  res.clearCookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // matches the secure setting used when setting the cookie
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // matches the sameSite setting used when setting the cookie
  });

  res.status(200).json({
    status: "success",
    message: "you have been loged out successfully",
  });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(`token from req.cookie.jwt : ${token}`);

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  // cheking the user with give token exists in database or not
  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new customError(
      "The user within given token does not exists!",
      401
    );
    return next(error);
  }

  req.user = user;
  next();
});

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

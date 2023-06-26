import crypto from "crypto";

import User from "../models/User.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthError,
} from "../errors/index.js";
import { attachCookiesToResponse } from "../utils/jwt.js";
import createTokenUser from "../utils/createTokenUser.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import Token from "../models/Token.js";
import sendResetPasswordEmail from "../utils/sendResetPasswordEmail.js";
import hashString from "../utils/createHash.js";

// @desc            Register User
// @route           POST  /api/v1/auth/register
// @access          Public
const register = async (req, res) => {
  // 1) get incoming request from req.body
  const { name, email, password } = req.body;

  //   2) check user already exists
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new BadRequestError("Email already in use");
  }

  //   first registered user is an admin
  const isFirstAccount = await User.countDocuments({});
  const role = isFirstAccount === 0 ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  //   3) create an user
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: "http://localhost:3000",
  });

  // send verification token back only while testing in postman!!
  res.status(201).json({
    msg: "Success, Please check your email to verify account",
  });
};

// @desc            Verify Email
// @route           POST  /api/v1/auth/verify-email
// @access          Public
const verifyEmail = async (req, res) => {
  // get data from request body
  const { verificationToken, email } = req.body;

  // find the user
  const user = await User.findOne({ email });

  // if user not exists, throw 401
  if (!user) {
    throw new UnauthError("Verification Failed");
  }

  //  token does not match, throw 401
  if (verificationToken !== user.verificationToken) {
    throw new UnauthError("Verification Failed");
  }

  // update user data
  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  // save the user
  await user.save();

  //  send response
  res.status(200).json({
    status: "success",
    msg: "Email Verified Successfully!",
  });
};

// @desc            Login User
// @route           POST  /api/v1/auth/login
// @access          Public
const login = async (req, res) => {
  // 1) get email and password from request body
  const { email, password } = req.body;

  // 2) checck email or password exist or not
  if (!email || !password) {
    throw new BadRequestError("Email or Password is missing");
  }

  // 3) check user exists or not from email
  const user = await User.findOne({ email }).select("+password");

  // 4) if not, send unauth user
  if (!user) {
    throw new UnauthError("Invalid Credentials");
  }

  //  5) check password
  const isPasswordCorrect = await user.comparePassword(password);

  // 6) not correct send unauth error
  if (!isPasswordCorrect) {
    throw new UnauthError("Invalid Credentials");
  }

  if (!user.isVerified) {
    throw new UnauthError("Please verify your Email!");
  }

  // create token user by passing user to function
  const tokenUser = createTokenUser({ user });

  // create refresh token
  let refreshToken = "";

  // check for existing token

  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");

  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };

  await Token.create(userToken);

  // 7) create jwt, attach cookie to response and send the response back
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
};

// @desc            Logout User
// @route           GET  /api/v1/auth/logout
// @access          Private
const logout = async (req, res) => {
  // delete token
  await Token.findOneAndDelete({ user: req.user.userId });

  // remove cookies

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.send("logged out");
};

const forgotPassword = async (req, res) => {
  // get email
  const { email } = req.body;

  // check email, send 400
  if (!email) {
    throw new BadRequestError("Email is Required!");
  }

  // find user
  const user = await User.findOne({ email });

  // no user, send 401
  if (!user) {
    throw new NotFoundError("Invalid Email");
  }

  // create password token
  const passwordToken = crypto.randomBytes(40).toString("hex");

  // send email
  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    passwordToken,
    origin: "http://localhost:3000",
  });

  const tenMinutes = 100 * 60 * 10;
  const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

  // update fields
  user.passwordToken = hashString(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;

  // save user
  await user.save();

  // send response
  res.status(200).json({
    status: "success",
    msg: "Please check your email to reset password",
  });
};

const resetPassword = async (req, res) => {
  // get data from request body
  const { token, email, password } = req.body;

  // check all values, throw 400
  if (!token || !email || !password) {
    throw new BadRequestError("please provide all values");
  }

  // check user already exists
  const user = await User.findOne({ email }).select("+password");

  if (user) {
    const currentDate = new Date();
    if (
      user.passwordToken === hashString(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  // send the response
  res.send("reset");
};

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };

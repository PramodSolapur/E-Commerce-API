import * as mongoose from "mongoose";
import {
  BadRequestError,
  NotFoundError,
  UnauthError,
} from "../errors/index.js";
import User from "../models/User.js";
import createTokenUser from "../utils/createTokenUser.js";
import { attachCookiesToResponse } from "../utils/jwt.js";
import checkPermissions from "../utils/checkPermissions.js";

// @desc            Get All Users
// @route           GET  /api/v1/users
// @access          Private (admin)
const getAllUsers = async (req, res) => {
  // 1) get all users based on the role as user
  const users = await User.find({ role: "user" });

  // 2) send the response having all users
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

// @desc            Get Single User
// @route           GET  /api/v1/users/:id
// @access          Private (user)
const getSingleUser = async (req, res) => {
  // 1) get id from params object
  const id = req.params.id;

  // 2) check it is valid mongoose object id or not
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid user ID");
  }

  // 3) check user exist or not
  const user = await User.findById(id);

  // 4) if not throw 404
  if (!user) {
    throw new NotFoundError("User not Found!");
  }

  // 5) check permissions
  checkPermissions(req.user, user._id);

  // 6) send the response
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

// @desc            Get Current User
// @route           GET  /api/v1/users/showMe
// @access          Private (user)
const showCurrentUser = async (req, res) => {
  // 1) get user from request object
  const user = req.user;

  // 2) send the response
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

// @desc            Update User Password
// @route           PATCH  /api/v1/users/update-password
// @access          Private (user)
const updateUserPassword = async (req, res) => {
  // 1) get old and new password from request body
  const { oldPassword, newPassword } = req.body;

  // 2) check both, if not throw 400
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Either old password or new password is missing");
  }

  // 3) find the user by userID
  const user = await User.findById(req.user.userId).select("+password");

  // 4) match oladPassword with registered password
  const isMatched = await user.comparePassword(oldPassword);

  // 5) not macthed, throw 401
  if (!isMatched) {
    throw new UnauthError("Not Authorized");
  }

  // 6) change oldPassword by new password
  user.password = newPassword;

  // 7) save user
  await user.save();

  // 8) send the response
  res.status(200).json({
    status: "success",
    msg: "Password changed successfully!",
  });
};

// @desc            Update User
// @route           PATCH  /api/v1/users/updateUser
// @access          Private (user)
const updateUser = async (req, res) => {
  // 1) get name and email from request body
  const { email, name } = req.body;

  // 2) check both, if not throw 400
  if (!email || !name) {
    throw new BadRequestError("Name or Email is missing");
  }

  // 3) find user and update, add new:true, u get updated document
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    {
      new: true,
      runValidators: true,
    }
  );

  // 4) create token user again, because user might have changed email
  const tokenUser = createTokenUser({ user });

  // 5) create jwt, attach cookie to response and send the response back
  attachCookiesToResponse({ res, user: tokenUser });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

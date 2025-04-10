import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(422).json({
      status: false,
      message: "Please provide username, email and password",
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists)
    return res
      .status(400)
      .json({ status: false, message: "User already exist" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    //create jwt token
    const accessToken = generateAccessToken(res, newUser._id);
    const refreshToken = generateRefreshToken(res, newUser._id);

    if (accessToken && refreshToken) {
      return res.status(201).json({
        status: true,
        message: "User created successfully",
        accesstoken: accessToken,
        results: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          isAdmin: newUser.isAdmin,
        },
      });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Error generating token" });
    }
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
  // return res
  //   .status(200)
  //   .json({
  //     status: true,
  //     message: `Username: ${username}, email: ${email}, password: hidden`,
  //   });
});

const refreshTheToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: false, message: "Missen refresh token" });
  }

  jwt.verify(refreshToken, process.env.SECRET_REFRESH, (err, user) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }
    const newAccessToken = generateAccessToken(res, user.userId);
    return res.json({ accessToken: newAccessToken });
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (isPasswordValid) {
        const accessToken = generateAccessToken(res, existingUser._id);
        //generate refresh token
        const refreshToken = generateRefreshToken(res, existingUser._id);
        if (accessToken && refreshToken) {
          return res.status(200).json({
            status: true,
            message: "Login successful",
            accessToken: accessToken,
            results: {
              _id: existingUser._id,
              username: existingUser.username,
              email: existingUser.email,
              isAdmin: existingUser.isAdmin,
            },
          });
        } else {
          return res
            .status(400)
            .json({
              status: false,
              message: "Error generating token. Login failed",
            });
        }
      }
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });

  res
    .status(200)
    .json({ status: true, message: "User logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ status: true, message: "All users", results: users });
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
    throw new Error("User not found");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
    throw new Error("User not found");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res
        .status(400)
        .json({ status: false, message: "Admin user cannot be deleted" });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ status: true, message: "User deleted successfully" });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  refreshTheToken,
};

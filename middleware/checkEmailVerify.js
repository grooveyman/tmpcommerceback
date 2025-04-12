import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const checkEmailVerify = asyncHandler(async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ status: false, message: "Email not provided" });
    }
    const user = await User.findOne({email}).select("-password");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.isVerified) {
      next();
    } else {
      return res.status(400).json({ status: false, message: "Email not verified" });
    }
  } catch (error) {
    return { status: false, message: error.message };
  }
});

export {checkEmailVerify};
import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/createToken.js";
import sendMail from "../utils/mail.js";
import htmlEmailTemplate from "../emailTemplates/verifyEmail.js";
import resetPasswordTemplate from "../emailTemplates/resetPassword.js";

//reend verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({
      status: false,
      message: "Please provide email",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ status: false, message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({
      status: false,
      message: "Email already verified",
    });
  }

  const emailVerification = await sendEmailVerification(email);
  if (!emailVerification.status) {
    return res.status(400).json({
      status: false,
      message: "Failed to send verification email",
      results: emailVerification.error,
    });
  }

  return res.status(200).json({
    status: true,
    message: "Verification email sent successfully",
  });
});



//geenrate token for email
const generateEmailToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { status: false, message: "User not found" };
    }

    const salt = process.env.SALT;
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_EMAIL, {
      expiresIn: "20m",
    });

    const hashedToken = await bcrypt.hash(token, salt);
    user.verificationToken = hashedToken;
    await user.save();

    return { status: true, token: token };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

//verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationCode } = req.params;
  if (!verificationCode) {
    return res.status(422).json({
      status: false,
      message: "Please provide verification code",
    });
  }

  try {
    const decoded = jwt.verify(verificationCode, process.env.SECRET_EMAIL);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    //hash token
    const salt = process.env.SALT;
    const hashedToken = bcrypt.hash(verificationCode, salt);

    const isTokenValid = bcrypt.compare(hashedToken, user.verificationToken);
    if (!isTokenValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const sendEmailVerification = async (to) => {
  try {
    const subject = "Email Verification";
    const emailtoken = await generateEmailToken(to);
    if (!emailtoken.status) {
      return {
        status: false,
        message: "Failed to generate email token",
        error: emailtoken.message,
      };
    }
    const verificationLink = `${process.env.BASE_URL}/api/users/auth/verify/${emailtoken.token}`;
    const html = htmlEmailTemplate(verificationLink);
    const mailres = await sendMail(to, subject, html);
    if (mailres.success) {
      return { status: true, message: "Email sent successfully", token: emailtoken.token };
    } else {
      return { status: false, error: mailres.error };
    }
  } catch (error) {
    return { status: false, error: error.message };
  }
};

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

  const newUser = new User({ username, email, password: hashedPassword, isPasswordChanged: false });

  try {
    //create jwt token
    // const accessToken = generateAccessToken(res, newUser._id);
    const refreshToken = generateRefreshToken(res, newUser._id);

    //save user in db
    await newUser.save();

    if (refreshToken) {
      //send verification email
      const emailVerification = await sendEmailVerification(email);
      if (!emailVerification.status) {
        return res.status(400).json({
          status: false,
          message: "Failed to send verification email",
          results: emailVerification.error,
        });
      }

      return res.status(201).json({
        status: true,
        message:
          "User created successfully. Kindly check your inbox to verify your email",
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
          return res.status(400).json({
            status: false,
            message: "Error generating token. Login failed",
          });
        }
      }else{
        return res.status(400).json({
          status: false,
          message: "Invalid credentials",
        });
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
    user.isAdmin = req.body.isAdmin || user.isAdmin;

    //should not update password here. should be through email
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      status: true,
      results: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
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
      status: true,
      results: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});


//send reset password email
const sendResetPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({
      status: false,
      message: "Please provide email",
    });
  }
  const user = await User.findOne({ email });
  if (!user || (user.verificationToken !== undefined && user.isPasswordChanged)) {
    return res.status(400).json({ status: false, message: "User not found or user already changed password" });
  }
  //generate reset password token
  const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_EMAIL, {
    expiresIn: "20m",
  });
  //hash token
  const salt = process.env.SALT;
  const hashedToken = await bcrypt.hash(resetToken, salt);
  user.verificationToken = hashedToken;
  user.isPasswordChanged = false;
  await user.save();
  //send email
  const resetLink = `${process.env.BASE_URL}/api/users/auth/reset/${resetToken}`;
  const html = resetPasswordTemplate(resetLink);
  const subject = "Reset Password";
  const mailResponse = await sendMail(email, subject, html);
  if (mailResponse.success) {
    return res.status(200).json({
      status: true,
      message: "A link has been sent to your email to change your password",
    });
  } else {
    return res.status(400).json({
      status: false,
      message: "Failed to send reset password email",
      error: mailResponse.error,
    });
  }

});

//validate and change password
const changePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(422).json({
      status: false,
      message: "Please provide password",
    });
  }
  const token = req.params.resetToken;
  if (!token) {
    return res.status(422).json({
      status: false,
      message: "Please provide token",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_EMAIL);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }


    const isTokenValid = await bcrypt.compare(token, user.verificationToken);
    if (!isTokenValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired verification code",
      });
    }

    //update password
    const passsalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, passsalt);
    user.password = hashedPassword;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
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
  resendVerification,
  verifyEmail,
  sendResetPasswordEmail,
  changePassword
};

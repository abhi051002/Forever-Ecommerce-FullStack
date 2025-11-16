import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../config/sendMail.js";
import registerOtpTemplate from "../templates/registerOtpTemplate.js";
import loginOtpTemplate from "../templates/loginOtpTemplate.js";
import resendRegisterOtpTemplate from "../templates/resendRegisterOtpTemplate.js";
import resendLoginOtpTemplate from "../templates/resendLoginOtpTemplate.js";
import crypto from "crypto";
import { changePasswordTemplate } from "../templates/changePasswordTemplate.js";
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 🧑‍💻 User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.isVerified)
      return res.json({ success: false, message: "Email not verified" });

    // Compare passwords
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail(
      user.email,
      "Your Login OTP",
      loginOtpTemplate(otp, user.name)
    );
    res.json({
      success: true,
      message: "OTP sent",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 🧾 User Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email Already Take!!" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/^[A-Z]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must start with a capital letter",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.json({
        success: false,
        message:
          "Password must contain at least one special symbol (e.g. @, #, $, %)",
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one number",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    // Save new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    const user = await newUser.save();

    await sendMail(email, "Verify Your Email", registerOtpTemplate(otp, name));

    res.json({
      success: true,
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error registering user" });
  }
};

const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await userModel.findById(userId);
  if (!user) return res.json({ success: false, message: "User not found" });

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
};

// 👑 Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 🔁 Change Password
const changePassword = async (req, res) => {
  try {
    const { email, password, reenterpassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      return res.json({
        success: false,
        message: "New password should not be same as current password.",
      });
    }

    if (password !== reenterpassword) {
      return res.json({
        success: false,
        message: "Two passwords must be the same.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reenterpassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await userModel.findById(userId);
  if (!user) return res.json({ success: false, message: "User not found" });

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    success: true,
    message: "Login successful",
    token,
  });
};

const resendRegisterOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail(
      user.email,
      "New Email Verification OTP",
      resendRegisterOtpTemplate(otp, user.name)
    );

    res.json({ success: true, message: "New OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to resend OTP" });
  }
};

const resendLoginOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.isVerified)
      return res.json({ success: false, message: "Email not verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail(
      user.email,
      "New Login OTP",
      resendLoginOtpTemplate(otp, user.name)
    );

    res.json({ success: true, message: "New login OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to resend login OTP" });
  }
};

// POST /api/user/forgot
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Always respond with the same message (no user enumeration)
    const genericMsg =
      "If an account exists for this email, you’ll receive a reset link shortly.";

    if (!email) return res.json({ success: true, message: genericMsg });

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: genericMsg });
    }

    // Create raw token and hashed token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hashed;
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build frontend link
    const frontendBase =
      process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
    const link = `${frontendBase}/set-password?token=${rawToken}`;

    await sendMail(
      email,
      "Reset Your Password",
      resetPasswordTemplate(user.name || "there", link)
    );

    return res.json({ success: true, message: genericMsg });
  } catch (err) {
    console.error(err);
    return res.json({
      success: true, // still generic
      message:
        "If an account exists for this email, you’ll receive a reset link shortly.",
    });
  }
};

// POST /api/user/reset-password
const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.json({ success: false, message: "Invalid request" });
    }
    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }
    // Basic password rules (match your register rules if you want)
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      passwordResetToken: hashed,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    // Prevent reuse
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    await sendMail(
      user.email,
      "Your Password Has Been Changed Successfully",
      changePasswordTemplate(user.name)
    );
    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong" });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  changePassword,
  verifyOTP,
  verifyLoginOTP,
  resendLoginOTP,
  resendRegisterOTP,
  requestPasswordReset,
  resetPasswordWithToken
};

import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  changePassword,
  verifyOTP,
  verifyLoginOTP,
  resendRegisterOTP,
  resendLoginOTP,
  requestPasswordReset,
  resetPasswordWithToken,
  googleAuth,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
// userRouter.post("/forgot", changePassword);
userRouter.post("/verify-email", verifyOTP);
userRouter.post("/verify-login-otp", verifyLoginOTP);
userRouter.post("/resend-email-otp",resendRegisterOTP);
userRouter.post("/resend-login-otp",resendLoginOTP);
userRouter.post("/auth/google",googleAuth);

userRouter.post("/forgot", requestPasswordReset);
userRouter.post("/reset-password", resetPasswordWithToken);

export default userRouter;

import express, { Router } from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPasswordOtp,
} from "../controller/auth.controller.js";

const router: Router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-otp", verifyUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyUserForgotPasswordOtp);
router.post("/reset-password", resetPassword);

export default router;

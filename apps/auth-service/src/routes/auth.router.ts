import express, { Router } from "express";
import {
  addUserAddress,
  changePassword,
  createstripeConnectLink,
  deleteUserAddress,
  forgotPassword,
  getSeller,
  getUser,
  getUserAddresses,
  login,
  loginAdmin,
  loginSeller,
  refreshToken,
  registerSeller,
  resetPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPasswordOtp,
} from "../controller/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { createShop, verifySeller } from "../utils/auth.helper.js";
import { isSeller } from "../middleware/authorizedRoles.js";

const router: Router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-otp", verifyUser);
router.post("/login", login);

router.post("/refresh-token-user", refreshToken);
router.get("/loggedin-user", isAuthenticated, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyUserForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createstripeConnectLink);
router.post("/login-seller", loginSeller);
router.post("/login-admin", loginAdmin);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

export default router;

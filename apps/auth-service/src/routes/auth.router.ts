import express, { Router } from "express";
import {
  login,
  userRegistration,
  verifyUser,
} from "../controller/auth.controller.js";

const router: Router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login", login);

export default router;

import express, { Router } from "express";
import { userRegistration, verifyUser } from "../controller/auth.controller.js";

const router: Router = express.Router();

router.post("/register", userRegistration);
router.post("/verify-user", verifyUser);

export default router;

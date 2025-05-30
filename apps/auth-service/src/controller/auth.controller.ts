import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";
import { BadRequestError } from "../../../../packages/errorHandler";
import prisma from "../../../../packages/libs/prisma";

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { email, name } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("User already exists with this email");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return next(error);
  }
};

//Verify User with opt
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp || !name || !password) {
      throw new BadRequestError("Missing required fields");
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("User already exists with this email");
    }
    verifyOtp(email, otp, next);

    const hashedPasswrd = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPasswrd,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

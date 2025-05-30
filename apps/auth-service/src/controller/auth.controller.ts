import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
  verifyResetPasswordOtp,
} from "../utils/auth.helper";
import {
  BadRequestError,
  ValidationError,
} from "../../../../packages/errorHandler";
import prisma from "../../../../packages/libs/prisma";
import { setCookies } from "../utils/cookies/setCookies";

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

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestError("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // store refresh token on http cecret cookie
    setCookies(res, "refreshToken", refreshToken);
    setCookies(res, "accessToken", refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return next(err);
  }
};

// user forgot password
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

//verify user otp
export const verifyUserForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyResetPasswordOtp(res, req, next);
  } catch (err) {
    next(err);
  }
};

//Reset User Password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ValidationError("Email and password are required! ");
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError("User Not fould!");
    }

    //compare password with old one is they same  ---------------
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      throw new ValidationError("You can not put your old password!");
    }

    const hasedNewPasswprd = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hasedNewPasswprd },
    });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    return next(err);
  }
};

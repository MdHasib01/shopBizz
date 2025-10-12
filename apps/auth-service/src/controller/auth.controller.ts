import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
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

    await verifyOtp(email, otp, next);

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
    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");
    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "user",
      },
      process.env.ACCESS_TOKEN_SECRET! as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "user",
      },
      process.env.REFRESH_TOKEN_SECRET! as string,
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

// refresh Token user
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refreshToken"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    console.log(refreshToken);
    if (!refreshToken) {
      throw new BadRequestError("Missing refresh token");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id) {
      throw new JsonWebTokenError("Invalid refresh token");
    }
    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      throw new BadRequestError("User not found");
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    if (decoded.role === "user") setCookies(res, "accessToken", newAccessToken);
    else if (decoded.role === "seller")
      setCookies(res, "seller-access-token", newAccessToken);

    req.role = decoded.role;

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};

// Get loggedin User info
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { password, ...userData } = user;
    return res.status(200).json({ user: userData });
  } catch (err) {
    return next(err);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;
    validateRegistrationData(req.body, "seller");

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    return next(error);
  }
};

//create stripe connect acccount link
export const createstripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      throw new ValidationError("Seller Id is required!");
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new ValidationError("Seller is not available with this id!");
    }
    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        stripeId: account.id,
      },
    });

    const acccountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3001/success`,
      return_url: `http://localhost:3001/success`,
      type: "account_onboarding",
    });
    res.json({ url: acccountLink.url });
  } catch (error) {
    next(error);
  }
};

//Login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      throw new ValidationError("Invalid Credentials");
    }

    const isPasswordMatch = await bcrypt.compare(password, seller.password!);
    if (!isPasswordMatch) {
      throw new ValidationError("Invalid Password");
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: seller.id,
        email: seller.email,
        role: "seller",
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        email: seller.email,
        role: "seller",
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    setCookies(res, "seller-refresh-token", refreshToken);
    setCookies(res, "seller-access-token", accessToken);

    res.status(200).json({
      message: "Login Successful!",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    next(error);
  }
};

// get loggedin seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const { password, ...sellerData } = seller;
    res.status(201).json({
      success: true,
      seller: sellerData,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    next(error);
  }
};

// Add new Address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      throw new ValidationError("All fields are required!");
    }

    if (!isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      const newAddress = await prisma.address.create({
        data: {
          userId,
          label,
          name,
          street,
          city,
          zip,
          country,
          isDefault: true,
        },
      });
      res.status(201).json({ success: true, address: newAddress });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const { addressId } = req.params;
    if (!addressId) {
      throw new ValidationError("Address id is required!");
    }

    const existtingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existtingAddress) {
      throw new ValidationError("Address not found!");
    }
    await prisma.address.delete({ where: { id: addressId, userId } });
    res.status(200).json({ success: true, message: "Address deleted!" });
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ValidationError } from "../../../../packages/errorHandler";
import { NextFunction, Request, Response } from "express";
import { sendEmail } from "./sendMail/index";
import redis from "../../../../packages/libs/redis/index";
import prisma from "../../../../packages/libs/prisma";

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { email, name, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Your account is locked due to multiple failed attempts. Try after 30 minutes"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError("Too many otp requests, please wait 1 hour!")
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(new ValidationError("Please wait for 1 minute!"));
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    return next(
      new ValidationError("Too many otp requests, please wait 1 hour!")
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);
};
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "OTP Verification", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
  return otp;
};

// Verify Opt
export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("Invalid or expired OTP");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
      throw new ValidationError(
        "Your account is locked due to multiple failed attempts. Try after 30 minutes"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 3600);
    throw new ValidationError(
      `Invalid OTP. You have ${2 - failedAttempts} attempts left`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
//handle forgot password ----
export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Missing required fields");
    }

    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError("User not found");
    }

    // Check opt restriction
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    //Generate OTP and send to user
    await sendOtp(
      user.name,
      email,
      userType === "user" ? "user-activation-mail" : "user-activation-mail"
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    return next(error);
  }
};

//Verify resetpassword otp
export const verifyResetPasswordOtp = async (
  res: Response,
  req: Request,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Email and oto required!");
    }
    await verifyOtp(email, otp, next);

    res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    next(err);
  }
};

// verify seller with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, phone_number, country, password } = req.body;
    if (!email || !otp || !name || !password || !phone_number || !country) {
      throw new ValidationError("Missing required fields");
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(new ValidationError("Seller already exists"));
    }
    await verifyOtp(email, otp, next);

    const hashedPasswrd = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        email,
        name,
        password: hashedPasswrd,
        country,
        phone_number,
      },
    });
    res.status(200).json({ seller, message: "Seller registered successfully" });
  } catch (error) {
    next(error);
  }
};

// create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      throw new ValidationError("Missing required fields");
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") shopData.website = website;
    const shop = await prisma.shops.create({ data: shopData });
    res.status(200).json({ shop, message: "Shop created successfully" });
  } catch (error) {
    next(error);
  }
};

// create stripe connect account link

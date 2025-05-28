import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { BadRequestError } from "../../../../packages/errorHandler";

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateRegistrationData(req.body, "user");
  const { email, name, password, phone_number, country } = req.body;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError("User already exists with this email");
  }

  const user = await prisma.users.create({
    data: { email, name, password, phone_number, country, role: "user" },
  });
  res.json(user);
};

import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["accessToken"] ||
      req.cookies["seller-access-token"] ||
      req.cookies["access_token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized! No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET! as string
    ) as { id: string; role: "user" | "seller" | "admin" };
    console.log("token", token);
    console.log(" decoded", decoded);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized! Invalid token" });
    }

    let account;

    if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account!;
    } else {
      const userAccount = await prisma.users.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          following: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });

      if (!userAccount || userAccount.role !== decoded.role) {
        return res
          .status(401)
          .json({ error: "Unauthorized! Account not found" });
      }

      account = userAccount;
      if (decoded.role === "admin") {
        req.admin = { ...userAccount, role: decoded.role };
      } else {
        req.user = { ...userAccount, role: decoded.role };
      }
    }

    if (!account) {
      return res.status(401).json({ error: "Unauthorized! Account not found" });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized! Invalid token" });
  }
};

export default isAuthenticated;

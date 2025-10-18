import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";
const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["accessToken"] ||
      req.cookies["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized! No token provided" });
    }
    console.log("decodning ....");
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET! as string
    ) as { id: string; role: "user" | "seller" };

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized! Invalid token" });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account!;
    } else {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account!;
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

import { NextFunction, Response } from "express";
import { UnauthorizedError } from "../errorHandler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  console.log(req.role);
  if (req.role !== "seller") {
    return next(new UnauthorizedError("Access Denied: Seller Only"));
  }
  next();
};
export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new UnauthorizedError("Access Denied: user Only"));
  }
  next();
};

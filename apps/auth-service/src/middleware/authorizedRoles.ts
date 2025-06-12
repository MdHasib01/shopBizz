import { NextFunction, Response } from "express";
import { UnauthorizedError } from "../../../../packages/errorHandler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new UnauthorizedError("Access Denied: Seller Only"));
  }
};
export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new UnauthorizedError("Access Denied: user Only"));
  }
};

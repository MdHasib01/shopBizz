// get product category

import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/errorHandler";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Site config not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

//Create Discount Codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode, sellerId } =
      req.body;

    const isDiscountCodeExists = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExists) {
      return next(
        new ValidationError(
          "Discount code already available. Please try another one."
        )
      );
    }

    const discount_codes = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    return res.status(200).json({ success: true, discount_codes });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    return res.status(200).json({ success: true, discount_codes });
  } catch (error) {
    next(error);
  }
};

//delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const discount_code = await prisma.discount_codes.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discount_code) {
      return next(new ValidationError("Discount code not found"));
    }

    if (discount_code.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }
    const discount_codes = await prisma.discount_codes.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, discount_codes });
  } catch (error) {
    next(error);
  }
};

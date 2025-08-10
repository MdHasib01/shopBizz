// get product category

import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/errorHandler";
import { Prisma } from "@prisma/client";

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

//create Product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;
    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price ||
      !stock
    ) {
      return next(new ValidationError("Missing required fields"));
    }

    if (!req.seller.id) {
      return next(new ValidationError("Only seller can create products!"));
    }

    const isSlugAvailable = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (isSlugAvailable !== null) {
      return next(
        new ValidationError("Slug already exist! please use a different slug!")
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        custom_specifications,
        slug,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        cash_on_delivery,
        brand,
        video_url,
        category,
        colors: colors || [],
        sizes: sizes || [],
        discount_codes: discountCodes.map((codeId: string) => codeId),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        subCategory,
        custom_properties: customProperties || {},
        stock: parseInt(stock),
        shopId: req?.seller?.shop?.id,
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((image: any) => ({
              file_id: image?.fileId,
              url: image?.file_url,
            })),
        },
      },
      include: { images: true },
    });
    res.json({ success: true, product: newProduct });
  } catch (error) {
    next(error);
  }
};

// get products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller.shop.id;
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product already deleted"));
    }
    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    res.json({
      message:
        "Product is scheduled for deletion in 24 hours. You can restore it in 24 hours",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

//restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller.shop.id;
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }
    if (!product.isDeleted) {
      return next(new ValidationError("Product is not deleted"));
    }
    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    res.json({
      message: "Product restored successfully",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    // Option 1: No filter - get all products
    const baseFilter = {
      isDeleted: { not: true }, // Only exclude deleted products
      status: "Active", // Only get active products
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { createdAt: "asc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        orderBy,
      }),
      prisma.products.count({
        where: baseFilter,
      }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        include: {
          images: true,
          shop: true,
        },
        orderBy,
      }),
    ]);

    res.json({
      success: true,
      products,
      total,
      top10Products,
      top10By: type === "latest" ? "latest" : "topSales", // Fixed typo
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
};

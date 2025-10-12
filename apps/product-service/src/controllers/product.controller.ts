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
export const getAllEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [
        {
          starting_date: { not: null },
        },
        { ending_date: { not: null } },
      ],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
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
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      events,
      total,
      top10BySales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching Events:", error);
    next(error);
  }
};

export const getProductDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    console.log("slug====", slug);
    const product = await prisma.products.findUnique({
      where: {
        slug: slug,
      },
      include: {
        images: true,
        shop: true,
      },
    });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const getFilteredProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map((v) => Number(v.trim()))
        : Array.isArray(priceRange) && priceRange.length === 2
        ? [Number(priceRange[0]), Number(priceRange[1])]
        : [0, 10000];

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 12);
    const skip = (parsedPage - 1) * parsedLimit;

    const toArray = (v: any) =>
      Array.isArray(v)
        ? v
        : String(v)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
    };

    const categoryList = toArray(categories);
    if (categoryList.length) {
      filters.category = { in: categoryList };
    }

    const sizeList = toArray(sizes);
    if (sizeList.length) {
      filters.sizes = { hasSome: sizeList };
    }

    const colorList = toArray(colors);
    if (colorList.length) {
      filters.colors = { hasSome: colorList };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({
        where: filters,
      }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFilteredEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.size = {
        in: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.color = {
        in: Array.isArray(colors) ? colors : [colors],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({
        where: filters,
      }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getFilteredShops = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && (countries as string[]).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : [countries],
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          followers: true,
          products: true,
        },
      }),
      prisma.shops.count({
        where: filters,
      }),
    ]);

    res.json({
      success: true,
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Top shops
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topshopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 10,
    });

    const shopIds = topshopsData.map((item: any) => item.shopId);
    const topShops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        coverBanner: true,
        avatar: true,
        followers: true,
        address: true,
        ratings: true,
        category: true,
      },
    });

    const enrichedTopShops = topShops.map((shop) => {
      const salesData = topshopsData.find(
        (item: any) => item.shopId === shop.id
      );

      return {
        ...shop,
        sales: salesData?._sum?.total ?? 0,
      };
    });

    const top10Shops = enrichedTopShops
      .sort((a: any, b: any) => b.totalSales - a.totalSales)
      .slice(0, 10);

    res.json({ success: true, top10Shops });
  } catch (error) {
    next(error);
  }
};

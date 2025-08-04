import { NextFunction, Request, Response } from "express";
import { imagekit } from "../../../../packages/libs/imagekit";

//Upload Product Image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    return res
      .status(200)
      .json({ file_url: response.url, fileName: response.fileId });
  } catch (error) {
    next(error);
  }
};

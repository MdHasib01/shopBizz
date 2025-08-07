import express, { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated";
import {
  deleteProductImage,
  uploadProductImage,
} from "../controllers/productImage.controller";

const router: Router = express.Router();

router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);

export default router;

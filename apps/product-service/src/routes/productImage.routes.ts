import express, { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated";
import { uploadProductImage } from "../controllers/productImage.controller";

const router: Router = express.Router();

router.post("/upload-product-image", isAuthenticated, uploadProductImage);

export default router;

import express, { Router } from "express";
import {
  createDiscountCodes,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
} from "../controllers/product.controller";
const router: Router = express.Router();
import isAuthenticated from "../middleware/isAuthenticated";

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
export default router;

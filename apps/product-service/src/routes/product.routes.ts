import express, { Router } from "express";
import { getCategories } from "../controllers/product.controllers";
const router: Router = express.Router();

router.get("/get-categories", getCategories);
export default router;

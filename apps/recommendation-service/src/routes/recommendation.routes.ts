import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import { getRecommendedProducts } from "../controllers/recommendation.controller";
const router: Router = express.Router();

router.get(
  "/get-recommended-products",
  isAuthenticated,
  getRecommendedProducts
);

export default router;

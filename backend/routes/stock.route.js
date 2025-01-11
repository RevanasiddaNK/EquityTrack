import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addStock, sellStocks , getStocks } from "../controllers/stock.controller.js";

const router = express.Router();


router.route("/user/:userId").get(getStocks); 
router.route("/add/:userId").post(isAuthenticated, addStock);
router.route("/sell/:userId").post(isAuthenticated, sellStocks);

export default router;

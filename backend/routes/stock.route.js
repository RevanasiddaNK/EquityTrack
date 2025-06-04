import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";  // Ensure the path is correct
import { addStock, sellStocks} from "../controllers/stock.controller.js";  // Ensure the path is correct
import {fetchStockData} from "../utils/data.js"

const router = express.Router();



// Add stock to user's portfolio
router.route("/add/:userId").post(isAuthenticated, addStock);

// Sell stock from user's portfolio
router.route("/sell/:userId").post(isAuthenticated, sellStocks);

// Fetch stock data
router.route('/stocks/fetch').get(fetchStockData);

export default router;

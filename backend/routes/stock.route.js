import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addStock, deleteStock, getStocks } from "../controllers/stock.controller.js";

const router = express.Router();


router.route("/user/:userId").get(getStocks); // Get all available stocks
router.route("/add/:userId").post(isAuthenticated, addStock); // Add stock for a user
router.route("/sell/:userid").delete(isAuthenticated, deleteStock); // Delete a stock

export default router;

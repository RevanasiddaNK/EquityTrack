import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addStock, deleteStock, getStocks,getUserStocks } from "../controllers/stock.controller.js";

const router = express.Router();
router.route("/").get(getStocks); // Get all available stocks
router.route("/add/:userId").post(isAuthenticated, addStock); // Add stock for a user
router.route("/user/:userId").get(isAuthenticated, getUserStocks); // Get user's purchased stocks
// router.route("/:id").put(isAuthenticated, updateStock); // Update a stock
router.route("/sell/:userid").delete(isAuthenticated, deleteStock); // Delete a stock

export default router;

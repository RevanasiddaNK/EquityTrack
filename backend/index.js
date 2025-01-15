import express from "express";
const app = express();

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import { fetchStockData } from './utils/data.js';
import userRoute from "./routes/user.route.js";
import stockRoute from "./routes/stock.route.js";
import './cronJobs/stockCron.js';
import path from "path";
const __dirname = path.resolve()

dotenv.config({});

import 'dotenv/config';



const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use("/api/v1/user", userRoute);
app.use("/api/v1/stocks", stockRoute);


const PORT = process.env.PORT || 10000;

const runOnceOnServerStart = async () => {
    console.log("Fetching stock data as backend starts...");
    try {
        await fetchStockData();  // Fetch the stock data immediately on server startup
    } catch (error) {
        console.error("Error fetching stock data on server start:", error);
    }
};

// Trigger the stock data fetching function once when the server starts
runOnceOnServerStart();



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    });
}



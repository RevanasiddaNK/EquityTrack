import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
dotenv.config({});
import userRoute from "./routes/user.route.js";
import stockRoute from "./routes/stock.route.js";
import stockPriceRoute from "./routes/stockprice.route.js";
import fetch from "node-fetch";


const app = express();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


const corsOptions = {
    origin: 'http://localhost:5173', // Allow only your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // If you need to send cookies or authorization headers
};

// Apply the CORS middleware with your options
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/stocks", stockRoute);
app.use("/api/v1/stock-price", stockPriceRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port ${PORT}`);
})


import express from "express";
import http from "http";
import { Server } from "socket.io"; 
const app = express();
const server = http.createServer(app);

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import stockRoute from "./routes/stock.route.js";
import './cronJobs/stockCron.js';
import { fetchStockData } from "./utils/data.js";
import path from "path";
const __dirname = path.resolve()

import { User } from "./models/user.model.js";
import { Stock } from "./models/stock.model.js";
import { UserStock } from "./models/userStock.model.js";
import { handleGetStocksSocket } from './controllers/stockSocketController.js';


dotenv.config({});

import 'dotenv/config';



const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // if you use cookies
}));



app.use("/api/v1/user", userRoute);
app.use("/api/v1/stocks", stockRoute);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('subscribeToStocks', ({ userId }) => {
    console.log(`User ${userId} subscribed to stocks`);
    handleGetStocksSocket(socket, userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const fetchStockDataOnStart = async () => {
    console.log("Fetching stock data as the backend starts...");
    const result = await fetchStockData();
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});



if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

app.delete("/delete", async (req, res) => {
    await User.deleteMany({});
    await Stock.deleteMany({});
    await UserStock.deleteMany({});

    console.log("Delete finished")
    return res.status(200).json({ success: true, message : "All data in stocks deleted" });
});




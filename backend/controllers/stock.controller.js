import { Stock } from "../models/stock.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";

// Add Stock to User's Portfolio
export const addStock = async (req, res) => {
  const { userId } = req.params;

  try {
    const { name, ticker, quantity, buyPrice } = req.body;

    // Create the stock
    const stock = await Stock.create({ name, ticker, quantity, buyPrice, user: userId });

    // Find the user and add the stock reference
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.stocks.push(stock._id);
    await user.save();

    res.status(201).json({ message: "Stock added successfully", stock });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Available Stocks (With Real-Time Prices)
export const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock.ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        );

        const realTimeData = response.data["TIME_SERIES_INTRADAY"];
        const currentPrice = realTimeData ? parseFloat(realTimeData["05. price"]) : null;

        return {
          ...stock._doc,
          currentPrice,
        };
      })
    );

    res.json(updatedStocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Stocks for a Specific User
export const getUserStocks = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("stocks");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Stock
// export const updateStock = async (req, res) => {
//   try {
//     const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!stock) return res.status(404).json({ error: "Stock not found" });

//     res.json({ message: "Stock updated successfully", stock });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Delete Stock
export const deleteStock = async (req, res) => {
  try {
    console.log(req.params.userid);
    const stock = await Stock.findByIdAndDelete(req.params.userid);
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    // Remove the stock reference from the user's array
    const user = await User.findById(stock.user);
    if (user) {
      user.stocks = user.stocks.filter((stockId) => stockId.toString() !== stock._id.toString());
      await user.save();
    }

    res.status(204).json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

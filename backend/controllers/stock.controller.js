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

/*
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
*/

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

export const getStocks = async (req, res) => {
  try {
    // Original array of stocks
    const stocks = [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "date": "2025-01-10",
        "open": "240.0100",
        "high": "240.1600",
        "low": "233.0000",
        "close": "236.8500",
        "volume": "61710856"
      },
      {
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "date": "2025-01-10",
        "open": "424.6300",
        "high": "424.7100",
        "low": "415.0200",
        "close": "418.9500",
        "volume": "20201132"
      },
      {
        "symbol": "GOOGL",
        "name": "Alphabet Inc. (Google)",
        "date": "2025-01-10",
        "open": "194.2950",
        "high": "196.5200",
        "low": "190.3100",
        "close": "192.0400",
        "volume": "26665206"
      },
      {
        "symbol": "AMZN",
        "name": "Amazon.com, Inc.",
        "date": "2025-01-10",
        "open": "221.4600",
        "high": "221.7100",
        "low": "216.5000",
        "close": "218.9400",
        "volume": "36811525"
      },
      {
        "symbol": "TSLA",
        "name": "Tesla, Inc.",
        "date": "2025-01-10",
        "open": "391.4000",
        "high": "399.2800",
        "low": "377.2900",
        "close": "394.7400",
        "volume": "61495260"
      }
    ];

    // Function to generate a random price between low and high
    const getRandomPrice = (low, high) => {
      return (Math.random() * (high - low) + low).toFixed(2); // Random price between low and high
    };

    // Function to transform the array with random prices between low and high
    const transformStocks = (stocks) => {
      return stocks.map((stock, index) => ({
        id: (index + 1).toString(), // Generate a sequential ID
        name: stock.name,           // Use the existing name
        ticker: stock.symbol,       // Map symbol to ticker
        price: getRandomPrice(parseFloat(stock.low), parseFloat(stock.high)) // Random price between low and high
      }));
    };

    // Transform the stocks and prepare the response
    const availableStocks = transformStocks(stocks);
    console.log("Fetching stocks...");
    // Return the transformed stocks as JSON
    return res.json(availableStocks);

  } catch (error) {
    // Handle the error and return an error message
    console.error('Error fetching stocks:', error);
    console.log(" Error at Fetching stocks controller...");
    return res.status(500).json({ message: 'Failed to fetch stocks' });
  }
};

import { Stock } from "../models/stock.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";

// Add Stock to User's Portfolio
export const addStock = async (req, res) => {
  console.log("Adding Stock to Portfolio");

  try {
    const { userId } = req.params;
    

    const {
      name, ticker, shares, 
      avg_price, mkt_price, current, 
      invested, returns, returnsPercentage
    } = req.body;
    console.log("ticker: " + ticker);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if stock with the same ticker exists
    let stock = await Stock.findOne({ ticker, user: userId });

    if (stock) {
      // Stock already exists, update its details
      const newShares = stock.shares + shares; // Add new shares to existing shares
      const newInvested = stock.invested + invested; // Add new invested amount to existing invested
      const newAvgPrice = newInvested / newShares; // Recalculate average price
      const newCurrent = newShares * mkt_price; // Recalculate current value
      const newReturns = newCurrent - newInvested; // Recalculate returns
      const newReturnsPercentage = (newReturns / newInvested) * 100; // Recalculate returns percentage

      // Update stock
      stock.shares = newShares;
      stock.avg_price = newAvgPrice;
      stock.invested = newInvested;
      stock.current = newCurrent;
      stock.returns = newReturns;
      stock.returnsPercentage = newReturnsPercentage;
      stock.mkt_price = mkt_price;

      await stock.save();

      return res.status(200).json({ success: true, message: "Stock updated successfully", stock });
    }

    // If stock does not exist, create a new one
    stock = await Stock.create({
      name,
      ticker,
      shares,
      avg_price,
      mkt_price,
      current,
      invested,
      returns,
      returnsPercentage,
      user: userId,
    });

    // Add stock to user's portfolio
    user.stocks.push(stock._id);
    await user.save();

    res.status(201).json({ success: true, message: "Stock added successfully", stock });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
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

/*
export const getStocks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Original array of stocks
    const stocks = [
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "date": "2025-01-10",
        "open": "240.0100",
        "high": "240.1600",
        "low": "233.0000",
        "close": "236.8500",
        "volume": "61710856"
      },
      {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "date": "2025-01-10",
        "open": "424.6300",
        "high": "424.7100",
        "low": "415.0200",
        "close": "418.9500",
        "volume": "20201132"
      },
      {
        "ticker": "GOOGL",
        "name": "Alphabet Inc. (Google)",
        "date": "2025-01-10",
        "open": "194.2950",
        "high": "196.5200",
        "low": "190.3100",
        "close": "192.0400",
        "volume": "26665206"
      },
      {
        "ticker": "AMZN",
        "name": "Amazon.com, Inc.",
        "date": "2025-01-10",
        "open": "221.4600",
        "high": "221.7100",
        "low": "216.5000",
        "close": "218.9400",
        "volume": "36811525"
      },
      {
        "ticker": "TSLA",
        "name": "Tesla, Inc.",
        "date": "2025-01-10",
        "open": "391.4000",
        "high": "399.2800",
        "low": "377.2900",
        "close": "394.7400",
        "volume": "62287333"
      }
    ];

    // Function to generate a random price between low and high
    const getRandomPrice = (low, high) => {
      return (Math.random() * (high - low) + low).toFixed(2); // Random price between low and high
    };

    // Transform stocks with random prices
    const transformStocks = (stocks) => {
      return stocks.map((stock, index) => ({
        id: (index + 1).toString(), // Sequential ID
        name: stock.name,           // Use the existing name
        ticker: stock.ticker,       // Corrected to ticker
        avg_price: getRandomPrice(parseFloat(stock.low), parseFloat(stock.high)) // Random price
      }));
    };

    // Get random current prices for available stocks
    const availableStocks = transformStocks(stocks);

    // Find user's owned stocks from the database
    const user = await User.findById(userId).populate("stocks");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user's stocks with the current market price and recalculate returns
    user.stocks = user.stocks.map((ownedStock) => {
      // Normalize the ticker for comparison (to uppercase and trim whitespace)
      const ownedTicker = ownedStock.ticker.trim().toUpperCase();

      const currentStock = availableStocks.find(stock => stock.ticker.toUpperCase() === ownedTicker);

      if (currentStock) {
        const newMktPrice = parseFloat(currentStock.price); // Get current market price
        const newCurrentValue = newMktPrice * ownedStock.shares; // Recalculate current value
        const newReturns = newCurrentValue - ownedStock.invested; // Recalculate returns
        const newReturnsPercentage = (newReturns / ownedStock.invested) * 100; // Recalculate returns percentage

        // Update the owned stock values explicitly
        ownedStock.set({
          mkt_price: newMktPrice,
          current: newCurrentValue,
          returns: newReturns,
          returnsPercentage: newReturnsPercentage,
        });
      }

      return ownedStock;
    });

    // Save the updated stocks back to the database
    await user.save();  // Save the entire user document

    // Return both available stocks and user's owned stocks
    res.status(200).json({
      success: true,
      availableStocks,
      ownedStocks: user.stocks  // Return the updated stocks from the user
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch and update stocks" });
  }
};
*/

export const getStocks = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log("Fetching stocks for user:", userId);

    // Original array of stocks
    const stocks = [
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "date": "2025-01-10",
        "open": "240.0100",
        "high": "240.1600",
        "low": "233.0000",
        "close": "236.8500",
        "volume": "61710856"
      },
      {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "date": "2025-01-10",
        "open": "424.6300",
        "high": "424.7100",
        "low": "415.0200",
        "close": "418.9500",
        "volume": "20201132"
      },
      {
        "ticker": "GOOGL",
        "name": "Alphabet Inc. (Google)",
        "date": "2025-01-10",
        "open": "194.2950",
        "high": "196.5200",
        "low": "190.3100",
        "close": "192.0400",
        "volume": "26665206"
      },
      {
        "ticker": "AMZN",
        "name": "Amazon.com, Inc.",
        "date": "2025-01-10",
        "open": "221.4600",
        "high": "221.7100",
        "low": "216.5000",
        "close": "218.9400",
        "volume": "36811525"
      },
      {
        "ticker": "TSLA",
        "name": "Tesla, Inc.",
        "date": "2025-01-10",
        "open": "391.4000",
        "high": "399.2800",
        "low": "377.2900",
        "close": "394.7400",
        "volume": "62287333"
      }
    ];

    // Function to generate a random price between low and high
    const getRandomPrice = (low, high) => {
      return (Math.random() * (high - low) + low).toFixed(2); // Random price between low and high
    };

    // Transform stocks with random prices
    const transformStocks = (stocks) => {
      return stocks.map((stock, index) => ({
        id: (index + 1).toString(), // Sequential ID
        name: stock.name,           // Use the existing name
        ticker: stock.ticker,       // Corrected to ticker
        avg_price: getRandomPrice(parseFloat(stock.low), parseFloat(stock.high)) // Random price
      }));
    };

    // Get random current prices for available stocks
    const availableStocks = transformStocks(stocks);
    //console.log("Available Stocks with Random Prices:", availableStocks);

    // Find user's owned stocks from the database
    const user = await User.findById(userId).populate("stocks");
    //console.log("User's Owned Stocks:", user?.stocks);

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // console.log(`User with ID ${userId} found. Updating stocks...`);

    // Update the user's stocks with the current market price and recalculate returns
    user.stocks = user.stocks.map((ownedStock) => {
      // Normalize the ticker for comparison (to uppercase and trim whitespace)
      const ownedTicker = ownedStock.ticker.trim().toUpperCase();
      //console.log(`Searching for stock with ticker: ${ownedTicker}`);

      const currentStock = availableStocks.find(stock => stock.ticker.toUpperCase() === ownedTicker);
      //console.log("current stock: ", currentStock);

      if (currentStock) {
        const newMktPrice = parseFloat(currentStock.avg_price ); // Get current market price
        const newCurrentValue = newMktPrice * ownedStock.shares; // Recalculate current value
        const newReturns = newCurrentValue - ownedStock.invested; // Recalculate returns
        const newReturnsPercentage = (newReturns / ownedStock.invested) * 100; // Recalculate returns percentage
/*
        console.log(`Updating stock: ${ownedStock.ticker}`);
        console.log(`Old market price: ${ownedStock.mkt_price}, New market price: ${newMktPrice}`);
        console.log(`Old current value: ${ownedStock.current}, New current value: ${newCurrentValue}`);
        console.log(`Old returns: ${ownedStock.returns}, New returns: ${newReturns}`);
        console.log(`Old returns percentage: ${ownedStock.returnsPercentage}, New returns percentage: ${newReturnsPercentage}`);
*/
        // Update the owned stock values explicitly
        ownedStock.set({
          mkt_price: newMktPrice,
          current: newCurrentValue,
          returns: newReturns,
          returnsPercentage: newReturnsPercentage,
        });
      } else {
        console.log(`Stock ${ownedTicker} not found in available stocks`);
      }

      return ownedStock;
    });

    // Save the updated stocks back to the database
    await user.save();  // Save the entire user document

    //console.log(`Stocks updated successfully for user: ${userId}`);

    // Return both available stocks and user's owned stocks
    res.status(200).json({
      success: true,
      availableStocks,
      ownedStocks: user.stocks  // Return the updated stocks from the user
    });

  } catch (error) {
    console.error("Error fetching and updating stocks:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch and update stocks" });
  }
};












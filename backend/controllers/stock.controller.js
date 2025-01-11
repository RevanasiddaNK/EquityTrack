import { Stock } from "../models/stock.model.js";
import { User } from "../models/user.model.js";

export const addStock = async (req, res) => {
  console.log("Adding Stock to Portfolio");

  try {
    const { userId } = req.params;

    const {
      name, ticker, shares,
      avg_price, mkt_price, current,
      invested, returns, returnsPercentage
    } = req.body;



    // Validate that all required fields are numbers
    if (
      isNaN(shares) || 
      isNaN(avg_price) || 
      isNaN(mkt_price) || 
      isNaN(invested) || 
      isNaN(returns) || 
      isNaN(returnsPercentage)
    ) {
      return res.status(400).json({ success: false, error: "Invalid numeric data" });
    }

    // Convert input to numbers if they are strings or undefined
    const sharesNum = parseFloat(shares);
    const avgPriceNum = parseFloat(avg_price);
    const mktPriceNum = parseFloat(mkt_price);
    const investedNum = parseFloat(invested);
    const returnsNum = parseFloat(returns);
    const returnsPercentageNum = parseFloat(returnsPercentage);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if stock with the same ticker exists
    let stock = await Stock.findOne({ ticker, user: userId });

    if (stock) {
      // Stock already exists, update its details
      const newShares = stock.shares + sharesNum;
      const newInvested = stock.invested + investedNum;
      const newAvgPrice = newInvested / newShares;
      const newCurrent = newShares * mktPriceNum;
      const newReturns = newCurrent - newInvested;
      const newReturnsPercentage = (newReturns / newInvested) * 100;

      // Update stock with new values
      stock.shares = parseFloat(newShares.toFixed(2));
      stock.avg_price = parseFloat(newAvgPrice.toFixed(2));
      stock.invested = parseFloat(newInvested.toFixed(2));
      stock.current = parseFloat(newCurrent.toFixed(2));
      stock.returns = parseFloat(newReturns.toFixed(2));
      stock.returnsPercentage = parseFloat(newReturnsPercentage.toFixed(2));
      stock.mkt_price = parseFloat(mktPriceNum.toFixed(2));

      await stock.save();

      return res.status(200).json({ success: true, message: "Stock updated successfully", stock });
    }

    // If stock does not exist, create a new one
    stock = await Stock.create({
      name,
      ticker,
      shares: parseFloat(sharesNum.toFixed(2)),
      avg_price: parseFloat(avgPriceNum.toFixed(2)),
      mkt_price: parseFloat(mktPriceNum.toFixed(2)),
      current: parseFloat((sharesNum * mktPriceNum).toFixed(2)),
      invested: parseFloat((sharesNum * avgPriceNum).toFixed(2)),
      returns: parseFloat(((sharesNum * mktPriceNum) - (sharesNum * avgPriceNum)).toFixed(2)),
      returnsPercentage: parseFloat((((sharesNum * mktPriceNum - sharesNum * avgPriceNum) / (sharesNum * avgPriceNum)) * 100).toFixed(2)),
      user: userId
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


export const sellStocks = async (req, res) => {
  console.log("Inside sellStocks Controller");
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { quantity, stockTicker } = req.body;

    const stock = await Stock.findOne({ ticker: stockTicker });
    // console.log("Selling stock", stock)

    if (!stock) {
      return res.status(404).json({ success: false, error: "Stock not found" });
    }

    if (stock.shares < quantity) {
      return res.status(400).json({
        success: false,
        error: "Insufficient stocks: You don't have enough shares to complete this sale.",
      });
    }

    // Calculate the remaining shares
    const remainingShares = (stock.shares - quantity);
    const current = (stock.current - (quantity * stock.avg_price)).toFixed(2);
    const invested = (stock.invested - (quantity * stock.avg_price)).toFixed(2);
    const returns = (current - invested).toFixed(2);
    

    let returnsPercentage = 0;
    if (invested !== 0) {
      returnsPercentage = ((returns / invested) * 100).toFixed(2);
    }

    if (Math.abs(remainingShares) < 0.01) {  // Use a small tolerance for floating-point comparison
      await Stock.deleteOne({ ticker: stockTicker });
      return res.status(200).json({ success: true, message: "Shares sold successfully" });
    }
    
   

    // Update the stock with the new values
    await Stock.updateOne(
      { ticker: stockTicker },
      {
        $set: {
          shares: remainingShares,
          current: current,
          invested: invested,
          returns: returns,
          returnsPercentage :returnsPercentage || 0
        },
      }
    );

    return res.status(200).json({ success: true, message: "Shares sold successfully" });
  } 
  catch (error) {

    console.log("error at SellingStock Controller: " + error.message)
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getStocks = async (req, res) => {
  try {
    const { userId } = req.params;
    
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
      return (Math.random() * (high - low) + low); // Random price between low and high
    };

    const transformStocks = (stocks) => {
      return stocks.map((stock, index) => ({
        id: (index + 1).toString(),
        name: stock.name,
        ticker: stock.ticker,
        avg_price: parseFloat(getRandomPrice(parseFloat(stock.low), parseFloat(stock.high))).toFixed(2) // Random price
      }));
    };

    const availableStocks = transformStocks(stocks);

    // Find user's owned stocks from the database
    const user = await User.findById(userId).populate("stocks");

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.stocks = user.stocks.map((ownedStock) => {
      const ownedTicker = ownedStock.ticker.trim().toUpperCase();
      const currentStock = availableStocks.find(stock => stock.ticker.toUpperCase() === ownedTicker);

      if (currentStock) {
        const newMktPrice = parseFloat(currentStock.avg_price).toFixed(2); // Ensure price is properly formatted
        const newCurrentValue = (parseFloat(newMktPrice) * ownedStock.shares).toFixed(2); // Calculate current value
        const newReturns = (parseFloat(newCurrentValue) - ownedStock.invested).toFixed(2); // Calculate returns
        const newReturnsPercentage = ((parseFloat(newReturns) / ownedStock.invested) * 100).toFixed(2); // Calculate return percentage

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

    await user.save();

    res.status(200).json({
      success: true,
      availableStocks,
      ownedStocks: user.stocks
    });

  } catch (error) {
    console.error("Error fetching and updating stocks:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch and update stocks" });
  }
};












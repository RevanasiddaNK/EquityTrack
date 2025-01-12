import  {Stock}  from '../models/stock.model.js';
import  {UserStock}  from '../models/userStock.model.js';
import  {User}  from '../models/user.model.js';

export const addStock = async (req, res) => {

  try {
    const { userId } = req.params;
    const { name, ticker, shares, avg_price, mkt_price } = req.body;

    // Validate that numeric fields are numbers
    if (isNaN(shares) || isNaN(avg_price) || isNaN(mkt_price)) {
      return res.status(400).json({ success: false, error: 'Invalid numeric data' });
    }

    // Convert input to numbers
    const sharesNum = parseFloat(shares);
    const avgPriceNum = parseFloat(avg_price);
    const mktPriceNum = parseFloat(mkt_price);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if stock with the same ticker exists in the Stock model
    let stock = await Stock.findOne({ ticker });

    if (!stock) {
      // If the stock doesn't exist, create a new Stock document
      stock = await Stock.create({
        name,
        ticker,
      });
    }

    // Check if the user already has this stock in their portfolio
    let userStock = await UserStock.findOne({ stock: stock._id, user: userId });

    if (userStock) {
      // Update existing UserStock entry
      const newShares = userStock.shares + sharesNum;
      const newInvested = userStock.invested + sharesNum * avgPriceNum;
      const newAvgPrice = newInvested / newShares;
      const newCurrent = newShares * mktPriceNum;
      const newReturns = newCurrent - newInvested;
      const newReturnsPercentage = (newReturns / newInvested) * 100;

      userStock.shares = parseFloat(newShares.toFixed(2));
      userStock.avg_price = parseFloat(newAvgPrice.toFixed(2));
      userStock.invested = parseFloat(newInvested.toFixed(2));
      userStock.current = parseFloat(newCurrent.toFixed(2));
      userStock.returns = parseFloat(newReturns.toFixed(2));
      userStock.returnsPercentage = parseFloat(newReturnsPercentage.toFixed(2));
      userStock.mkt_price = parseFloat(mktPriceNum.toFixed(2));

      await userStock.save();

      return res.status(200).json({ success: true, message: 'Stock updated successfully', userStock });
    }

    // If UserStock entry doesn't exist, create a new one
    userStock = await UserStock.create({
      stock: stock._id,
      user: userId,
      shares: parseFloat(sharesNum.toFixed(2)),
      avg_price: parseFloat(avgPriceNum.toFixed(2)),
      mkt_price: parseFloat(mktPriceNum.toFixed(2)),
      current: parseFloat((sharesNum * mktPriceNum).toFixed(2)),
      invested: parseFloat((sharesNum * avgPriceNum).toFixed(2)),
      returns: parseFloat(((sharesNum * mktPriceNum) - (sharesNum * avgPriceNum)).toFixed(2)),
      returnsPercentage: parseFloat((((sharesNum * mktPriceNum - sharesNum * avgPriceNum) / (sharesNum * avgPriceNum)) * 100).toFixed(2)),
    });

    // Add the stock to the user's portfolio
    user.stocks = user.stocks || [];
    user.stocks.push(userStock._id);
    await user.save();

    res.status(201).json({ success: true, message: 'Stock added successfully', userStock });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sellStocks = async (req, res) => {
  
  try {
    const { userId } = req.params;
    const { quantity, stockTicker } = req.body;

    // Validate numeric input
    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity provided' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find the stock
    const stock = await Stock.findOne({ ticker: stockTicker });
    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock not found' });
    }

    // Find the user's stock entry
    const userStock = await UserStock.findOne({ stock: stock._id, user: userId });
    if (!userStock) {
      return res.status(404).json({ success: false, error: "You don't own this stock" });
    }

    // Check if the user has enough shares to sell
    if (userStock.shares < quantityNum) {
      return res.status(400).json({
        success: false,
        error: "Insufficient stocks: You don't have enough shares to complete this sale.",
      });
    }

    // Calculate the remaining shares and update details
    const remainingShares = userStock.shares - quantityNum;
    const invested = userStock.invested - quantityNum * userStock.avg_price;
    const current = remainingShares * userStock.mkt_price;
    const returns = current - invested;

    let returnsPercentage = 0;
    if (invested !== 0) {
      returnsPercentage = (returns / invested) * 100;
    }

    // If all shares are sold, delete the UserStock entry
    if (remainingShares <= 0) {
      await UserStock.deleteOne({ _id: userStock._id });

      // Remove the stock reference from the user's portfolio
      user.stocks = user.stocks.filter((stockId) => stockId.toString() !== userStock._id.toString());
      await user.save();

      return res.status(200).json({ success: true, message: 'All shares sold successfully' });
    }

    // Update the UserStock entry with new values
    userStock.shares = parseFloat(remainingShares.toFixed(2));
    userStock.invested = parseFloat(invested.toFixed(2));
    userStock.current = parseFloat(current.toFixed(2));
    userStock.returns = parseFloat(returns.toFixed(2));
    userStock.returnsPercentage = parseFloat(returnsPercentage.toFixed(2));

    await userStock.save();

    return res.status(200).json({ success: true, message: 'Shares sold successfully', userStock });
  } catch (error) {
    console.error('Error in sellStocks Controller:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStocks = async (req, res) => {

    const getRandomPrice = (low, high) => (Math.random() * (high - low) + low).toFixed(2);

    const transformStocks = (stocks) => {
      return stocks.map((stock, index) => ({
        id: (index + 1).toString(),
        name: stock.name,
        ticker: stock.ticker.toUpperCase(),
        avg_price: getRandomPrice(parseFloat(stock.low), parseFloat(stock.high)),
      }));
    };

    const updateOwnedStocks = (ownedStocks, availableStocks) => {

      
      const stockMap = new Map(
        availableStocks.map((stock) => [stock.ticker, stock])
      );
      
    
      

      return ownedStocks.map((ownedStock) => {
        const ownedTicker = ownedStock?.stock?.ticker?.toUpperCase();
        const currentStock = stockMap.get(ownedTicker);

        if (currentStock) {
          const mktPrice = parseFloat(currentStock.avg_price).toFixed(2);
          const currentValue = (mktPrice * ownedStock.shares).toFixed(2);
          const returns = (currentValue - ownedStock.invested).toFixed(2);
          const returnsPercentage = ((returns / ownedStock.invested) * 100).toFixed(2);

          ownedStock.set({
            mkt_price: mktPrice,
            current: currentValue,
            returns,
            returnsPercentage,
          });
        } else {
          console.log(`Stock ${ownedTicker} not found in available stocks`);
        }

        return ownedStock;
      });
    };

    try {
      const { userId } = req.params;

      // Mock stock data
      const stocks = [
        {
          ticker: "AAPL",
          name: "Apple Inc.",
          date: "2025-01-10",
          open: "240.0100",
          high: "240.1600",
          low: "233.0000",
          close: "236.8500",
          volume: "61710856",
        },
        {
          ticker: "MSFT",
          name: "Microsoft Corporation",
          date: "2025-01-10",
          open: "424.6300",
          high: "424.7100",
          low: "415.0200",
          close: "418.9500",
          volume: "20201132",
        },
        {
          ticker: "GOOGL",
          name: "Alphabet Inc. (Google)",
          date: "2025-01-10",
          open: "194.2950",
          high: "196.5200",
          low: "190.3100",
          close: "192.0400",
          volume: "26665206",
        },
        {
          ticker: "AMZN",
          name: "Amazon.com, Inc.",
          date: "2025-01-10",
          open: "221.4600",
          high: "221.7100",
          low: "216.5000",
          close: "218.9400",
          volume: "36811525",
        },
        {
          ticker: "TSLA",
          name: "Tesla, Inc.",
          date: "2025-01-10",
          open: "391.4000",
          high: "399.2800",
          low: "377.2900",
          close: "394.7400",
          volume: "62287333",
        },
      ];

      // Transform the stock data to include average prices
      const availableStocks = transformStocks(stocks);

      // Fetch the user and their owned stocks
      const user = await User.findById(userId).populate({
        path: "stocks", // Populate the `stocks` field in `User`
        populate: {
          path: "stock", 
          model: "Stock",
        },
      });

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Update owned stocks with current market data
      user.stocks = updateOwnedStocks(user.stocks, availableStocks);

      // Save the updated user data
      await user.save();

    // console.log("Available Stocks:", availableStocks);
      //console.log("Updated Owned Stocks:", user.stocks[0]);

      // Send response
      return res.status(200).json({
        success: true,
        availableStocks,
        ownedStocks: user.stocks,
      });
    } catch (error) {
      console.error("Error fetching and updating stocks:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch and update stocks" });
    }
};














import fetch from 'node-fetch';

import  {Stock}  from '../models/stock.model.js';
import  {UserStock}  from '../models/userStock.model.js';
import  {User}  from '../models/user.model.js';
import { isMarketOpen } from '../utils/marketOpenCheck.js'; 

export const addStock = async (req, res) => {

  try {

    if (!isMarketOpen()) {
      return res.status(400).json({ success: false, error: 'Stock market is closed, try again during market hours.' });
    }


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

    // Calculate the total cost of the stock purchase
    const totalCost = sharesNum * avgPriceNum;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if the user has enough wallet balance
    if (user.walletBalance < totalCost) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance to buy the stock.' });
    }

    // Deduct the total cost from the user's wallet
    user.walletBalance -= totalCost;

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
      const newInvested = userStock.invested + totalCost;
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

      // Save the user's updated wallet balance
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Stock updated successfully and wallet balance deducted.',
        walletBalance: user.walletBalance,
      });
    }

    // If UserStock entry doesn't exist, create a new one
    userStock = await UserStock.create({
      stock: stock._id,
      user: userId,
      shares: parseFloat(sharesNum.toFixed(2)),
      avg_price: parseFloat(avgPriceNum.toFixed(2)),
      mkt_price: parseFloat(mktPriceNum.toFixed(2)),
      current: parseFloat((sharesNum * mktPriceNum).toFixed(2)),
      invested: parseFloat(totalCost.toFixed(2)),
      returns: parseFloat(((sharesNum * mktPriceNum) - totalCost).toFixed(2)),
      returnsPercentage: parseFloat((((sharesNum * mktPriceNum - totalCost) / totalCost) * 100).toFixed(2)),
    });

    // Add the stock to the user's portfolio
    user.stocks = user.stocks || [];
    user.stocks.push(userStock._id);

    // Save the user's updated wallet balance and portfolio
    await user.save();
  
    res.status(201).json({
      success: true,
      message: 'Stock added successfully and wallet balance deducted.',
      walletBalance: user.walletBalance,
      user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const sellStocks = async (req, res) => {
  try {

    if (!isMarketOpen()) {
      return res.status(400).json({ success: false, error: 'Stock market is closed, try again during market hours.' });
    }

    const { userId } = req.params;
    const { quantity, stockTicker, currentPrice } = req.body;

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

    // Calculate the sale amount
    const saleAmount = quantityNum * currentPrice;
    //console.log("parseFloat((user.walletBalance + saleAmount).toFixed(2))",parseFloat((user.walletBalance + saleAmount).toFixed(2)) );

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
      
      // Add sale amount to user's wallet
      user.walletBalance = parseFloat((user.walletBalance + saleAmount).toFixed(2));
      await user.save();

      return res.status(200).json({ success: true, message: 'All shares sold successfully', walletBalance: user.walletBalance });
    }

    // Update the UserStock entry with new values
    userStock.shares = parseFloat(remainingShares.toFixed(2));
    userStock.invested = parseFloat(invested.toFixed(2));
    userStock.current = parseFloat(current.toFixed(2));
    userStock.returns = parseFloat(returns.toFixed(2));
    userStock.returnsPercentage = parseFloat(returnsPercentage.toFixed(2));

    await userStock.save();
    // Add sale amount to user's wallet
    user.walletBalance = parseFloat((user.walletBalance + saleAmount).toFixed(2));
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Shares sold successfully',
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    console.error('Error in sellStocks Controller:', error.message);
    res.status(500).json({ success: false,  error: "Internal Server Error" });
  }
};



























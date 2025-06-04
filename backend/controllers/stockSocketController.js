import { User } from '../models/user.model.js';
import { DailyStock } from '../models/dailyStock.model.js';
import { isMarketOpen } from '../utils/marketOpenCheck.js';

export const handleGetStocksSocket = async (socket, userId) => {
  const getRandomPrice = (low, high) => {
    if (typeof low !== 'number' || typeof high !== 'number') {
      throw new Error('Low and high values must be numbers');
    }
    const randomPrice = Math.random() * (high - low) + low;
    return parseFloat(randomPrice.toFixed(2));
  };

  const transformStocks = (stocks) => {
    return stocks.map((stock, index) => {
      const avgPrice = !isMarketOpen()
        ? ((parseFloat(stock.low) + parseFloat(stock.high)) / 2).toFixed(2)
        : getRandomPrice(parseFloat(stock.low), parseFloat(stock.high)).toFixed(2);

      return {
        id: (index + 1).toString(),
        name: stock.name,
        ticker: stock.ticker.toUpperCase(),
        avg_price: avgPrice,
      };
    });
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
      }

      return ownedStock;
    });
  };

  try {
    const stocks = await DailyStock.find({});

    if (!stocks || stocks.length === 0) {
      return socket.emit('stockData', {
        success: false,
        error: "No stock data found",
      });
    }

    const intervalId = setInterval(async () => {
      try {
        const user = await User.findById(userId).populate({
          path: "stocks",
          populate: {
            path: "stock",
            model: "Stock",
          },
        });

        if (!user) {
          return socket.emit('stockData', {
            success: false,
            error: "User not found",
          });
        }

        const availableStocks = transformStocks(stocks);
        const updatedOwnedStocks = updateOwnedStocks(user.stocks, availableStocks);
        const ownedStocks = updatedOwnedStocks.sort((a, b) => b.returnsPercentage - a.returnsPercentage);

        socket.emit('stockData', {
          success: true,
          availableStocks,
          ownedStocks,
        });
      } catch (err) {
        console.error('Interval user fetch error:', err);
        socket.emit('stockData', {
          success: false,
          error: 'Failed to update stocks',
        });
      }
    }, 2000);

    socket.on('disconnect', () => {
      clearInterval(intervalId);
      console.log(`Stopped stock updates for user ${userId}`);
    });

  } catch (error) {
    console.error("Socket getStocks error:", error);
    socket.emit('stockData', {
      success: false,
      error: "Internal server error",
    });
  }
};

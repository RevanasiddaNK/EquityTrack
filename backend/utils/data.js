import {DailyStock} from '../models/dailyStock.model.js';
import { Stock } from '../models/stock.model.js';
// import connectDB from './db.js';


export const fetchStockData = async () => {
  try {
  const stockDetails = await Stock.find({});
    await Promise.all(
      stockDetails.map(async (stock) => {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.ticker}&apikey=${process.env.API_KEY}`
          );

          if (!response.ok) {
            console.error(`Error fetching data for ${stock.ticker}: ${response.statusText}`);
            return; // Skip this stock if there's an error with the API
          }

          const data = await response.json();

          // Check if the response contains an "Information" field (rate limit message)
          if (data.Information) {
            console.log(`Rate limit reached for ${stock.ticker}`);
            return; // Skip this stock
          }

          const timeSeries = data['Time Series (Daily)'];

          if (!timeSeries) {
            console.error(`No data available for ${stock.ticker}`);
            return; // Skip this stock if no data is available from the API
          }

          const dates = Object.keys(timeSeries);
          const previousDay = dates[0]; // Latest trading day
          const details = timeSeries[previousDay];

          // Proceed with upserting the stock data only if fetching was successful
          await DailyStock.findOneAndUpdate(
            { ticker: stock.ticker },
            {
              ticker: stock.ticker,
              name: stock.name,
              date: previousDay,
              open: details['1. open'],
              high: details['2. high'],
              low: details['3. low'],
              close: details['4. close'],
              volume: details['5. volume'],
              lastUpdated: new Date(),
            },
            { upsert: true, new: true }
          );

          console.log(`Stock data for ${stock.ticker} updated successfully.`);
        } catch (err) {
          console.error(`Error processing stock ${stock.ticker}:`, err);
          // Skip this stock if there's an error during processing
        }
      })
    );

    // Respond with a success message after processing all stocks
    console.log("Stock data processed successfully");
  } catch (error) {
    console.log("An unexpected error occurred while processing stock data");
  }
};


import {DailyStock} from '../models/dailyStock.model.js';
import connectDB from './db.js';

const stockDetails = [
  {
      "ticker": "RELIANCE.BSE",
      "name": "Reliance Industries Limited",
      "date": "2025-01-14",
      "open": "2340.7500",
      "high": "2360.1200",
      "low": "2320.4720",
      "close": "2330.2800",
      "volume": "39435294"
  },
  {
      "ticker": "TCS.BSE",
      "name": "Tata Consultancy Services Limited",
      "date": "2025-01-14",
      "open": "4170.8100",
      "high": "4190.7400",
      "low": "4100.7200",
      "close": "4150.6700",
      "volume": "16935856"
  },
  {
      "ticker": "INFY.BSE",
      "name": "Infosys Limited",
      "date": "2025-01-14",
      "open": "1910.2400",
      "high": "1919.9800",
      "low": "1888.3082",
      "close": "1899.6600",
      "volume": "17174854"
  },
  {
      "ticker": "HDFC.BSE",
      "name": "Housing Development Finance Corporation",
      "date": "2025-01-14",
      "open": "2200.4400",
      "high": "2210.8200",
      "low": "2160.2000",
      "close": "2170.7600",
      "volume": "24711650"
  },
  {
      "ticker": "ICICIBANK.BSE",
      "name": "ICICI Bank Limited",
      "date": "2025-01-14",
      "open": "4140.3400",
      "high": "4220.6400",
      "low": "3940.5400",
      "close": "3960.3600",
      "volume": "83216061"
  },
  {
      "ticker": "SBIN.BSE",
      "name": "State Bank of India",
      "date": "2025-01-14",
      "open": "8430.2000",
      "high": "8440.8925",
      "low": "8230.5190",
      "close": "8280.4000",
      "volume": "3037650"
  },
  {
      "ticker": "HINDUNILVR.BSE",
      "name": "Hindustan Unilever Limited",
      "date": "2025-01-14",
      "open": "6050.0650",
      "high": "6050.4900",
      "low": "5880.5500",
      "close": "5940.2500",
      "volume": "13597992"
  },
  {
      "ticker": "ADANIENT.BSE",
      "name": "Adani Enterprises Limited",
      "date": "2025-01-14",
      "open": "1360.0500",
      "high": "1363.3800",
      "low": "1300.0500",
      "close": "1317.7600",
      "volume": "195590485"
  },
  {
      "ticker": "ITC.BSE",
      "name": "ITC Limited",
      "date": "2025-01-14",
      "open": "4450.5000",
      "high": "4503.0000",
      "low": "4433.9200",
      "close": "4500.3000",
      "volume": "4055602"
  },
  {
      "ticker": "LT.BSE",
      "name": "Larsen & Toubro Limited",
      "date": "2025-01-14",
      "open": "2420.6600",
      "high": "2477.2000",
      "low": "2421.9000",
      "close": "2474.7000",
      "volume": "12407386"
  },
  {
      "ticker": "BAJFINANCE.BSE",
      "name": "Bajaj Finance Limited",
      "date": "2025-01-14",
      "open": "3087.5000",
      "high": "3101.6000",
      "low": "3075.2000",
      "close": "3090.9000",
      "volume": "5107901"
  },
  {
      "ticker": "KOTAKBANK.BSE",
      "name": "Kotak Mahindra Bank Limited",
      "date": "2025-01-14",
      "open": "1086.8000",
      "high": "1089.6000",
      "low": "1076.1000",
      "close": "1081.2000",
      "volume": "5501600"
  }
];
/*
connectDB();
await DailyStock.deleteMany({})
const data = await DailyStock.insertMany(stockDetails);
console.log(data);
*/


export const fetchStockData = async () => {
  try {
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
            console.warn(`Rate limit reached for ${stock.ticker}: ${data.Information}`);
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
            { ticker: stock.ticker, date: previousDay },
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


import axios from "axios";

export const getStockPrice = async (req, res) => {
  const { symbol } = req.params; // Stock ticker symbol
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${API_KEY}`;
    const response = await axios.get(url);

    const timeSeries = response.data['Time Series (1min)'];

    if (!timeSeries) {
      return res.status(404).json({ error: 'Stock data not found' });
    }

    // Extract stock details for each minute
    const stockDetails = Object.entries(timeSeries).map(([time, details]) => ({
      time,
      open: details['1. open'],
      high: details['2. high'],
      low: details['3. low'],
      close: details['4. close'],
      volume: details['5. volume'],
    }));

    // Send the stock details as a response
    res.status(200).json({
      symbol,
      stockDetails,
    });
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
};

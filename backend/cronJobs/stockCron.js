import cron from 'node-cron';
import fetch from 'node-fetch';
import  {fetchStockData}  from '../utils/data.js';



cron.schedule('30 2 * * *', async () => {
    console.log("Fetching stock data at 2:30 AM IST (End of US Market Day)...");
    await fetchStockData();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set timezone to IST
});







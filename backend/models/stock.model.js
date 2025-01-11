import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the stock
  ticker: { type: String, required: true, unique: true }, // Unique ticker symbol for the stock
  shares: { type: Number, required: true }, // Number of shares
  avg_price: { type: Number, required: true }, // Average price of shares
  mkt_price: { type: Number, required: true }, // Current market price of the stock
  current: { type: Number }, // Current value of the shares (shares * mkt_price)
  invested: { type: Number }, // Total invested value (shares * avg_price)
  returns: { type: Number }, // Returns (current - invested)
  returnsPercentage: { type: Number }, // Returns percentage ((returns / invested) * 100)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who owns the stock
});

export const Stock = mongoose.model('Stock', stockSchema);

import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const Stock = mongoose.model('Stock', stockSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }], // Stock references
});

export const User = mongoose.model('User', userSchema);
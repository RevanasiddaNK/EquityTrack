import mongoose from "mongoose";
import  { UserStock }  from "./userStock.model.js";

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserStock' }],
});

export const User = mongoose.model('User', userSchema);
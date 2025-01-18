import mongoose from "mongoose";
const connectDB = async ()=> {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        //await mongoose.connect("mongodb+srv://revanasidda27792:ZKtcc8qTt3tWVrcr@cluster0.14146.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("mongoDB connected successfully");
    }catch(error){
        console.log(error);
        
    }
}
export default connectDB;
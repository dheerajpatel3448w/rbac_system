
import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    console.log(process.env.DB_NAME);
    const connect = await mongoose.connect(`${process.env.MONGODB_URI as string}/${process.env.DB_NAME as string}`);
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

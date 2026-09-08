import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set in the environment!");
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected 🟢");
  } catch (error) {
    console.error("MongoDB connection error ❌", error);
    throw error;
  }
}

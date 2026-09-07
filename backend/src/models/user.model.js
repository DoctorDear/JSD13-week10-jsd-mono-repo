import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

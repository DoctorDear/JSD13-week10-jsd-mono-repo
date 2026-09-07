import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

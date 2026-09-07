import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

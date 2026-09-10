import mongoose from "mongoose";
import { Router } from "express";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authUser } from "../../middlewares/authUser.js";
export const router = Router();

// Read user
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// Create users
router.post("/", async (req, res, next) => {
  try {
    const { username, role, email, password } = req.body; // รับจาก body

    if (!username || !role || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required" });
    }
    const newUser = await User.create({ username, role, email, password });

    const { password: _password, ...userWithoutPassword } = newUser.toObject();
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Update users
router.put("/:id", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updateUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(updateUser);
  } catch (err) {
    next(err);
  }
});

// Delete users
router.delete("/:id", async (req, res, next) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.status(200).json({
      message: "User successfully deleted",
    });
  } catch (err) {
    next(err);
  }
});

// Login User

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "incorrect password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        message: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res
    .status(200)
    .json({ success: true, message: "Logout successfull!" });
});

// Check user's token
router.get("/auth", authUser, async (req, res) => {
  try {
    const userId = req.user.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

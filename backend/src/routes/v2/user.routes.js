import mongoose from "mongoose";
import { Router } from "express";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

router.post("/loging", async (req, res, next) => {
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

    jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  } catch (err) {
    next(err);
  }
});

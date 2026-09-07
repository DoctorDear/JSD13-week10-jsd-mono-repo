import { Router } from "express";
import { User } from "../../models/user.model.js";
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
    const { username, email, password } = req.body; // รับจาก body

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required" });
    }
    const newUser = await User.create({ username, email, password });

    const { password: _password, ...userWithoutPassord } = newUser.toObject();
    return res.status(201).json(userWithoutPassord);
  } catch (err) {
    next(err);
  }
});

// Update users
router.put("/:id", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// Delete users
router.delete("/:id", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

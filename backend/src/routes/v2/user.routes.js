import { Router } from "express";

export const router = Router();

// Read user
router.get("/", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// Create users
router.post("/", (req, res, next) => {
  try {
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

import { Router } from "express";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const PG_SELECT = "id, username, email, role, created_at, updated_at";
// Read user
router.get("/pg", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Create users
router.post("/pg", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// Update users
router.put("/pg/:id", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// Delete users
router.delete("/pg/:id", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

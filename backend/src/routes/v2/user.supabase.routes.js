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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required" });
    }
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password }])
      .select("id, username, email");

    if (error) throw error;
    return res
      .status(201)
      .json({ message: "add new user completed ", data: data });
  } catch (err) {
    next(err);
  }
});

// Update users
router.put("/pg/:id", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ username, email, password })
      .eq("id", req.params.id);

    if (error) throw error;
    return res.status(201).json({ message: "update user completed " });
  } catch (err) {
    next(err);
  }
});

// Delete users
router.delete("/pg/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json({
      message: "User successfully deleted",
    });
  } catch (err) {
    next(err);
  }
});

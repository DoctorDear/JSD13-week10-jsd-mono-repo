import { Router } from "express";
import { router as userRoutes } from "./user.routes.js";
import { router as userSupabaseRoutes } from "./user.supabase.routes.js";

export const routes = Router();

routes.use("/users", userRoutes);
routes.use("/users", userSupabaseRoutes);

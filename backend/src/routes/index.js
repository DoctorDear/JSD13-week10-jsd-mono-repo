import { Router } from "express";
import { routes as v1Routes } from "./v1/index.js";
import { routes as v2Routes } from "./v2/index.js";

export const routes = Router();

routes.use("/v1", v1Routes);
routes.use("/v2", v2Routes);

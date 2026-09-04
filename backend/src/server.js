import express from "express";
import { users } from "./fakeDB/fakeUsers.js";
import { routes as apiRoutes } from "./routes/index.js";
const app = express();

app.use(express.json());

// CRUD routes and endpoints

app.use("/api", apiRoutes);

// Centralize Error Handling Middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on ther server...",
    message: err.message,
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT} 🟢`);
});

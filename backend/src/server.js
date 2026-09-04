import express from "express";
import { users } from "./fakeDB/fakeUsers.js";

const app = express();

app.use(express.json());

// CRUD routes and endpoints

// Read users
app.get("/users", (req, res) => {
  res.send(users);
});

// Create users
app.post("/users", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  const hightestId = users.reduce(
    (max, user) => Math.max(max, Number(user.id)),
    0,
  );

  const nextId = String(hightestId + 1);

  const newUser = {
    id: nextId,
    username: username,
    email: email,
    password: password,
  };

  users.push(newUser);

  return res.status(201).json(newUser);
});

// Update users
app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  return res.status(200).json(user);
});

// Delete users
app.delete("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const index = users.indexOf(user);

  users.splice(index, 1);

  return res.status(204).send();
});

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

"use strict";

const express = require("express");
const path = require("path");
const db = require("./services/db");

const app = express();

// Serve static files from /static
app.use(express.static(path.join(__dirname, "..", "static")));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Health check (verifies web is up + DB is reachable)
app.get("/health", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

// Main route: return all users
app.get("/users", async (req, res) => {
  try {
    const rows = await db.query("SELECT id, name FROM users ORDER BY id ASC");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
      code: e.code,
      hint:
        "If you just added the db-init SQL, run: docker compose down -v && docker compose up --build",
    });
  }
});

// Alias route: /db_test does the same thing as /users
app.get("/db_test", async (req, res) => {
  try {
    const rows = await db.query("SELECT id, name FROM users ORDER BY id ASC");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
      code: e.code,
      hint:
        "If you just added the db-init SQL, run: docker compose down -v && docker compose up --build",
    });
  }
});

// Goodbye route
app.get("/goodbye", (req, res) => {
  res.send("Goodbye world!");
});

// Dynamic route
app.get("/hello/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

// Use PORT env var if set, fallback to 3000
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

module.exports = app;
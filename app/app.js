"use strict";

const cors = require("cors");
const express = require("express");
const path = require("path");

const db = require("./services/db");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// CORS must be BEFORE routes
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors());

// JSON parsing + static
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "static")));

// API namespace
app.use("/api", apiRouter);

// --- Simple root routes (optional for demo) ---
app.get("/", (req, res) => res.send("Hello world!"));

app.get("/health", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

// Error handler MUST be after routes
app.use(errorHandler);

// --- Server start ---
const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use.`);
    process.exit(1);
  }
  throw err;
});

module.exports = app;
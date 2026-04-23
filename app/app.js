"use strict";

const cors = require("cors");
const express = require("express");
const path = require("path");

const db = require("./services/db");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// CORS must be BEFORE routes
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3001", "http://localhost:3000"];

const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// JSON parsing + static
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "static")));

// API namespace
app.use("/api", apiRouter);

// Root route
app.get("/", (req, res) => res.send("G.A.I.A. API — running"));

// Health route (inline — keeps db import local to app)
app.get("/health", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

// Error handler MUST be last
app.use(errorHandler);

module.exports = app;

"use strict";

const cors = require("cors");
const express = require("express");
const path = require("path");

const db = require("./services/db");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// =====================================================
// CORS (STRICT BUT SAFE)
// =====================================================

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "static")));

// =====================================================
// ROUTES
// =====================================================

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("G.A.I.A. API — running");
});

app.get("/health", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

module.exports = app;
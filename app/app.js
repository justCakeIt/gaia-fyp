"use strict";

const cors = require("cors");
const express = require("express");
const path = require("path");

const db = require("./services/db");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const {
  ensureDemoAccountWithRetry,
} = require("./services/demo-auth.service");

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

// Root / health routes
app.get("/", (req, res) => res.send("G.A.I.A. API — running"));

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

const server = app.listen(PORT, async () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
  console.log(`  DB_HOST=${process.env.DB_HOST}  DB_PORT=${process.env.DB_PORT}  DB_NAME=${process.env.DB_NAME}`);

  // DB connectivity check — separate from demo account so a DB failure
  // is clearly visible in logs
  const dbOk = await db.checkConnectivity();

  if (!dbOk) {
    console.error(
      "\n  *** DB NOT REACHABLE — auth and registration will fail ***\n" +
        "  If running locally (no Docker), ensure docker compose is running\n" +
        "  and that .env has DB_HOST=127.0.0.1, DB_PORT=3308\n"
    );
    return; // Skip demo account creation if DB is down
  }

  ensureDemoAccountWithRetry()
    .then((demo) => {
      if (!demo) return;
      const mode = demo.created ? "created" : "updated";
      console.log(`Demo auth account ${mode}: ${demo.email} / ${demo.password}`);
    })
    .catch((err) => {
      console.error("Failed to ensure demo auth account:", err.message);
    });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use.`);
    process.exit(1);
  }
  throw err;
});

module.exports = app;

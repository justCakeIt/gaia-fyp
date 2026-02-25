"use strict";

const express = require("express");
const path = require("path");
const db = require("./services/db");

const app = express();

app.use(express.static(path.join(__dirname, "..", "static")));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/health", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

app.get("/db_test", async (req, res) => {
  try {
    const rows = await db.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.get("/tables", async (req, res) => {
  try {
    const rows = await db.query(
      "SHOW TABLES"
    );
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.get("/goodbye", (req, res) => {
  res.send("Goodbye world!");
});

app.get("/hello/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;


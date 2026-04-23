"use strict";

require("dotenv").config();

const db = require("./app/services/db");
const { ensureDemoAccountWithRetry } = require("./app/services/demo-auth.service");
const app = require("./app/app");

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
    return;
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

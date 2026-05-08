"use strict";

require("dotenv").config();

const db = require("./app/services/db");
const { ensureDemoAccountWithRetry } = require("./app/services/demo-auth.service");
const app = require("./app/app");

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log("\nG.A.I.A. API — running\n");

  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://<LAN-IP>:${PORT}  (run 'ipconfig' to find your LAN IP)\n`);

  console.log(
    `DB → HOST=${process.env.DB_HOST} PORT=${process.env.DB_PORT} NAME=${process.env.DB_NAME}\n`
  );

  // --------------------------------------------------
  // Database connectivity check
  // --------------------------------------------------
  const dbOk = await db.checkConnectivity();

  if (!dbOk) {
    console.error(
      "\n*** DATABASE NOT REACHABLE ***\n" +
      "Auth, plans, and data fetching will fail.\n" +
      "Make sure Docker DB is running and .env is correct.\n"
    );
    return;
  }

  console.log("Database connection: OK\n");

  // --------------------------------------------------
  // Ensure demo account (non-blocking)
  // --------------------------------------------------
  ensureDemoAccountWithRetry()
    .then((demo) => {
      if (!demo) return;

      const mode = demo.created ? "created" : "updated";

      console.log(
        `Demo account ${mode}: ${demo.email}\n`
      );
    })
    .catch((err) => {
      console.error("Demo account setup failed:", err.message);
    });
});

// --------------------------------------------------
// Server error handling
// --------------------------------------------------
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }

  console.error("Server error:", err);
  throw err;
});
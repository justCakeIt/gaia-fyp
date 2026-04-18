"use strict";

function errorHandler(err, req, res, next) {
  const msg = err?.message || "Internal server error";
  const code = err?.code || "";

  // Always log the full error on the server
  console.error("API ERROR:", {
    path: req.originalUrl,
    method: req.method,
    message: msg,
    code,
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });

  // Map known error types to appropriate HTTP codes
  const connectCodes = [
    "ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET",
    "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST",
    "ER_ACCESS_DENIED_ERROR", "ER_DBACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR",
  ];

  if (err?.isDbError && connectCodes.includes(code)) {
    return res.status(503).json({
      ok: false,
      error:
        "Service temporarily unavailable — database is not reachable. " +
        "Ensure Docker is running (`docker compose up`) and try again.",
    });
  }

  const isClientError =
    msg.startsWith("Invalid") ||
    msg.includes("not found") ||
    msg.includes("required") ||
    msg.includes("must be") ||
    msg.includes("already exists");

  if (isClientError) {
    return res.status(400).json({ ok: false, error: msg });
  }

  return res.status(500).json({ ok: false, error: "Internal server error" });
}

module.exports = errorHandler;

"use strict";

function errorHandler(err, req, res, next) {
  const msg = err?.message || "Internal server error";

  // Log full error for debugging
  console.error("API ERROR:", {
    message: msg,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });

  const isClient =
    msg.startsWith("Invalid") ||
    msg.includes("not found") ||
    msg.includes("required") ||
    msg.includes("must be");

  if (isClient) {
    return res.status(400).json({ ok: false, error: msg });
  }

  return res.status(500).json({ ok: false, error: "Internal server error" });
}

module.exports = errorHandler;
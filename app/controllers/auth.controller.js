"use strict";

const authService = require("../services/auth.service");

/**
 * Validation errors — shown to the client as 400.
 */
function isValidationError(message) {
  return (
    message.startsWith("Invalid") ||
    message.includes("required") ||
    message.includes("must be") ||
    message.includes("already exists") ||
    message.includes("already registered")
  );
}

/**
 * DB connectivity / infrastructure errors — returned as 503
 * so the client knows to retry rather than treating it as a code bug.
 */
function isConnectivityError(err) {
  const connectCodes = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_BAD_DB_ERROR",
    "PROTOCOL_CONNECTION_LOST",
  ];
  return err.isDbError === true || connectCodes.includes(err.code);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await authService.login({ email, password });
    return res.json({ ok: true, data: user });
  } catch (e) {
    if (e.message === "Invalid credentials") {
      return res.status(401).json({ ok: false, error: e.message });
    }
    if (isValidationError(e.message)) {
      return res.status(400).json({ ok: false, error: e.message });
    }
    if (isConnectivityError(e)) {
      return res.status(503).json({
        ok: false,
        error: "Service temporarily unavailable — database is not reachable.",
      });
    }
    next(e);
  }
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    const user = await authService.register({ email, password, name });
    return res.status(201).json({ ok: true, data: user });
  } catch (e) {
    if (isValidationError(e.message)) {
      return res.status(400).json({ ok: false, error: e.message });
    }
    if (isConnectivityError(e)) {
      return res.status(503).json({
        ok: false,
        error: "Registration temporarily unavailable — database is not reachable.",
      });
    }
    next(e);
  }
}

async function googleSync(req, res, next) {
  try {
    const { email, name } = req.body || {};
    const user = await authService.syncGoogleUser({ email, name });
    return res.json({ ok: true, data: user });
  } catch (e) {
    if (isValidationError(e.message)) {
      return res.status(400).json({ ok: false, error: e.message });
    }
    if (isConnectivityError(e)) {
      return res.status(503).json({
        ok: false,
        error: "Google sync failed — database is not reachable.",
      });
    }
    next(e);
  }
}

module.exports = {
  login,
  register,
  googleSync,
};
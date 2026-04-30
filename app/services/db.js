"use strict";

const mysql = require("mysql2/promise");

// Validate required environment variables (fail fast in production)
function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env variable: ${name}`);
  }
  return value;
}

// Create connection pool
const pool = mysql.createPool({
  host: getEnv("DB_HOST"),
  port: Number(getEnv("DB_PORT")),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD"),
  database: getEnv("DB_NAME"),

  // Connection behaviour
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

// Standard query wrapper
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    err.isDbError = true;

    console.error("DB query error:", {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });

    throw err;
  }
}

// Simple DB ping
async function ping() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  return true;
}

// Startup connectivity check
async function checkConnectivity() {
  try {
    await ping();
    console.log(
      `DB connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );
    return true;
  } catch (err) {
    console.error(
      `DB connectivity FAILED: ${err.message}\n` +
        `host=${process.env.DB_HOST} port=${process.env.DB_PORT}`
    );
    return false;
  }
}

module.exports = {
  query,
  ping,
  pool,
  checkConnectivity,
};
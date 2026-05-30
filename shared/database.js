const mysql = require("mysql2/promise");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "montezuma_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "montezuma_password";
const DB_NAME = process.env.DB_NAME || "montezuma_amortuary";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const safeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", {
      sql,
      params,
      error: error.message,
    });
    throw error;
  }
};

const safeQueryOne = async (sql, params = []) => {
  const rows = await safeQuery(sql, params);
  return rows[0] || null;
};

module.exports = {
  pool,
  safeQuery,
  safeQueryOne,
};

const { query } = require("express-validator");
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgres://exjepectdwlsdt:2f1f6d57ae8b310f0feb42f055ac9419d3383a8bd893e6b9ff2c0e76400a85a2@ec2-54-211-255-161.compute-1.amazonaws.com:5432/d3rdav65ir58ej",
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

const readSession = async () => {
  try {
    const res = await client.query("SELECT * FROM wa_sessions ORDER BY created_at DESC LIMIT 1");
    if (res.rows.length) return res.rows[0].session;
    return "";
  } catch (err) {
    throw err;
  }
};

const saveSession = (session) => {
  client.query("INSERT INTO wa_sessions (session) VALUES($1)", [session], (err, results) => {
    if (err) {
      console.error("Failed to save session!", err);
    } else {
      console.log("Session saved!");
    }
  });
};

const removeSession = () => {
  client.query("DELETE FROM wa_sessions", (err, results) => {
    if (err) {
      console.error("Failed to remove session!", err);
    } else {
      console.log("Session deleted!");
    }
  });
};

module.exports = {
  readSession,
  saveSession,
  removeSession,
};

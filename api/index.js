const dotenv = require("dotenv");
const connectDB = require("../server/config/db");
const app = require("../server/app");

dotenv.config({ path: "./server/.env" });

let connectionPromise;

const ensureDatabase = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }

  return connectionPromise;
};

module.exports = async (req, res) => {
  await ensureDatabase();
  return app(req, res);
};

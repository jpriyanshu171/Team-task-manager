const dotenv = require("dotenv");
const serverless = require("serverless-http");
const connectDB = require("../../server/config/db");
const app = require("../../server/app");

dotenv.config();

let connectionPromise;

const ensureDatabase = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }

  return connectionPromise;
};

const handler = serverless(app, {
  request(request, event) {
    const path = event.path.replace(/^\/\.netlify\/functions\/api/, "");
    request.url = path.startsWith("/api") ? path : `/api${path}`;
  }
});

exports.handler = async (event, context) => {
  await ensureDatabase();
  return handler(event, context);
};

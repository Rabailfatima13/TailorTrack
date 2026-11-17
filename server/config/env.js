// Stops the server with a clear message when a required setting is missing,
// instead of failing later with a confusing error (for example when someone logs in).
const REQUIRED = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

function checkEnv() {
  const missing = REQUIRED.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.log(`Missing environment variables: ${missing.join(", ")}`);
    console.log("Copy server/.env.example to server/.env and fill in the values.");
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET === "change_this_secret") {
    console.log("JWT_SECRET is still the example value. Set a long random secret before running in production.");
    process.exit(1);
  }
}

module.exports = checkEnv;

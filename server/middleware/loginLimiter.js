// Slows down password guessing: after 10 wrong passwords for the same username
// from the same IP address, further attempts are blocked for 15 minutes.
// A successful login clears the counter. Counters live in memory, so they
// reset when the server restarts (fine for a single-server app like this).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 10;

const attempts = new Map(); // "ip:username" -> { count, resetAt }

// Remove expired entries now and then so the map cannot grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
}, WINDOW_MS).unref();

function loginLimiter(req, res, next) {
  const username = String(req.body?.username || "").toLowerCase().trim();
  const key = `${req.ip}:${username}`;
  const now = Date.now();

  let entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(key, entry);
  }

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    return res
      .status(429)
      .json({ message: "Too many failed login attempts. Please try again in a few minutes." });
  }

  // Count only wrong-password responses; a good login resets the counter.
  res.on("finish", () => {
    if (res.statusCode === 401) entry.count += 1;
    if (res.statusCode === 200) attempts.delete(key);
  });

  next();
}

module.exports = loginLimiter;

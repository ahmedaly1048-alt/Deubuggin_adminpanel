// middleware/auth.js
const jwt = require("jsonwebtoken");

const tokenBlacklist = new Set(); // in-memory token store

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "Unauthorized: Token revoked" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded token to request
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token", details: err.message });
  }
}

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

module.exports = {
  requireAuth,
  blacklistToken,
  tokenBlacklist
};

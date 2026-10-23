// middleware to authenticate JWT tokens

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-verify the account still exists, is not banned, and role matches the token
    const user = await User.findById(decoded.id).select("isBanned role").lean();
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned. Contact support." });
    }
    if (user.role !== decoded.role) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded; // { id, role }
    next();
  } catch {
    // Token verification failed (invalid, expired, or malformed) — reject with 401
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;

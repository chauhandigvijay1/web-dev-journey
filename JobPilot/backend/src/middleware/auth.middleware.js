import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  try {
    const decoded = verifyAccessToken(token);
    const userId = decoded.userId;
    if (!userId || decoded.type !== "access") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return next(err);
  }
}

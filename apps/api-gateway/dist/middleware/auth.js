import jwt from "jsonwebtoken";
import { env } from "../env.js";
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Missing bearer token" });
        return;
    }
    const token = authHeader.slice("Bearer ".length).trim();
    try {
        req.auth = jwt.verify(token, env.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
    }
}
export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.auth) {
            res.status(401).json({ error: "UNAUTHORIZED", message: "No auth context" });
            return;
        }
        if (!roles.includes(req.auth.role)) {
            res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions" });
            return;
        }
        next();
    };
}

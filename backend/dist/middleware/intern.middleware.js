"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.internAuthenticate = internAuthenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function internAuthenticate(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const token = auth.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "INTERN") {
            return res.status(401).json({
                success: false,
                message: "Invalid role",
            });
        }
        req.intern = decoded;
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginIntern = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const loginIntern = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("USERNAME:", username);
        console.log("PASSWORD:", password);
        const intern = await prisma_1.prisma.intern.findUnique({
            where: {
                username,
            },
        });
        console.log("FOUND INTERN:", intern);
        if (!intern) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }
        const valid = await bcryptjs_1.default.compare(password, intern.passwordHash);
        console.log("PASSWORD VALID:", valid);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: intern.id,
            username: intern.username,
            role: "INTERN",
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({
            success: true,
            token,
            intern: {
                id: intern.id,
                name: intern.name,
                username: intern.username,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.loginIntern = loginIntern;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
const resend_1 = require("resend");
const env_1 = require("./env");
exports.resend = new resend_1.Resend(env_1.env.RESEND_API_KEY);

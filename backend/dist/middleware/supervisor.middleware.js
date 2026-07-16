"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supervisorAuthenticate = supervisorAuthenticate;
const jwt_1 = require("../utils/jwt");
const app_error_1 = require("../utils/app-error");
function supervisorAuthenticate(request, _response, next) {
    try {
        const auth = request.headers.authorization;
        if (!auth ||
            !auth.startsWith("Bearer ")) {
            throw new app_error_1.AppError("Unauthorized", 401);
        }
        const token = auth.substring(7);
        const payload = (0, jwt_1.verifyJwt)(token);
        request.user = payload;
        console.log("JWT Payload:", payload);
        console.log("Request User:", request.user);
        next();
    }
    catch {
        next(new app_error_1.AppError("Unauthorized", 401));
    }
}

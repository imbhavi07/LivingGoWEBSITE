"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
function asyncHandler(fn) {
    return (request, response, next) => {
        Promise.resolve(fn(request, response, next)).catch(next);
    };
}

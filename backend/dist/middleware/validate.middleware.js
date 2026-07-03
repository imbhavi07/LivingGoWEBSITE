"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (request, _response, next) => {
        const parsed = schema.parse({
            body: request.body,
            query: request.query,
            params: request.params
        });
        request.body = parsed.body ?? request.body;
        request.query = parsed.query ?? request.query;
        request.params = parsed.params ?? request.params;
        next();
    };
}

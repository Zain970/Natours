// Inheritance
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        // Sending status-code 
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"

        // All the error we create ourselves are the operational errors
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
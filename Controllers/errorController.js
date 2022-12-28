const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        // Operational trusted error : send message to client
        // Invalid data from user side like invalid id to get data from mongodb
        // E.g :- Coming from the database
        // All the errors we create ourselves are the operational errors
        // Sending the message to the client
        // User accessing route that doesn't exist
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        // Programming or other unknown error : don't leak error details
        // Proramming error will not be having the error property
        // Sending generic message
        // Log error
        console.error("Error  : ", err);
        res.status(500).json({
            status: "err",
            message: "Something went very wrong"
        })
    }
}
// path : The field that is queried wrong like in this case : Id is wrong input
// value : This is wrongly input
// Will be marked operational automatically
// Creating meaningful message for the client 
const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path} : ${error.value}`
    return new AppError(message, 400);
}

// Duplicate tours with the same name
// Will be marked operational automatically
// Creating meaningful message for the client 
const handleDuplicateFieldsDB = (error) => {
    const message = `Duplicate tour with same name . Please use another value`;
    return new AppError(message, 400);       // 400 bad request
}

const handleValidationErrorDB = (error) => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
}
const handleJWTError = () => {
    return new AppError("Invalid token ! Please log in again.", 401);
}
const tokenExpiredError = () => {
    return new AppError("Your token has expired ! please log in again.", 401);
}
const error = (err, req, res, next) => {
    console.log("*************************");
    console.log('Error handling controller');
    console.log("*************************");

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV == "development1") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV == "development") {

        // Destructing kartay waqt ghaib ho jata ha message property
        let error = { ...err };
        // This value is not copied while destructing
        error.message = err.message;

        // Error from the db that is not able to cast
        if (err.name == "CastError") {
            error = handleCastErrorDB(error);
        }
        if (err.code == 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (err.name == "ValidationError") {
            error = handleValidationErrorDB(error);
        }
        if (err.name == "JsonWebTokenError") {
            error = handleJWTError();
        }
        if (err.name == "TokenExpiredError") {
            error = tokenExpiredError();
        }

        sendErrorProd(error, res);
    }
}
module.exports = error
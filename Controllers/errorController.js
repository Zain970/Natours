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
        console.error("ERROR : ", err);
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
    const errors = Object.values(error.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
}


const error = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV == "development123") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV == "development") {

        let error = { ...err };

        //Destructing kartay waqt ghaib ho jata ha message property
        if (err.message == "No tour found with that ID") {
            error.message = "No tour found with that ID";
        }
        if (err.name == "CastError") {
            error = handleCastErrorDB(error);
        }
        if (err.code == 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (err.name == "ValidationError") {
            error = handleValidationErrorDB(error);

        }

        sendErrorProd(error, res);
    }
}
module.exports = error
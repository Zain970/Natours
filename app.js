const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');

// Loading Routes from the Routes folder
const tourRouter = require("./Routes/tourRoutes")
const userRouter = require("./Routes/userRoutes")

// Importing Error class
const AppError = require("./utils/appError");

// Importing global error Handler
const globalErrorHandler = require("./Controllers/errorController");


// Initializing the express app
const app = express();

// *********** Printing the environment ************
// console.log("--> env : ", process.env.NODE_ENV)

if (process.env.NODE_ENV === "development") {
    // Using installed middleware morgan
    app.use(morgan("dev"));
}

// 1). Middlewares
app.use(express.json());

// Serving static assets for html files
app.use(express.static(`${__dirname}/public`))

// Check middle-ware
app.use((req, res, next) => {
    console.log("Hello from the middle-ware")
    next();
});

// Manipulating the request object using middle-ware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Main routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


// Operational error
app.all("*", (req, res, next) => {

    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
})

// Error handling middleware
// Four parameters :- Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
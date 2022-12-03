const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');

// Routes
const tourRouter = require("./Routes/tourRoutes")
const userRouter = require("./Routes/userRoutes")

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
    next();
});
// Manipulating the request using middle-ware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Main routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


module.exports = app;
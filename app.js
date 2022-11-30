const express = require("express");
const fs = require("fs");
const morgan = require('morgan');

const tourRouter = require("./Routes/tourRoutes")
const userRouter = require("./Routes/userRoutes")


// *********************** Printing the environment **********************
// console.log("--> env : ", process.env.NODE_ENV)
const app = express();

// Installed middleware
if (process.env.NODE_ENV === "development") {
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


app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


module.exports = app;
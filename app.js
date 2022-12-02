const fs = require("fs");

// Installed modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');

// Routes
const tourRouter = require("./Routes/tourRoutes")
const userRouter = require("./Routes/userRoutes")

// Models
const Tour = require("./Models/tourModel");

// ************ Printing the environment *******************
// console.log("--> env : ", process.env.NODE_ENV)

// Initializing express app
const app = express();

if (process.env.NODE_ENV === "development") {

    // Using installed middleware morgan
    app.use(morgan("dev"));
}
// Connecting with the database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log("Error : ", err)
})

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

app.use("/insert", (req, res) => {
    console.log("Request body : ", req.body)

    const newTour = new Tour(req.body);
    newTour.save((err) => {
        if (err) {
            res.status(404).json({
                status: "Fail",
                message: "Error adding new tour",
                body: {
                    err
                }
            })
        }
        else {
            res.status(200).json({
                status: "Success",
                message: "New tour added to database",
                body: {
                    data: req.body
                }
            })
        }
    });

})


// Main routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


module.exports = app;
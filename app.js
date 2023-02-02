const express = require("express");
const morgan = require('morgan');
const tourRouter = require("./Routes/tourRoutes")
const userRouter = require("./Routes/userRoutes")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");


// 1) Initializing the express app
const app = express();

// 2) Get security Http headers
app.use(helmet());

// *********** Printing the environment ************
// console.log("--> env : ", process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// 3) Body parser , reading data from body into req.body , data should be less than 
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
// This will filter out all the dollar signs from all types of input
app.use(mongoSanitize());

// Data sanitization again XSS 
// Protect from malicious html and javascript code injected into the body
app.use(xss());

// Prevent parameter pollution , duplicate allowed with duration
app.use(hpp({
    whitelist: [
        "duration",
        "ratingsQuantity",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));


const limiter = rateLimit({
    // One hundred requests from the same ip in one hour can be done 
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "To many requests from this IP , please try again in an hour!"
})
// Prevent from (DOS and BRUTE-FORCE) like attacks
app.use("/api", limiter);

// Serving static assets for html files
app.use(express.static(`${__dirname}/public`))

// Check middle-ware
app.use((req, res, next) => {
    // console.log("Hello from the middle-ware");

    next();
});

// Manipulating the request object using middle-ware (Test middleware)
app.use((req, res, next) => {
    // console.log("Headers : ", req.headers);
    req.requestTime = new Date().toISOString();
    next();
});

// Main routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


// If Invalid route hit
// Responding to all the urls and all the request types (post,get,patch,delete)
// Isoperational set wil be true
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
})

// Error handling middleware
// Four parameters :- Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
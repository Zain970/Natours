const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");


const signToken = (id) => {
    // Creating a new token
    // Payload(id) and secret
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

// Signing up a new user
const signup = catchAsync(async (req, res, next) => {

    // So user cannot add something extra field in the database
    // If something missing error from the database
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    // Creating a token
    const token = signToken(newUser._id);
    // Sending the response
    res.status(201).json({
        status: "success",
        token,
        message: "new user signup",
        data: {
            user: newUser
        }
    });
});
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
        return next(new AppError("Please provide email and password !", 400));
    }

    // 2).Checks if user exists and password is correct , this will not return the password as password select is set to false in (userModel)
    // We have to explicitly get the password back as select:false is set in the model
    // Findone does'nt return the true and false rather it returns the email and password if the user exists or undefined
    // If there is no user or if there is the wrong password
    const user = await User.findOne({ email: email }).select("+password");

    // We are not really specifying what is incorrect : email or password
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    })
})

module.exports = {
    signup,
    login
}

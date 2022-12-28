const User = require("../Models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return token;
}

// Login a user
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // If email or password not provided
    if (!email || !password) {
        return next(new AppError("Please provide email and password !", 400));
    }
    // Finding user with this email and password
    const user = await User.findOne({ email: email }).select("+password");

    // Comparing the provided password with the hashed password present in the database
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password!", 400));
    }

    const token = signToken(user.id);
    console.log("Token : ", token);

    res.status(200).json({
        status: "success",
        token
    })
});

const signup = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return next("Please provide all the fields", 404);
    }
    const newUser = await User.create({
        name,
        email,
        password,
        confirmPassword
    });
    const token = signToken(newUser.id);

    console.log("Token : ", token);

    // 201 status for created 
    res.status(201).json({
        status: "success",
        token,
        message: "new user created"
    })

}

module.exports = {
    login,
    signup
}
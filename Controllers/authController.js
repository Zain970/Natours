const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");


const signToken = (id) => {
    // Creating a new token
    // Payload(id) and secret
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

// Signing up a new user
const signup = catchAsync(async (req, res, next) => {
    console.log("Request");
    // 1).So user cannot add any extra field in the database
    // 2).If something missing error from the database
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    // Creating the token
    const token = signToken(newUser._id);

    const cookieOptions = {
        expires: new Date(Data.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }
    res.cookie("jwt", token, cookieOptions)

    // Sending the response
    res.status(201).json({
        status: "success",
        token: token,
        message: "New user created",
        data: {
            newUser
        }
    });
});
const login = catchAsync(async (req, res, next) => {

    console.log("Request for login");

    // Getting email and password provided by the user
    const { email, password } = req.body;

    // 1).Check if email and password provided by the user
    // 2).If password or email not provided throw an error .
    if (!email || !password) {
        return next(new AppError("Please provide email and password !", 400));
    }

    // 2).We have to explicitly get the password back as select:false is set in the model
    // 3).Findone does'nt return the true and false rather it returns the email and password if the user exists or undefined if not
    // 5).This will not contain the password and we need the password for comparing the two passwords
    const user = await User.findOne({ email: email }).select("+password");

    // We are not really specifying what is incorrect : email or password
    // Checking if password provided is correct 
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);
    console.log("Token : ", token);
    res.status(200).json({
        status: "success",
        token,
        message: "user logged in"
    })
})
// For protecting the routes
const protect = catchAsync(async (req, res, next) => {
    // 1) Getting the token from the header
    let token = undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        // Getting the token from the header because token is present in the header
        token = req.headers.authorization.split(" ")[1];
    }
    // Token got from req.headers
    console.log("Token got from header : ", token);

    // If token not exist
    if (!token) {
        return next(new AppError("You are not logged in ! Please log in to get access.", 401))
    }

    // 2).Verification of the token
    // Token not changed by malicious third party
    // Make it return a promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Object creating the user id , provide token and get user id
    console.log("Decoded token   : ", decoded);

    // 3).Check if user still exists (that is token exists and the user is being deleted)
    const currentUser = await User.findById(decoded.id);
    console.log("User : ", currentUser);

    // User is deleted from the database
    if (!currentUser) {
        return new AppError("User belonging to this token no longer exists");
    }
    // 4).Check if user changed password after the token was issued
    // If password was changed that passwordChangedAfter exists
    // Someone stole your token , you changed your password so now password changed will be greater then the token issued time.
    // Old token that was issued before the password change should no longer be valid
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Old token is not valid ! Please log in again", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    console.log("Logged User : ", currentUser.name);
    next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ["admin","lead-guide"].role="user" 
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403))
        }
        next();
    }
}
// If the user has to reset the password
const forgotPassword = catchAsync(async (req, res, next) => {
    //  Check if email is provided
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is not provided.", 404))
    }
    // 1).Get user based on posted email
    const user = await User.findOne({ email: email });
    if (!user) {
        return next(new AppError("These is no user with this email address.", 404))
    }
    console.log("User : ", user);

    // 2).Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    // Argument is passed because error as all fields are not provided , deactivate all the validators
    await user.save({ validateBeforeSave: false });

    console.log("req.get(host) : ", req.get("host"));
    console.log("Protocol : ", req.protocol);

    // 3).Sent it to the user email through (node-mailer) -------------------------------------------------------------->
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    console.log("Reset url : ", resetURL);

    const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\nIf you didn't forget your password ,please ignore this email!`;
    try {
        // Calling the sendEmail function for sending the email
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message: message
        });

        res.status(200).json({
            status: "success",
            message: "Token sent to email!"
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("These was an error sending the email.Try again later!", 500))
    }

})
const resetPassword = catchAsync(async (req, res, next) => {

    // 1).Get user based on the token
    // Create the hash of the token to compare with the token saved in the database
    const token = req.params.token;
    console.log("Token from your email : ", token);
    // Create a hash to match with the hash present in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Finding the user with this token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        return next(new AppError("Token is invalid or has expired! ", 400));
    }
    // User fetched from the database
    console.log("User : ", user);

    // Now finally changing the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    // Password updated now set these fields to undefined so no one with this token can again change password (not now visible in the database)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // We want the validators to run
    // We want to save and not update because the validators and save middleware to run 
    await user.save();

    const newToken = signToken(user._id);

    // Sending the response
    res.status(201).json({
        status: "success",
        token: newToken,
        message: "password has been reset",

    });
});

const updatePassword = catchAsync(async (req, res, next) => {

    // 1).Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2).Check if posted current password is correct
    // Comparing the user provided password and password present in the database
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    // 3).If so update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    // We want the validations to run
    // User.findByIdandUpdate() has not been used because some validations will not run in this way , pre save middle-ware will not also work
    // We want the pre save middleware to run and encrypt the password
    // Both the pre save middleware in the model will not run
    await user.save();

    const newToken = signToken(user._id);
    // Sending the response
    res.status(200).json({
        status: "success",
        token: newToken,
        message: "password has been updated",
    });
})
module.exports = {
    signup,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword
}

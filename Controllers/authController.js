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
    console.log("Logging in user ......")
    // Getting email and password provided by the user
    const { email, password } = req.body;

    // 1).Check if email and password provided by the user
    // 2).If password or email not provided throw an error .
    if (!email || !password) {
        return next(new AppError("Please provide email and password !", 400));
    }

    // 2).We have to explicitly get the password back as select:false is set in the model
    // 3).Findone does'nt return the true and false rather it returns the email and password if the user exists or undefined if not
    // 4).If there is no user or if there is the wrong password
    // 5).This will not contain the password and we need the password for comparing the two passwords
    const user = await User.findOne({ email: email }).select("+password");

    // We are not really specifying what is incorrect : email or password
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password", 401));
    }

    console.log("User logged in .....")
    const token = signToken(user._id);
    console.log("Token : ", token);
    res.status(200).json({
        status: "success",
        token
    })
})
// For protecting the routes
const protect = catchAsync(async (req, res, next) => {
    let token = undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        // Getting the token from the headers headers because token is present in the header
        token = req.headers.authorization.split(" ")[1];
    }
    // Token got from req.headers
    console.log("Token in header : ", token);
    // If token not exist
    if (!token) {
        return next(new AppError("You are not logged in ! Please log in to get access", 401))
    }

    // 2).Verification of the token
    // Token not changed by malicious third party
    // Make it return a promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Object creating the user id , provide token and get user id
    console.log("Decoded : ", decoded);

    // 3).Check if user still exists (that is token exists and the user is being deleted)
    const currentUser = await User.findById(decoded.id);
    console.log("User : ", currentUser);

    // User is deleted from the database
    if (!currentUser) {
        return new AppError("User belonging to this token no longer exists");
    }
    // 4).Check if user changed password after the token was issued
    // If password was changed
    // Someone stole your token , you changed your password so now password changed will be greater then the token issued time.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please log in again", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
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

    await user.save({ validateBeforeSave: false });

    console.log("req.get(host) : ", req.get("host"));
    console.log("Protocol : ", req.protocol);


    // 3).Sent it to the user email(node-mailer) -------------------------------------------------------------->
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

    // Get user based on the token
    // Create the hash of the token to compare with the token saved in the database
    const token = req.params.token;
    console.log("Token from your email : ", token);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken
    });

    if (!user) {
        return next(new AppError("User not found with this password reset token ", 400));
    }
    // User fetched from the database
    console.log("User : ", user);
    // Request body
    console.log("Request : ", req.body);

    // Token issued has more than 10 minutes past

    if (Date.now() > user.passwordResetExpires) {
        return next(new AppError("Your token has expired .Again re issue token", 400));
    }

    // Now finally Changing the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    // Password updated now set these fields to undefined so no one with this token can again change password (not now visible in the database)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

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

    const user = await User.findById(req.user.id).select("+password");

    // Comparing the user provided password and password present in the database
    if (!(await User.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    // User.findByIdandUpdate() has not been used  because some validations will not run in this way , pre save middle-ware will not also work 


    // 1).Get user from collection

    // 2).Check if posted current password is correct

    // 3).If so update password

    // 4).Log user in , send Jwt



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

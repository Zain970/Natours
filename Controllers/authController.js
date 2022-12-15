const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");

const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: "success",
        message: "new user created",
        data: {
            user: newUser
        }
    });
});

module.exports = signup;

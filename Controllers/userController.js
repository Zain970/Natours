const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");

// Get all Users
const getAllUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();
    // Send response
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        length: users.length,
        data: {
            users
        }
    })
})

module.exports = {
    getAllUsers,
}

const User = require("../Models/userModel");
const AppError = require("../utils/appError");
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
const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    // For each field check if it is one of the allowed fields , then add it to the new object
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    console.log("Add to fields : ", newObj);
    return newObj;
}
// One place for updating the password and other place for updating other stuff of data
const updateMe = catchAsync(async (req, res, next) => {
    // 1).Create error if user posts password data

    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError("This route is not for password updates.Please use /updateMyPassword.", 404))
    }
    // Filtered out unwanted fields names that are not allowed 
    const filteredBody = filterObj(req.body, "name", "email");
    const updatedUser = await User.findByIdandUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
    // Save method is not good to use here because all the validators will be run
    // Required fields will also produce an error like confirmPassword
    // await user.save();

    // 2).Update user document
    res.status(200).json({
        status: "succcess",
        data: {
            user: updatedUser
        }
    });
})
const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: "success",
        data: null
    })
})
module.exports = {
    getAllUsers,
    updateMe,
    deleteMe
}

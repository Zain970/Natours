const APIFeatures = require("../utils/apiFeatures");
const User = require("../Models/UserModel");


aliasTopUsers = (req, res, next) => {

    // Prefilling the parts of the query
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"

    next();
}
// Create a new User
const createUser = async (req, res) => {
    try {
        // Creating a new User
        const newUser = await User.create(req.body)

        res.status(201).json({
            status: "success",
            message: "new User added ",
            data: {
                User: newUser
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error adding new User.",
            body: {
                err
            }
        })
    }
}

// Get all Users
const getAllUsers = async (req, res) => {

    try {

        // Execute query
        const features = new APIFeatures(User, req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        console.log("Query -->: ");

        const Users = await features.query;

        res.status(200).json({
            status: "success",
            requestedAt: req.requestTime,
            length: Users.length,
            data: {
                Users
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}

// Getting a specific User
const getSpecificUser = async (req, res) => {
    try {
        const id = req.params.id
        console.log("ID : ", id)
        console.log("Specific");

        const user = await User.findById(id);

        console.log('After fetching');

        res.status(200).json({
            status: "success",
            data: {
                user
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}

// Updating a User
const updateUser = async (req, res) => {
    try {

        const id = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            // Running validator of the model on updation
            runvalidators: true
        })

        res.status(200).json({
            status: "success",
            message: "User updated",
            data: {
                updatedUser
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}
// Deleting a User
const deleteUser = async (req, res) => {

    try {
        const id = req.params.id;
        await User.findByIdAndDelete(id);

        res.status(204).json({
            status: "success",
            message: "deleted successfully",
            data: null
        })

    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err

        })
    }
}


module.exports = {
    getAllUsers,
    getSpecificUser,
    updateUser,
    deleteUser,
    createUser

}

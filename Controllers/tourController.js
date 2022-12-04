const APIFeatures = require("../utils/apiFeatures");
const Tour = require("../Models/tourModel");


aliasTopTours = (req, res, next) => {

    // Prefilling the parts of the query
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"

    next();
}


// Create a new tour
const createTour = async (req, res) => {
    try {
        // Creating a new tour
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: "success",
            message: "new tour added ",
            data: {
                tour: newTour
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: "error adding new tour.",
            body: {
                err
            }
        })
    }
}



// Get all tours
const getAllTours = async (req, res) => {

    try {

        // Execute query
        const features = new APIFeatures(Tour, req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        console.log("Query -->: ");

        const tours = await features.query;

        res.status(200).json({
            status: "success",
            requestedAt: req.requestTime,
            length: tours.length,
            data: {
                tours
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

// Getting a specific tour
const getTour = async (req, res) => {

    try {
        const id = req.params.id
        const tour = await Tour.findById(id);
        if (tour) {
            res.status(200).json({
                status: "success",
                data: {
                    tour
                }
            })
        }
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}

// Updating a tour
const updateTour = async (req, res) => {
    try {

        const id = req.params.id;
        const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runvalidators: true
        })

        res.status(200).json({
            status: "success",
            message: "tour updated",
            data: {
                updatedTour
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
// Deleting a tour
const deleteTour = async (req, res) => {

    try {
        const id = req.params.id;
        await Tour.findByIdAndDelete(id);

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

const getTourStats = async () => {
    try {

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}


module.exports = {
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
    createTour,
    aliasTopTours
}

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

        res.status(200).json({
            status: "success",
            data: {
                tour
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

// Updating a tour
const updateTour = async (req, res) => {
    try {

        const id = req.params.id;
        const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            // Running validator of the model on updation
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

// Aggregation pipeline
const getTourStats = async (req, res) => {

    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: "$difficulty",
                    numTours: { $sum: 1 },
                    numRatings: { $sum: "$ratingsQuantity" },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            },
            {
                // 1 means ascending order
                $sort: {
                    avgPrice: 1
                }
            },
            // Can also repeat stages
            // {
            //     $match: {
            //         maxPrice: { $gte: 2000 }
            //     }
            // }
        ]);
        res.status(200).json({
            status: "success",
            requestedAt: req.requestTime,
            data: {
                stats
            }
        });

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }
}

const getMonthlyPlan = async (req, res) => {
    try {
        const year = parseInt(req.params.year)    // 2021
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match:
                {
                    startDates: {
                        $gte: new Date(`${year}-01-01 `),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:
                {

                    // Extract month from startDate field and group by it
                    _id: { $month: "$startDates" },
                    numTourStarts: { $sum: 1 },
                    tour: { $push: "$name" },
                }
            },
            {
                $addFields:
                {
                    month: "$_id"
                }
            },
            // Exclude _id filed by making it 0
            {
                $project: {
                    _id: 0
                }
            },
            // Sort by the field of number of tour starts
            {
                $sort:
                {
                    numTourStarts: -1
                }
            }
        ]);
        res.status(200).json({
            status: "success",
            length: plan.length,
            requestedAt: req.requestTime,
            data: {
                plan
            }
        });
    }
    catch (err) {
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
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
}

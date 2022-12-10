const APIFeatures = require("../utils/apiFeatures");
const Tour = require("../Models/tourModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

const aliasTopTours = (req, res, next) => {

    // Prefilling the parts of the query object
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"

    next();
}

// Create a new tour
const createTour = catchAsync(async (req, res, next) => {
    // Creating a new tour
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        message: "new tour added ",
        data: {
            tour: newTour
        }
    });
})

// Get all tours
const getAllTours = catchAsync(async (req, res, next) => {
    // Execute query
    const features = new APIFeatures(Tour, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        length: tours.length,
        data: {
            tours
        }
    })
})

// Getting a specific tour
const getTour = catchAsync(async (req, res, next) => {

    const id = req.params.id
    const tour = await Tour.findById(id);

    // If any tour with this id not found
    if (!tour) {
        return next(new appError("No tour found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
})

// Updating a tour
const updateTour = catchAsync(async (req, res, next) => {

    const id = req.params.id;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        // Running validator of the model on updation of the tour model : vaidators are run again when updating
        runvalidators: true
    })

    if (!updatedTour) {
        return next(new appError("No tour found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "tour updated",
        data: {
            updatedTour
        }
    })
})
// Deleting a tour
const deleteTour = catchAsync(async (req, res, next) => {

    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
        return next(new appError("No tour found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "deleted successfully",
        data: null
    })

})

// Aggregation pipeline
const getTourStats = catchAsync(async (req, res, next) => {

    // Agggregation pipeline

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

})

const getMonthlyPlan = catchAsync(async (req, res, next) => {
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

})

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

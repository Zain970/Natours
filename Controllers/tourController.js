const fs = require("fs");
const path = require("path");
// READING DATA FILE

const filePath = path.join(__dirname, "../dev-data/data/tours-simple.json");

let tours = fs.readFileSync(filePath, "utf-8");
tours = JSON.parse(tours);


const checkBody = (req, res, next) => {
    console.log("***********************************")
    console.log("Check body before adding a new tour");
    console.log("Body of new tour: ", req.body);
    console.log("***********************************")

    if (req.body.name == undefined) {
        res.status(404).json({
            status: "Fail",
            message: "Tour must have a name",
            data: {
            }
        });
    }
    else if (req.body.duration == undefined) {
        res.status(404).json({
            status: "Fail",
            message: "Tour must have a duration",
            data: {
            }
        })

    }
    else if (req.body.difficulty == undefined) {
        res.status(404).json({
            status: "Fail",
            message: "Tour must have a difficulty",
            data: {
            }
        });
    }
    else {
        next();
    }
}

const checkID = (req, res, next, val) => {
    const id = parseInt(val);

    // Checking the id if present
    const tour = tours.find((el) => {
        return el.id == id;
    });
    if (!tour) {
        res.status(404).json({
            status: "Fail",
            message: "Id not present . Invalid id",
            data: {
            }
        })
    }
    else {
        // If id is present then request goes to the next routes
        next();
    }
};
// Get all tours
const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        result: tours.length,
        body: {
            tours
        }
    })
}
// Adding a new tour
const createTour = (req, res) => {

    // extracting id to assign to new tour
    const newId = tours[tours.length - 1].id + 1;
    // making a new tour
    const newTour = Object.assign({ id: newId }, req.body);
    // pushing new tour along with the other tours
    tours.push(newTour);
    // writing tours back to the file
    fs.writeFile(filePath, JSON.stringify(tours), (err, data) => {
        if (err) {
            res.status(404).json({
                status: "fail",
                message: "fail adding new tour",
                data: {
                    tour: newTour
                }
            })

        }
        res.status(201).json({
            status: "success",
            message: "new tour added",
            data: {
                tour: newTour
            }
        });
    });
}
// Getting a specific tour
const getSpecificTour = (req, res) => {

    const id = parseInt(req.params.id);

    const tour = tours.find((el) => {
        return el.id == id;
    })
    if (tour) {
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        })
    }
    else {
        res.status(404).json({
            status: "Fail",
            message: "Invalid id",
            data: {
            }
        })
    }
}
// Updating a tour
const updateTour = (req, res) => {

    const id = parseInt(req.params.id);
    console.log("Id in patch : ", id);

    const tour = tours.find((el) => {
        return el.id == id;
    })

    if (tour) {
        res.status(200).json({
            status: "success",
            message: "tour updated"
        })
    }
    else {
        res.status(404).json({
            status: "Fail",
            message: "Invalid id.Cannot be updated",
            data: {
            }
        })
    }
}
// Deleting a tour
const deleteTour = (req, res) => {

    const id = parseInt(req.params.id);
    console.log("id in delete : ", id);
    const tour = tours.find((el) => {
        return el.id == id;
    })
    if (tour) {
        res.status(204).json({
            status: "success",
            data: null
        })
    }
    else {
        res.status(404).json({
            status: "fail",
            message: "Invalid id.Cannot be deleted",
            data: {}
        })
    }
}


module.exports = {
    getAllTours,
    getSpecificTour,
    updateTour,
    deleteTour,
    createTour,
    checkID,
    checkBody
}
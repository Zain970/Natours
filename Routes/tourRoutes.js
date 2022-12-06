const express = require("express");
const tourController = require("../Controllers/tourController.js")

const router = express.Router();

// Param middlware if id is passed -------------------------
// router.param("id", tourController.checkID)

// Alias top tours
// limit=5&sort=ratingsAverage,price
// Modify the request object
router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);

// Aggregation pipe-line
router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);


router.route("/")
    .get(tourController.getAllTours)
    // Check body middle-ware is called first before adding new tour
    .post(tourController.createTour);

router.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;
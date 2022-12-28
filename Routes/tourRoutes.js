const express = require("express");
const tourController = require("../Controllers/tourController.js")
const authController = require("../Controllers/authController");

const router = express.Router();

// Param middlware if id is passed  to check before all the routes that if id is present -------------------------
// router.param("id", tourController.checkID)

// Alias top tours
// limit=5&sort=ratingsAverage,price
// Modify the request object using aliasTopTours and then pass to the get all tours
router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);

// Aggregation pipe-line
router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);


router.route("/")
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour
    );

module.exports = router;
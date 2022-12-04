const express = require("express");
const tourController = require("../Controllers/tourController.js")

const router = express.Router();

// Param middlware if id is passed -------------------------
// router.param("id", tourController.checkID)

// Alias top tours
// limit=5&sort=ratingsAverage,price
router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/")
    .get(tourController.getAllTours)
    // Check body middle-ware is called first before adding new tour
    .post(tourController.createTour);

router.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;
const express = require("express");
const tourController = require("../Controllers/tourController.js")

const router = express.Router();

// Param middlware if ID is passed
router.param("id", tourController.checkID)

router.route("/")
    .get(tourController.getAllTours)

    // Check body middle-ware is called first before adding new tour
    .post(tourController.checkBody, tourController.createTour);

router.route("/:id")
    .get(tourController.getSpecificTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;
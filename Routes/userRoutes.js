const express = require("express");
const userController = require("../Controllers/userController.js");
const authController = require("../Controllers/authController.js");

const router = express.Router();

// Only post the data , so new user can be created
router.post("/signup", authController.signup);

router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route("/:id")
    .get(userController.getSpecificUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


module.exports = router;
const express = require("express");
const userController = require("../Controllers/userController.js");
const authController = require("../Controllers/authController.js");

const router = express.Router();

// Only post the data , so new user can be created , creating new user and assigning the token to the new user
router.post("/signup", authController.signup);

// Logining in the user that is assigning new token to the user
router.post("/login", authController.login);

router.route("/")
    .get(userController.getAllUsers)



module.exports = router;
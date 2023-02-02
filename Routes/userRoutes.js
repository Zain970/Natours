const express = require("express");
const userController = require("../Controllers/userController.js");
const authController = require("../Controllers/authController.js");

const router = express.Router();



router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgetPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/updateMyPassword", authController.protect, authController.updatePassword);


router.patch("/updateMe", authController.protect, userController.updateMe)
router.delete("/deleteMe", authController.protect, userController.deleteMe);


router.route("/")
    .get(userController.getAllUsers)

module.exports = router;
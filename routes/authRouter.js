const express = require("express");
const authController = require("./../controller/authController");

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/getAllUsers").get(authController.protect, authController.getAllUsers);
router.route("/userValid").get(authController.protect, authController.userValid);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/forgotPassword").patch(authController.forgotPassword);

module.exports = router;

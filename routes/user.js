const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/users.js");

// Redirect /signup to /signup/user
router.get("/signup", (req, res) => res.redirect("/user/signup"));

// USER SIGNUP
router.route("/user/signup")
    .get(userController.renderUserSignupForm)
    .post(wrapAsync(userController.userSignup));

// LOGIN
router.route("/user/login")
    .get(userController.renderUserLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("user-local", {
            failureRedirect: "/user/login",
            failureFlash: "Invalid credentials. Please try again."
        }),
        userController.userLogin  // ✅ Fixed Reference Here
    );

// LOGOUT
router.get("/logout", userController.logout);

module.exports = router;

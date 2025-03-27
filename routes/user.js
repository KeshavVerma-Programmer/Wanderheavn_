const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/users.js");
const User = require("../models/user"); // Import the Host model

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
router.get("/user/profile",async (req, res) => {
    console.log("Current User:", req.user); // Debugging Line

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/user/login");
        }
        res.render("users/profile", { user });
    } catch (err) {
        console.error("Error fetching host profile:", err);
        req.flash("error", "Something went wrong.");
        res.redirect("/host/dashboard");
    }
});


module.exports = router;

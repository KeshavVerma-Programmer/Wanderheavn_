const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isHost, validateListing, isLoggedIn, canCreateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

const {
    renderHostSignupForm,
    hostSignup,
    renderHostLoginForm,
    hostLogin,
    renderDashboard,
    manageListings,
    addListing,        
    editListing,       
    deleteListing,
    manageBookings,
    approveBooking,
    rejectBooking,
    logout
} = require("../controllers/hosts");


const mongoose = require("mongoose"); // For ID validation

// ==========================
// HOST SIGNUP
// ==========================
router.get("/signup", renderHostSignupForm);
router.post("/signup", wrapAsync(hostSignup));

// ==========================
// HOST LOGIN
// ==========================
router.get("/login", renderHostLoginForm);
// router.post("/login", passport.authenticate("host-local", {
//     failureFlash: true,
//     failureRedirect: "/host/login",
//     successRedirect: "/host/dashboard"
// }));
router.post("/login", (req, res, next) => {
    req.logout(() => next());
}, passport.authenticate("host-local", {
    failureFlash: true,
    failureRedirect: "/host/login",
    successRedirect: "/host/dashboard"
}));


// ==========================
// HOST DASHBOARD
// ==========================
router.get("/dashboard", isHost, wrapAsync(renderDashboard));

// ==========================
// MANAGE LISTINGS
// ==========================
router.get("/manage-listings", isHost, wrapAsync(manageListings));
router.post("/host/manage-listings", isLoggedIn, isHost, canCreateListing, validateListing, wrapAsync(addListing));


router.get("/listings/new", isHost, (req, res) => {
    res.render("host/addListing"); // Make sure this path matches the actual location of `addListing.ejs`
});
router.post("/listings/new", isHost, validateListing, wrapAsync(addListing));


router.get("/listings/:id/edit", isHost, wrapAsync(editListing));
router.post("/listings/:id/edit", isHost, wrapAsync(editListing));

router.post("/listings/:id/delete", isHost, wrapAsync(deleteListing));

// ==========================
// MANAGE BOOKINGS
// ==========================
router.get("/manage-bookings", isHost, wrapAsync(manageBookings));

router.post("/bookings/:id/approve", isHost, wrapAsync(approveBooking));
router.post("/bookings/:id/reject", isHost, wrapAsync(rejectBooking));

// ==========================
// LOGOUT
// ==========================
router.post("/logout", logout);

module.exports = router;

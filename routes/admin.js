const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin, isAdminLoggedIn } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const {
    renderAdminLoginForm,
    adminLogin,
    logout,
    adminDashboard,
    manageUsers,
    deleteUser,
    manageListings,
    approveListing,
    rejectListing,
    featureListing
 ,manageHosts,deleteHosts,viewListing,renderEditForm,updateListing,renderDeletePage,deleteListing
} = require("../controllers/admin");



// Middleware for admin authentication (ensure only admin can access)

const ADMIN_SECRET_KEY = "SECRET123";
// Middleware to check secret key in URL
const checkSecretKey = (req, res, next) => {
    const providedKey = req.query.key;

    if (providedKey === ADMIN_SECRET_KEY) {
        return next(); // Proceed to login page
    }

    // Redirect or send an error message if the key is wrong/missing
    req.flash("error", "Unauthorized Access!");
    return res.redirect("/listings");
};
// ==========================
// ADMIN LOGIN
// ==========================
router.get("/login", checkSecretKey,renderAdminLoginForm);
router.post("/login", passport.authenticate("admin-local", {
    failureRedirect: "/admin/login",
    failureFlash: true
}), adminLogin);

// ==========================
// ADMIN LOGOUT
// ==========================
router.post("/logout", logout);

// ==========================
// ADMIN DASHBOARD
// ==========================
router.get("/dashboard", isAdminLoggedIn, adminDashboard);

// ==========================
// MANAGE USERS
// ==========================
router.get("/manage-users", isAdmin, manageUsers);
router.delete("/manage-users/:id/delete", isAdmin, deleteUser);

router.get("/manage-hosts", isAdmin, manageHosts);
router.delete("/manage-hosts/:id/delete", isAdmin, deleteHosts);

// ==========================
// MANAGE LISTINGS
// ==========================
router.get("/manage-listings", isAdmin, manageListings);
router.post("/manage-listings/:id/approve", isAdmin, approveListing);
router.post("/manage-listings/:id/reject", isAdmin, rejectListing);
router.post("/manage-listings/:id/feature", isAdmin, featureListing);
// router.post("/manage-listings/:id/delete", isAdmin, deleteListing);



// // View Listing Details




router.get("/listings/:id", isAdmin, viewListing);

// Route to show edit form for a specific listing (Admin Panel)
router.get("/listings/:id/edit", isAdmin,renderEditForm);

// Route to update a specific listing (Admin Panel)
// router.put("/listings/:id", isAdmin, upload.single("image"), updateListing);
router.put("/listings/:id", isAdmin, upload.single("listing[images]"), updateListing);

// router.put("/listings/:id", isAdmin, upload.single("listing[image]"), updateListing);
router.get("/listings/:id/delete", isAdmin, renderDeletePage);

// Route to handle listing deletion
router.delete("/listings/:id", isAdmin, deleteListing);



module.exports = router;

const Admin = require("../models/admin");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const mongoose = require("mongoose"); // For ID validation
const Host=require("../models/host");
// ==========================
// ADMIN LOGIN
// ==========================
module.exports.renderAdminLoginForm = (req, res) => {
    res.render("admin/login");
};

module.exports.adminLogin = (req, res) => {
    req.flash("success", "Welcome Admin!");
    res.redirect("/admin/dashboard");
};

// ==========================
// ADMIN LOGOUT
// ==========================
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Admin logged out successfully.");
        res.redirect("/admin/login");
    });
};

// ==========================
// ADMIN DASHBOARD
// ==========================
module.exports.adminDashboard = async (req, res) => {
    try {
        const [totalUsers, totalListings, pendingReviews,totalhosts] = await Promise.all([
            User.countDocuments({}),
            Listing.countDocuments({}),
            Review.countDocuments({ status: "Pending" }),
            Host.countDocuments({})
        ]);

        res.render("admin/dashboard", { totalUsers, totalListings, pendingReviews ,totalhosts});
    } catch (error) {
        console.error("Dashboard Error:", error);
        req.flash("error", "Failed to load dashboard data.");
        res.redirect("/admin/login");
    }
};

// ==========================
// MANAGE USERS
// ==========================
module.exports.manageUsers = async (req, res) => {
    const users = await User.find({});
    res.render("admin/manageUsers", { users });
};


module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    console.log("Deleting user with ID:", id);  // Debugging line

    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid User ID.");
        return res.redirect("/admin/manage-users");
    }

    const user = await User.findByIdAndDelete(id);
    console.log("Deleted User:", user);  // Debugging line

    req.flash(user ? "success" : "error", user ? "user deleted successfully." : "user not found.");
    res.redirect("/admin/manage-users");
};
// ==========================
// MANAGE HOSTS
// ==========================
module.exports.manageHosts = async (req, res) => {
    const hosts = await Host.find({});
    res.render("admin/manageHosts", { hosts });
};

module.exports.deleteHosts = async (req, res) => {
    const { id } = req.params;
    console.log("Deleting host with ID:", id);  // Debugging line

    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid User ID.");
        return res.redirect("/admin/manage-hosts");
    }

    const host = await Host.findByIdAndDelete(id);
    console.log("Deleted Host:", host);  // Debugging line

    req.flash(host ? "success" : "error", host ? "Host deleted successfully." : "Host not found.");
    res.redirect("/admin/manage-hosts");
};



// ==========================
// MANAGE LISTINGS
// ==========================
module.exports.manageListings = async (req, res) => {
    const listings = await Listing.find({});
    res.render("admin/manageListings", { listings });
};

module.exports.approveListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid Listing ID.");
        return res.redirect("/admin/manage-listings");
    }

    const listing = await Listing.findByIdAndUpdate(id, { status: "Active" });
    req.flash(listing ? "success" : "error", listing ? "Listing approved successfully!" : "Listing not found.");
    res.redirect("/admin/manage-listings");
};

module.exports.rejectListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid Listing ID.");
        return res.redirect("/admin/manage-listings");
    }

    const listing = await Listing.findByIdAndUpdate(id, { status: "Inactive" });
    req.flash(listing ? "success" : "error", listing ? "Listing rejected successfully!" : "Listing not found.");
    res.redirect("/admin/manage-listings");
};

module.exports.featureListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid Listing ID.");
        return res.redirect("/admin/manage-listings");
    }

    await Listing.updateMany({}, { isFeatured: false });
    const listing = await Listing.findByIdAndUpdate(id, { isFeatured: true });

    req.flash(listing ? "success" : "error", listing ? "Listing marked as Featured!" : "Listing not found.");
    res.redirect("/admin/manage-listings");
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid Listing ID.");
        return res.redirect("/admin/manage-listings");
    }

    const listing = await Listing.findByIdAndDelete(id);
    req.flash(listing ? "success" : "error", listing ? "Listing deleted successfully." : "Listing not found.");
    res.redirect("/admin/manage-listings");
};

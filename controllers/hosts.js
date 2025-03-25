const Host = require("../models/host");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const mongoose = require("mongoose");

// ==========================
// HOST SIGNUP
// ==========================
module.exports.renderHostSignupForm = (req, res) => {
    res.render("hosts/signup", { username: "", email: "", phone: "" });
};

module.exports.hostSignup = async (req, res, next) => {
    console.log("Received Data:", req.body); // Debugging

    const { username, email, phone, password, accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    try {
        const newHost = new Host({ 
            username, 
            email, 
            phone,
            role: "host",  // Ensure role is assigned
            bankDetails: {
                accountHolderName,
                accountNumber,
                ifscCode,
                bankName
            }
        });

        const registeredHost = await Host.register(newHost, password);

        req.login(registeredHost, (err) => {
            if (err) return next(err);
            console.log("Logged in user:", req.user); // Debugging
            req.flash("success", "Welcome to WanderHeavn as a Host!");
            res.redirect("/host/dashboard");
        });
    } catch (error) {
        console.error("Signup Error:", error.message);
        req.flash("error", error.message);
        res.render("hosts/signup", { username, email, phone });
    }
};



// ==========================
// HOST LOGIN
// ==========================
module.exports.renderHostLoginForm = (req, res) => {
    res.render("hosts/login");
};

module.exports.hostLogin = (req, res) => {
    console.log("Authenticated User in Login:", req.user); // Debugging

    if (!req.user) {
        req.flash("error", "Invalid username/email or password. Please try again.");
        return res.redirect("/host/login");
    }

    if (req.user.role !== "host") {
        req.flash("error", "You must be a host to access this route.");
        return res.redirect("/host/login");
    }

    req.flash("success", "Welcome back to WanderHeavn!");
    res.redirect("/host/dashboard");
};





// ==========================
// DASHBOARD
// ==========================
module.exports.renderDashboard = async (req, res) => {
    try {
        const totalListings = await Listing.countDocuments({ owner: req.user._id }); // Count listings owned by the host

        const activeBookings = await Booking.countDocuments({ host: req.user._id, status: "Confirmed" });
        const pendingRequests = await Booking.countDocuments({ host: req.user._id, status: "Pending" });

        // Calculate total earnings
        const bookings = await Booking.find({ host: req.user._id, status: "Confirmed" });
        const totalEarnings = bookings.reduce((sum, booking) => sum + booking.amountPaid, 0);

        // Pass all variables to the template
        res.render("host/dashboard", { totalListings, activeBookings, pendingRequests, totalEarnings });
    } catch (error) {
        console.error("Dashboard Error:", error);
        req.flash("error", "Failed to load dashboard data.");
        res.redirect("/listings");
    }
};


// ==========================
// MANAGE LISTINGS
// ==========================
module.exports.manageListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    res.render("host/manageListings", { listings });
};

module.exports.addListing = async (req, res) => {
    console.log("Request Body:", req.body); // Debug incoming data

    if (!req.user || req.user.role !== "host") {  
        req.flash("error", "Only hosts can create listings.");  
        return res.redirect("/host/manage-listings");  
    }

    try {
        const newListing = new Listing({ 
            ...req.body.listing, 
            owner: req.user._id
        });

        await newListing.save();
        req.flash("success", "New listing added successfully!");
        res.redirect("/host/manage-listings");
    } catch (error) {
        console.error("Error adding listing:", error);
        req.flash("error", "Failed to add listing. Please try again.");
        res.redirect("/host/manage-listings");
    }
};



module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid Listing ID.");
        return res.redirect("/host/manage-listings");
    }

    const listing = await Listing.findById(id);
    if (!listing || !listing.owner.equals(req.user._id)) {
        req.flash("error", "Listing not found or unauthorized access.");
        return res.redirect("/host/manage-listings");
    }

    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Listing updated successfully!");
    res.redirect("/host/manage-listings");
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing || !listing.owner.equals(req.user._id)) {
        req.flash("error", "Listing not found or unauthorized access.");
        return res.redirect("/host/manage-listings");
    }

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully.");
    res.redirect("/host/manage-listings");
};

// ==========================
// MANAGE BOOKINGS
// ==========================
module.exports.manageBookings = async (req, res) => {
    const bookings = await Booking.find({ host: req.user._id });
    res.render("host/manageBookings", { bookings });
};

module.exports.approveBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: "Confirmed" });
    req.flash(booking ? "success" : "error", booking ? "Booking approved successfully!" : "Booking not found.");
    res.redirect("/host/manage-bookings");
};

module.exports.rejectBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: "Rejected" });
    req.flash(booking ? "success" : "error", booking ? "Booking rejected successfully!" : "Booking not found.");
    res.redirect("/host/manage-bookings");
};

// ==========================
// LOGOUT
// ==========================
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout Error:", err);
            req.flash("error", "Failed to log out. Please try again.");
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

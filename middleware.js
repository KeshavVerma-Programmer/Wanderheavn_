const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require("./schema.js");

// Ensures the user is authenticated and redirects them accordingly
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");

        // Redirect users based on role if they exist, otherwise send them to login
        if (req.user) {
            if (req.user.role === "host") {
                return res.redirect("/host/login");
            }
            if (req.user.role === "admin") {
                return res.redirect("/admin/login");
            }
        }

        return res.redirect("/login"); // Default login page
    }
    next();
};



// Saves redirect URL for post-login redirection
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Ownership validation for listings
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Listing validation
module.exports.validateListing = (req, res, next) => {
    // ✅ Convert category to Title Case
    if (req.body.listing && req.body.listing.category) {
        req.body.listing.category =
            req.body.listing.category.charAt(0).toUpperCase() +
            req.body.listing.category.slice(1).toLowerCase();
    }

    // ✅ Validate the listing after normalizing the category
    const { error } = listingSchema.validate(req.body);
    
    if (error) {
        console.log("Validation Error:", error.details); // Debugging
        const errMsg = error.details.map((el) => el.message).join(", ");
        req.flash("error", `Validation Error: ${errMsg}`);
        return res.redirect(req.session.redirectUrl || "/listings");
    }

    next();
};

// Review validation
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(',');
        req.flash("error", `Review Error: ${errMsg}`);
        return res.redirect(req.session.redirectUrl || "/listings");
    }
    next();
};

// Ensures the user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Admin Access Control
module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "You must be logged in as an admin.");
        return res.redirect("/admin/login");
    }
    next();
};

// Admin Access Control (Alternative - Already Present)
module.exports.isAdminLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "You must be logged in as an admin.");
        return res.redirect("/admin/login");
    }
    next();
};

// Host Access Control
module.exports.isHost = (req, res, next) => {
    console.log("Session Data:", req.session);
    console.log("Authenticated User in Middleware:", req.user);

    if (!req.isAuthenticated() || req.user.role !== "host") {
        req.flash("error", "You must be a host to access this route.");
        return res.redirect("/host/login");
    }
    next();
};

module.exports.canCreateListing = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "host") {
        req.flash("error", "Only hosts can create listings.");
        return res.redirect("/host/login");
    }
    next();
};



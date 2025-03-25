const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const mongoose = require("mongoose"); // For ObjectId validation
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const {
    validateReview,
    isLoggedIn,
    isReviewAuthor
} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// POST Review Route
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// DELETE Review Route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { reviewId, id } = req.params;

    // ✅ Check for valid ObjectId
    if (!mongoose.isValidObjectId(reviewId)) {
        req.flash("error", "Invalid review ID.");
        return res.redirect(`/listings/${id}`);
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success", "Review deleted successfully.");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;

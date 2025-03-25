const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, isHost } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const mongoose = require("mongoose");

// Route to display all listings
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    isHost,
    upload.array("listing[images]"),
    (req, res, next) => {
      console.log("Received Body:", req.body);
      console.log("Received Files:", req.files);

      if (!req.files || req.files.length === 0) {
        req.flash("error", "No images uploaded.");
        return res.redirect("/listings/new");
      }

      req.body.listing.images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));

      // Capitalize first letter of category
      if (req.body.listing.category) {
        req.body.listing.category =
          req.body.listing.category.charAt(0).toUpperCase() +
          req.body.listing.category.slice(1).toLowerCase();
      }

      // ✅ Store owner as a string (not ObjectId)
      req.body.listing.owner = req.user._id.toString(); // ✅ Fix here

      next();
    },
    validateListing,
    wrapAsync(listingController.createListing)
  );


// New listing form
router.get("/addListing", isLoggedIn, isHost, listingController.renderNewForm);

// Show, Update, and Delete Listings
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.array("listing[images]"),
    (req, res, next) => {
      req.body.listing.images = req.files?.length
        ? req.files.map((file) => ({
            url: file.path,
            filename: file.filename,
          }))
        : [];
      next();
    },
    validateListing,
    wrapAsync(async (req, res) => {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Invalid listing ID.");
        return res.redirect("/listings");
      }

      const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
      if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
      }

      if (req.files?.length) {
        listing.images = req.body.listing.images;
        await listing.save();
      }

      req.flash("success", "Listing updated successfully!");
      res.redirect(`/listings/${id}`);
    })
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;

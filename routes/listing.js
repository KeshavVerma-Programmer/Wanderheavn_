const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, isHost } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const mongoose = require("mongoose");
const Booking = require("../models/booking.js");

// Route to display all listings
router
  .route("/")
  .get(async (req, res) => {
    const { search, category } = req.query;
    let filter = {};
  
    if (search) {
      filter = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { price: !isNaN(search) ? parseInt(search) : undefined }
        ].filter(Boolean)
      };
    }
  
    if (category) {
      filter.category = category; // Match category in the database
    }
  
    try {
      const allListings = await Listing.find(filter);
      res.render("listings/index", { allListings, category, search, currUser: req.user });
    } catch (err) {
      console.error(err);
      res.redirect("/listings");
    }
  })
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

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing));

  router.get("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    res.render("bookings/book", { listing, currUser: req.user });
}));

router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    // Set predefined check-in and check-out dates
    const checkInDate = new Date(); // Default to today
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 3); // Example: Fixed 3-day stay

    // Check if the listing is already booked for the predefined dates
    const existingBooking = await Booking.findOne({
        property: id,
        $or: [
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } } // Overlapping dates
        ]
    });

    if (existingBooking) {
        req.flash("error", "This listing is already booked for the selected dates.");
        return res.redirect(`/listings/${id}/book`);
    }

    // Store new booking
    const newBooking = new Booking({
        property: id,
        guest: req.user._id,
        host: listing.owner,
        checkInDate,
        checkOutDate,
        totalPrice: (Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))) * listing.price,
        status: "Active"
    });

    await newBooking.save();

    // Add booked dates to Listing model
    const bookedDates = [];
    let currentDate = new Date(checkInDate);
    while (currentDate <= checkOutDate) {
        bookedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    listing.bookedDates.push(...bookedDates);
    await listing.save();

    req.flash("success", "Booking confirmed! Proceed to payment.");
    res.redirect(`/listings/${id}/payment`);
}));

module.exports = router;

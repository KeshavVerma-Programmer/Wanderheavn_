const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.getBookingPage = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("bookings/book", { listing, currUser: req.user });
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { bookingDates } = req.body;

    if (!bookingDates || bookingDates.length === 0) {
        req.flash("error", "Please select at least one date to proceed with booking.");
        return res.redirect(`/listings/${id}/book`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    // Convert selected dates to YYYY-MM-DD format
    const selectedDates = bookingDates.split(",").map(date => new Date(date).toISOString().split("T")[0]);

    // Ensure bookedDates are also in YYYY-MM-DD format before checking
    const bookedDates = listing.bookedDates.map(date => new Date(date).toISOString().split("T")[0]);

    // Check if any selected date is already in the bookedDates array
    const alreadyBooked = selectedDates.some(date => bookedDates.includes(date));

    if (alreadyBooked) {
        req.flash("error", "One or more selected dates are already booked.");
        return res.redirect(`/listings/${id}/book`);
    }

    // Store the new booking
    const newBooking = new Booking({
        property: id,
        guest: req.user._id,
        host: listing.owner,
        bookedDates: selectedDates, // Save only booked dates, no check-in/out
        totalPrice: selectedDates.length * listing.price,
        status: "Active"
    });

    await newBooking.save();

    // Add booked dates to Listing model
    listing.bookedDates.push(...selectedDates);
    await listing.save();

    req.flash("success", "Booking confirmed! Proceed to payment.");
    res.redirect(`/listings/${id}/payment?bookingId=${newBooking._id}`); // ✅ Pass bookingId in query
};

module.exports.getPaymentPage = async (req, res) => {
    const { id } = req.params;
    const bookingId = req.query.bookingId; // ✅ Correct way to get query parameter

    console.log("➡️ Route hit: /listings/" + id + "/payment?bookingId=" + bookingId); // Debugging log

    if (!bookingId) {
        console.log("❌ Missing Booking ID");
        req.flash("error", "Invalid booking request.");
        return res.redirect(`/listings/${id}/book`);
    }

    try {
        const booking = await Booking.findById(bookingId).populate("property");

        if (!booking) {
            console.log("❌ Booking not found in DB");
            req.flash("error", "Booking not found.");
            return res.redirect(`/listings/${id}/book`);
        }

        console.log("✅ Booking found, rendering payment page:", booking);
        res.render("bookings/payment", { booking });
    } catch (err) {
        console.error("❌ Error fetching booking:", err);
        req.flash("error", "Something went wrong.");
        return res.redirect(`/listings/${id}/book`);
    }
};

module.exports.processPayment = async (req, res) => {
    const { bookingId } = req.body; // Booking ID from form

    if (!bookingId) {
        req.flash("error", "Invalid payment request.");
        return res.redirect("back");
    }

    const booking = await Booking.findById(bookingId).populate("property");

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("back");
    }

    // 🚀 Simulate Payment Processing (Replace this with real payment gateway integration)
    booking.status = "Paid"; // ✅ Mark as paid
    await booking.save();

    req.flash("success", "Payment successful! Your booking is confirmed.");
    
    // ✅ Redirect to confirmation page
    res.redirect(`/listings/${booking.property._id}/confirmation?bookingId=${booking._id}`);
};

module.exports.getConfirmationPage = async (req, res) => {
    const { bookingId } = req.query;

    if (!bookingId) {
        req.flash("error", "Invalid booking.");
        return res.redirect("/listings");
    }

    const booking = await Booking.findById(bookingId).populate("property");

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/listings");
    }

    res.render("bookings/confirmation", { booking, currUser: req.user });
};



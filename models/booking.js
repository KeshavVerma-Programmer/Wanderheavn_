const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    property: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookedDates: { type: [Date], required: true }, // Store an array of booked dates,
    totalPrice: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ["Active", "Already booked"],
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

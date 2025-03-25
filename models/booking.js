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
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.checkInDate;
            },
            message: "Check-out date must be after check-in date."
        }
    },
    totalPrice: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Rejected", "Completed", "Cancelled"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

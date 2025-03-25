const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;
const User = require("../models/user");

const hostSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, default: "host" },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    properties: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
    bankDetails: {
        accountHolderName: { type: String, required: true },
        accountNumber: { 
            type: String, 
            required: true, 
            unique: true, // Prevent duplicate accounts
            validate: {
                validator: (v) => /^[0-9]{9,18}$/.test(v),
                message: "Invalid account number format."
            }
        },
        ifscCode: { 
            type: String, 
            required: true, 
            match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            message: "Invalid IFSC code format."
        },
        bankName: { type: String, required: true }
    },
    earnings: {
        totalEarnings: { type: Number, default: 0 },
        payoutHistory: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, default: Date.now }
            }
        ]
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, { timestamps: true });

hostSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Host", hostSchema);

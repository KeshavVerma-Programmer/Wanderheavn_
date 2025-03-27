const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;
const User = require("../models/user");
const {required} = require("joi");

const hostSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
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

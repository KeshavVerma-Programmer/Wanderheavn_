// const mongoose=require("mongoose");
// const Schema=mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose");


// const userSchema = new Schema({
//     email:{
//         type: String,
//         require: true
//     }
// });

// userSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model("User",userSchema);


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Invalid email format"]
    },
    role: {
        type: String,
        enum: ["user", "host", "admin"],
        default: "user"
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);




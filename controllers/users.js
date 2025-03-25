const User = require("../models/user");
const passport = require("passport");

module.exports.renderUserSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.userSignup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Create a new User instance
        const user = new User({ username, email });

        // Register user with hashed password
        const registeredUser = await User.register(user, password);

        // Automatically log the user in after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to WanderHeavn!");
            res.redirect("/listings");
        });

    } catch (error) {
        console.error("User Registration Error:", error);
        req.flash("error", error.message);
        res.redirect("/user/signup");
    }
};

module.exports.renderUserLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.userLogin = (req, res, next) => {
    passport.authenticate("user-local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash("error", info?.message || "Invalid username/email or password.");
            return res.redirect("/user/login");
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome back to WanderHeavn!");
            res.redirect(res.locals.redirectUrl || "/listings");
        });
    })(req, res, next);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            console.error("Logout Error:", err);
            req.flash("error", "Failed to log out. Please try again.");
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

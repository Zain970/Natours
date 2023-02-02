const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email!"],
        unique: true,
        lowercase: true,   // Transform email to the lower-case (not produce error)
        // Custom validator : validator.isEmail
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        // 1).This only works on SAVE !!! AND CREATE !!!
        // 2).This will not work on the update and findOneandUpdate
        validate: {
            validator: function (value) {
                return value == this.password           // abc == abc
            },
            // This messsage will be returned if both password not equal
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    // 10 minutes to reset the password
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
// 1).Mongoose middle-ware
// 2).Encrypting the password when saving a new user and updating password(save is called when modifing the password)
// 3).Only run this function if password was actually modified
userSchema.pre("save", async function (next) {
    // console.log("User middlware :", this);
    // 1).Only encrypt the password if the password field is updated
    // 2).If email changed we dont want to encrypt the password again
    // 3).If the password has been modified or new user is created then go down this false
    // 4).Checking if password is changed

    if (!this.isModified("password")) {
        return next();
    }
    // 1).Encrypting the password using hashing
    // 2).Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // 1).Now we dont need this field
    // 2).We just needed it for comparing the two passwords
    // 3).Only required input , not required to be persisted in the database
    this.confirmPassword = undefined;
    console.log("( User model ) New user to be saved in database : ", this);
    next();
})

// This will run when the new document is saved
userSchema.pre("save", function (next) {
    // When new document is created then return because password is not changed in this case
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    // Putting password changed one second in the past
    // Saving to the database is bit slower then issueing the json web token

    this.passwordChangedAt = Date.now() - 1000;
    next();
})


// Creating a instance method
// This function returns true if the password are same and false  the password a re not the same
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // 1).this points to the current document
    // 2).candidate password is the original password (not-hashed)
    // 3).userPassword is the hashed password
    // 4)this.password will not be available because password select : false
    // console.log("Email : ", this.email)
    // console.log("Password : ", this.password);

    return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

    if (this.passwordChangedAt) {
        // Converting into milliseconds and parsing into the integer
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // Password changed is greater then token issued time so return true
        // Token issued at 100 , and we changed password at 200 so return true, we changed password after the token was issued
        return JWTTimestamp < changedTimestamp; // 100 < 200
    }
    // False means not changed

    return false;
}
userSchema.methods.createPasswordResetToken = function () {

    // 1).Creating the reset token to send to the user
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log({ resetToken });
    // 2).Creating hash to save to the database
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // 10 minutes from now
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // This had to be sent through the email so returning it
    return resetToken;
    // One token sent through email and on that is hashed one is stored in the database
}
// Query middleware
userSchema.pre(/^find/, function (next) {
    // this points to the current query
    // Only find documents where active is set to true
    this.find({ active: { $ne: false } });

    next();
})
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;


// 1).
// USERS <---> REVIEWS
// review will contain the user id because one user can have many reviews
// review will contain the id of the user

// 2).
// TOURS <---> REVIEWS
// one tour can have multiple reviews
// So review will contain id of a tour

// 3).
//  TOURS <---> LOCATIONS
// Location will be embedded inside the tours
// Without location there are not tours

// 4).
// TOURS <---> USERS
// guide and lead-guide
// Tour will contain the user id if guide and other this stuff

// 5).
// USERS <---> BOOKINGS
// User buys the tour
// One user can book many tours
// One booking can only belong to one of the user


// 6). TOURS <---> BOOKINGS


// BOOKING is intermediate between user and tour
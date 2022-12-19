const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");

// Name , email , photo , password , passwordConfirm
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email!"],
        unique: true,
        // Transform email to the lower-case (not produce error)
        lowercase: true,
        // If provided email has the format of email
        // Custom validator : validator.isEmail
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        // This only works on SAVE AND CREATE
        validate: {
            validator: function (value) {
                return value == this.password
            },
            // This messsage will be returned if both password not equal
            message: "Passwords are not the same"
        }
    }
});

// 1).Mongoose middle-ware
// Encrypting the password when saving a new user and updating password
// When updated and created
userSchema.pre("save", async function (next) {
    // console.log("User middlware :", this);
    // Only encrypt the password if the password field is updated
    // If email changed we dont want to encrypt the password again
    // If the password has not been modified
    if (!this.isModified("password")) {
        return next();
    }
    // Encrypting the password using hashing
    // Hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Now we dont need this field 
    // We just needed it for comparing the two passwords
    this.confirmPassword = undefined;

    console.log("( User model )New user to be saved in database : ", this);
    next();
})

// Creating a instance method
// This functions returns true if the password are same and false if password are not the same
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // this points to the document
    // candidate password is the original password (not-hashed)
    // userPassword is the hashed password
    return await bcrypt.compare(candidatePassword, userPassword);

}

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;

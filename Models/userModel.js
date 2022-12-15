const mongoose = require('mongoose');
const validator = require('validator');

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
        validator: [validator.isEmail, "Please provide a valid email"]
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        minlength: 8
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"]
        // validate: {
        //     validator: function (value) {
        //         return value == this.password
        //     },
        //     // This messsage will be returned if both password not equal
        //     message: "Both password must match"
        // }
    }
});

const User = mongoose.model('users', userSchema);
module.exports = User;

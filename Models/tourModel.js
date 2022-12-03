const mongoose = require("mongoose");

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    ratingsAvg: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    // Array of strings
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date]
})

const Tour = mongoose.model("tours", tourSchema);

module.exports = Tour;
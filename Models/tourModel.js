const mongoose = require("mongoose");

const tourSchema = mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number
    },
    ratings: {
        type: Number
    }
})

const tourModel = mongoose.model("tours", tourSchema);

module.exports = tourModel;
const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");



// We can also build our customer validators, that returns true or false

// Schema and validators
const tourSchema = mongoose.Schema({
    name: {
        type: String,
        // Validator required is available for all the data- types
        required: [true, "A tour must have a name"],
        // Not really a validator (unique)
        unique: true,

        maxlength: [40, "A tour name must have less or equal than 40 characters"],
        minlength: [10, "A tour name must have more or equal than 10 characters"],
        // Validator will be run  , if spaces in name , it produces an error
        // validate: [validator.isAlpha, "Tour name must only contains characters"]
    },
    slug: String,
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        // Custom validator because cannot do with buildin validator
        validate: {
            validator: function (value) {
                // this only points to current document on new document creation
                return value < this.price
            },
            // This messsage will be returned if discount price greater then the actual price
            message: "Dicount price ({VALUE}) should be below the regular price"
        },
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        // reatings value will be between 1 and 5
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"],
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
        required: [true, "A tour must have a difficulty"],

        // A tour can only have these values.
        // enum only works for strings
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Diffiiculty is either : easy, medium,difficulty"
        }
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    secretTour: {
        type: Boolean,
        default: false

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
        default: Date.now(),
        select: false
    },
    startDates: [Date]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    })

// Not passed to the database and cannot be queried but only added when the document is fetched from the database
tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7;
})


// 1).Document middle-ware ------------------------------------->
// Mongoose also has the middle-ware
// Pre and post hooks
// Run functions before and after a event
// Document middle-ware acts on the currently processed document
// Runs before .save() command and .create() command
// This object points to the current processed document
// Will not work for insert many ,find one and update
tourSchema.pre("save", function (next) {

    // Adding a new property (slug) to the document before the document is saved to the database
    this.slug = slugify(this.name, { lower: true });
    next();
})
// tourSchema.pre("save", function (next) {
//     console.log("Will save document ...");
//     next();
// })
// Runs after the document is saved to the database
// tourSchema.post("save", function (doc, next) {
//     console.log("Finished document : ", doc);
//     next();
// })

// 2).Query middle-ware  ------------------------------------------------------------------------------------------------------->
// Not working for findOne
// Regular expression for making it run for all the commands starting with the find
// All these queries that starts with find , it will run for all those queries
// Runs before the query is executed
// This points to the current query
tourSchema.pre(/^find/, function (next) {
    // this contains the query
    this.find({ secretTour: { $ne: true } });

    // This is just a regular object so we can set a property to it just like we set to regular objects
    this.start = Date.now();
    next();
})
// Runs after the query is executed
// docs  has access to all the documents that were returned
// This points to the aggregation object
tourSchema.post(/^find/, function (docs, next) {
    console.log("(In tourSchema post )Query took : ", Date.now() - this.start, " milliseconds")
    // console.log("All docs : ", docs)
    next();
});

// 3).Aggregation middleware  ----------------------------------------------------------------------------------------------------------->
// This object points to the aggregation pipeline
tourSchema.pre("aggregate", function (next) {
    // Gives the aggregation object
    // console.log(this.pipeline())

    // Removing from the output all the documents that have secretTour:true
    // Adding another match at the end 
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

    // console.log(this.pipeline())


    next();
})

const Tour = mongoose.model("tours", tourSchema);

module.exports = Tour;
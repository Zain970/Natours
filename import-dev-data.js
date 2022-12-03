const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("./Models/tourModel");

// Reading environment variables
dotenv.config({ path: "./config.env" })

// Connecting with the database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(() => {
    console.log("*** Connected to the database ***");
}).catch((err) => {
    console.log("Error : ", err)
})

// Reading file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8"));

// console.log("Tours : ", tours)


const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded ");
        process.exit();
    }
    catch (err) {
        console.log("Error : ", err)
    }
}

// Delete all data from the database
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted ! ");
        process.exit();

    }
    catch (err) {
        console.log("Error : ", err)
    }
}

if (process.argv[2] == "--import") {
    importData();

}
else if (process.argv[2] == "--delete") {
    deleteData();
}

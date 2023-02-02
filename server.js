const dotenv = require("dotenv");
const mongoose = require("mongoose");


// Reading environment variables
dotenv.config({ path: "./config.env" })

const app = require("./app");

// Connecting with the database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(() => {
    console.log("*** CONNECTED TO THE DATABASE SUCCESSFULLY ***");
});
// Logging environment variables
// console.log(process.env);

// **************** SERVER LISTENING *******************
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log("*** SERVER LISTENING ON PORT", `${port}`, "*** ")
})

process.on("unhandledrejection", (err) => {
    console.log('UNHANDLED REJECTION SHUTTING DOWN ...');
    console.log(err.name, err.messgae);

    server.close(() => {
        process.exit(1);
    })
})

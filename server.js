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
    console.log("*** Connected to the database ***");
}).catch((err) => {
    console.log("Error : ", err)
})


// Logging environment variables
// console.log(process.env);

// **************** SERVER LISTENING *******************
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("*** Server listening in port ", `${port}`, "*** ")
})



// Test
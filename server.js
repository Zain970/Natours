const dotenv = require("dotenv");
// Reading environment variables
dotenv.config({ path: "./config.env" })

const app = require("./app");

// Logging environment variables
// console.log(process.env);

// **************** SERVER LISTENING *******************
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Server listening in port ", `${port}`)
})



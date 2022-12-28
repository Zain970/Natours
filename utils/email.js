const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1).Create a transporter (service that will send the email)
    // 2).Telling which client which we want to use and which account we want to use
    const transporter = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // 2).Define the email options
    const mailOptions = {
        from: "Zain Mughal <itszain20@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    // 3).Actually send the email
    await transporter.sendMail(mailOptions);

    console.log("-------- Email has been sent ----------");


}

module.exports = sendEmail;

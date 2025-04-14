const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host:'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});

module.exports = transporter;
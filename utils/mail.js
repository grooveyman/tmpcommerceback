const transporter = require('../config/mailConfig');

const sendMail = async (to, subject, html) => {
    try{
        const mailOptions ={
            from: `"AzuShop" ${process.env.SMTP_USER}`,
            to,
            subject,
            html,
        }
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return {success: true};
    }catch(error){
        console.log('Error sending email:', error.message);
        return {success:false, error: error.message};
    }
};

module.exports = sendMail;
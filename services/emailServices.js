const nodemailer = require("nodemailer");
module.exports = async ({ from, to, subject, text, html}) => {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: false, 
            auth: {
                user: process.env.AUTH_USER, 
                pass: process.env.AUTH_PASS, 
            },
        });

        // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `linkShare <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    });
}
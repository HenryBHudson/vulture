const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    //define options
    const emailOptions = {
        from: 'Vulture <henrybhudson@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
      };
    
      //send email
      await transporter.sendMail(emailOptions);
    
}

module.exports = sendEmail;